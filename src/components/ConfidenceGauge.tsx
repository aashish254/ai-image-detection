'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import { getVerdictLabel } from '@/lib/utils';

interface ConfidenceGaugeProps {
    score: number;
    verdict: AnalysisResult['verdict'];
}

export default function ConfidenceGauge({ score, verdict }: ConfidenceGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const { color } = getVerdictLabel(verdict);

    useEffect(() => {
        // Animate score from 0 to actual value
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);

            setAnimatedScore(score * eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [score]);

    // SVG gauge parameters
    const size = 200;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * Math.PI; // Half circle
    const offset = circumference - (animatedScore * circumference);

    // Determine color based on score
    const getGradientColors = () => {
        if (animatedScore >= 0.7) {
            return ['#ef4444', '#f97316']; // Red to orange (AI)
        } else if (animatedScore >= 0.4) {
            return ['#f59e0b', '#eab308']; // Orange to yellow (Uncertain)
        } else {
            return ['#22c55e', '#10b981']; // Green (Real)
        }
    };

    const [color1, color2] = getGradientColors();
    const percentage = Math.round(animatedScore * 100);

    return (
        <div className="gauge-container">
            <div className="gauge-wrapper">
                <svg
                    width={size}
                    height={size / 2 + 20}
                    viewBox={`0 0 ${size} ${size / 2 + 20}`}
                >
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color1} />
                            <stop offset="100%" stopColor={color2} />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background arc */}
                    <path
                        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                        fill="none"
                        stroke="var(--bg-tertiary)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />

                    {/* Progress arc */}
                    <motion.path
                        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        filter="url(#glow)"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />

                    {/* Center text */}
                    <text
                        x={size / 2}
                        y={size / 2 - 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="gauge-percentage"
                    >
                        {percentage}%
                    </text>
                    <text
                        x={size / 2}
                        y={size / 2 + 15}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="gauge-label"
                    >
                        AI Likelihood
                    </text>
                </svg>
            </div>

            {/* Legend */}
            <div className="gauge-legend">
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#22c55e' }}></span>
                    <span>0-35% Real</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#eab308' }}></span>
                    <span>35-65% Uncertain</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#ef4444' }}></span>
                    <span>65-100% AI</span>
                </div>
            </div>

            <style jsx>{`
        .gauge-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gauge-wrapper {
          position: relative;
        }

        .gauge-wrapper :global(.gauge-percentage) {
          font-size: 2.5rem;
          font-weight: 700;
          fill: var(--text-primary);
        }

        .gauge-wrapper :global(.gauge-label) {
          font-size: 0.85rem;
          fill: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .gauge-legend {
          display: flex;
          gap: var(--space-lg);
          margin-top: var(--space-md);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }

        @media (max-width: 768px) {
          .gauge-legend {
            flex-direction: column;
            align-items: center;
            gap: var(--space-sm);
          }
        }
      `}</style>
        </div>
    );
}
