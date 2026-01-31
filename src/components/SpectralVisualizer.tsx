/**
 * ADVANCED SPECTRAL VISUALIZER
 * Shows FFT spectrum, frequency bands, and AI detection metrics
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Radar, Zap, AlertCircle, TrendingUp, Waves } from 'lucide-react';
import { performFFTAnalysis, FFTAnalysisResult } from '@/lib/fft-analysis';

interface SpectralVisualizerProps {
    imageBase64: string;
}

export default function SpectralVisualizer({ imageBase64 }: SpectralVisualizerProps) {
    const [fftData, setFFTData] = useState<FFTAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        setIsAnalyzing(true);
        setTimeout(() => {
            const result = performFFTAnalysis(imageBase64);
            setFFTData(result);
            setIsAnalyzing(false);
        }, 500);
    }, [imageBase64]);

    if (isAnalyzing || !fftData) {
        return (
            <div className="spectral-loading">
                <div className="loading-spinner"></div>
                <p>Performing FFT analysis...</p>
            </div>
        );
    }

    const maxSpectrum = Math.max(...fftData.spectrumData, 0.01);

    return (
        <div className="spectral-visualizer">
            {/* Header */}
            <div className="spectral-header">
                <div className="header-left">
                    <Waves size={24} />
                    <div>
                        <h3>Frequency Domain Analysis</h3>
                        <p>Real FFT/DFT spectral decomposition</p>
                    </div>
                </div>
                <div className="ai-score-badge" data-level={fftData.aiLikelihood > 0.7 ? 'high' : fftData.aiLikelihood > 0.4 ? 'medium' : 'low'}>
                    AI Likelihood: {(fftData.aiLikelihood * 100).toFixed(1)}%
                </div>
            </div>

            {/* Main Spectrum Graph */}
            <div className="spectrum-container">
                <div className="spectrum-graph">
                    <svg viewBox="0 0 500 200" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <defs>
                            <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal grid */}
                        {[0, 0.25, 0.5, 0.75, 1].map((y, i) => (
                            <line
                                key={`h-${i}`}
                                x1="0"
                                y1={y * 200}
                                x2="500"
                                y2={y * 200}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Spectrum bars */}
                        {fftData.spectrumData.map((magnitude, index) => {
                            const x = (index / fftData.spectrumData.length) * 500;
                            const barWidth = 500 / fftData.spectrumData.length;
                            const height = (magnitude / maxSpectrum) * 200;

                            return (
                                <rect
                                    key={index}
                                    x={x}
                                    y={200 - height}
                                    width={Math.max(barWidth - 1, 1)}
                                    height={height}
                                    fill="url(#spectrumGradient)"
                                    opacity={0.8}
                                />
                            );
                        })}

                        {/* Peak markers */}
                        {fftData.peakFrequencies.slice(0, 5).map((peak, i) => {
                            const x = peak.freq * 500;
                            const y = 200 - (peak.magnitude / maxSpectrum) * 200;

                            return (
                                <g key={`peak-${i}`}>
                                    <circle cx={x} cy={y} r="4" fill="#ef4444" />
                                    <line
                                        x1={x}
                                        y1={y}
                                        x2={x}
                                        y2="200"
                                        stroke="#ef4444"
                                        strokeWidth="1"
                                        strokeDasharray="3,3"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div className="spectrum-labels">
                    <span>DC (0 Hz)</span>
                    <span>Low</span>
                    <span>Mid</span>
                    <span>High</span>
                    <span>Nyquist</span>
                </div>
            </div>

            {/* Frequency Bands */}
            <div className="frequency-bands">
                <h4><Radar size={18} /> Frequency Band Distribution</h4>
                <div className="bands-grid">
                    <div className="band-item">
                        <div className="band-header">
                            <span className="band-label">Low Frequency</span>
                            <span className="band-value">{(fftData.frequencyBands.low * 100).toFixed(1)}%</span>
                        </div>
                        <div className="band-bar">
                            <motion.div
                                className="band-fill low"
                                initial={{ width: 0 }}
                                animate={{ width: `${fftData.frequencyBands.low * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                            />
                        </div>
                    </div>

                    <div className="band-item">
                        <div className="band-header">
                            <span className="band-label">Mid Frequency</span>
                            <span className="band-value">{(fftData.frequencyBands.mid * 100).toFixed(1)}%</span>
                        </div>
                        <div className="band-bar">
                            <motion.div
                                className="band-fill mid"
                                initial={{ width: 0 }}
                                animate={{ width: `${fftData.frequencyBands.mid * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            />
                        </div>
                    </div>

                    <div className="band-item">
                        <div className="band-header">
                            <span className="band-label">High Frequency</span>
                            <span className="band-value">{(fftData.frequencyBands.high * 100).toFixed(1)}%</span>
                        </div>
                        <div className="band-bar">
                            <motion.div
                                className="band-fill high"
                                initial={{ width: 0 }}
                                animate={{ width: `${fftData.frequencyBands.high * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            />
                        </div>
                    </div>

                    <div className="band-item">
                        <div className="band-header">
                            <span className="band-label">Very High Frequency</span>
                            <span className="band-value">{(fftData.frequencyBands.veryHigh * 100).toFixed(1)}%</span>
                        </div>
                        <div className="band-bar">
                            <motion.div
                                className="band-fill very-high"
                                initial={{ width: 0 }}
                                animate={{ width: `${fftData.frequencyBands.veryHigh * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
                <motion.div
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Zap size={20} />
                    <div className="metric-content">
                        <span className="metric-label">Periodicity</span>
                        <span className="metric-value">{(fftData.periodicityScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="metric-bar" style={{ '--value': `${fftData.periodicityScore * 100}%` } as React.CSSProperties}>
                        <div className="metric-bar-fill"></div>
                    </div>
                </motion.div>

                <motion.div
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Activity size={20} />
                    <div className="metric-content">
                        <span className="metric-label">Smoothness</span>
                        <span className="metric-value">{(fftData.smoothnessScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="metric-bar" style={{ '--value': `${fftData.smoothnessScore * 100}%` } as React.CSSProperties}>
                        <div className="metric-bar-fill"></div>
                    </div>
                </motion.div>

                <motion.div
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <TrendingUp size={20} />
                    <div className="metric-content">
                        <span className="metric-label">Spectral Entropy</span>
                        <span className="metric-value">{(fftData.spectralEntropy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="metric-bar" style={{ '--value': `${fftData.spectralEntropy * 100}%` } as React.CSSProperties}>
                        <div className="metric-bar-fill"></div>
                    </div>
                </motion.div>
            </div>

            {/* Peak Frequencies */}
            {fftData.peakFrequencies.length > 0 && (
                <div className="peak-frequencies">
                    <h4><AlertCircle size={18} /> Detected Peaks (Potential AI Signatures)</h4>
                    <div className="peaks-list">
                        {fftData.peakFrequencies.slice(0, 5).map((peak, i) => (
                            <motion.div
                                key={i}
                                className="peak-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <div className="peak-dot"></div>
                                <div className="peak-info">
                                    <span className="peak-freq">Frequency: {(peak.freq * 100).toFixed(1)}%</span>
                                    <span className="peak-mag">Magnitude: {(peak.magnitude * 100).toFixed(1)}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .spectral-visualizer {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-xl);
                }

                .spectral-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-xl);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                }

                .header-left h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    color: var(--text-primary);
                }

                .header-left p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .ai-score-badge {
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .ai-score-badge[data-level="high"] {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border: 1px solid #ef4444;
                }

                .ai-score-badge[data-level="medium"] {
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                    border: 1px solid #f59e0b;
                }

                .ai-score-badge[data-level="low"] {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                    border: 1px solid #22c55e;
                }

                .spectrum-container {
                    margin-bottom: var(--space-xl);
                }

                .spectrum-graph {
                    width: 100%;
                    height: 200px;
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: var(--radius-md);
                    padding: var(--space-md);
                    position: relative;
                }

                .spectrum-graph svg {
                    width: 100%;
                    height: 100%;
                }

                .spectrum-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: var(--space-sm);
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .frequency-bands {
                    margin: var(--space-xl) 0;
                }

                .frequency-bands h4 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: var(--space-md);
                    color: var(--text-primary);
                }

                .bands-grid {
                    display: grid;
                    gap: var(--space-md);
                }

                .band-item {
                    background: var(--bg-secondary);
                    padding: var(--space-md);
                    border-radius: var(--radius-md);
                }

                .band-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }

                .band-label {
                    color: var(--text-secondary);
                }

                .band-value {
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .band-bar {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .band-fill {
                    height: 100%;
                    border-radius: 4px;
                }

                .band-fill.low {
                    background: linear-gradient(90deg, #22c55e, #10b981);
                }

                .band-fill.mid {
                    background: linear-gradient(90deg, #3b82f6, #2563eb);
                }

                .band-fill.high {
                    background: linear-gradient(90deg, #f59e0b, #d97706);
                }

                .band-fill.very-high {
                    background: linear-gradient(90deg, #ef4444, #dc2626);
                }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--space-md);
                    margin: var(--space-xl) 0;
                }

                .metric-card {
                    background: var(--bg-secondary);
                    padding: var(--space-md);
                    border-radius: var(--radius-md);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                }

                .metric-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .metric-label {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .metric-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--primary-400);
                }

                .metric-bar {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                    position: relative;
                }

                .metric-bar-fill {
                    height: 100%;
                    width: var(--value);
                    background: linear-gradient(90deg, #8b5cf6, #6366f1);
                    border-radius: 3px;
                    transition: width 1s ease;
                }

                .peak-frequencies h4 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: var(--space-md);
                    color: var(--text-primary);
                }

                .peaks-list {
                    display: grid;
                    gap: var(--space-sm);
                }

                .peak-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-sm) var(--space-md);
                    background: var(--bg-secondary);
                    border-radius: var(--radius-md);
                    border-left: 3px solid #ef4444;
                }

                .peak-dot {
                    width: 10px;
                    height: 10px;
                    background: #ef4444;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #ef4444;
                }

                .peak-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    font-size: 0.85rem;
                }

                .peak-freq {
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .peak-mag {
                    color: var(--text-secondary);
                }

                .spectral-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-2xl);
                    gap: var(--space-md);
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(139, 92, 246, 0.3);
                    border-top-color: #8b5cf6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
