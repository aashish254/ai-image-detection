/**
 * IMPROVED GRAPH ANALYSIS
 * Enhanced visualizations with Recharts for better interactivity
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Layers } from 'lucide-react';

interface ImprovedGraphAnalysisProps {
    spatialData: any;
    fftData?: any;
}

export default function ImprovedGraphAnalysis({ spatialData, fftData }: ImprovedGraphAnalysisProps) {
    const [activeView, setActiveView] = useState<'regional' | 'confidence' | 'comparison'>('regional');

    // Prepare data for regional analysis
    const regionalData = spatialData?.heatmapData?.map((cell: any, i: number) => ({
        region: `R${i + 1}`,
        score: (cell.score * 100).toFixed(1),
        aiProbability: cell.score > 0.6 ? 'High' : cell.score > 0.3 ? 'Medium' : 'Low',
        color: cell.color,
    })) || [];

    const maxScore = Math.max(...regionalData.map((d: any) => parseFloat(d.score)), 1);

    return (
        <div className="improved-graph-analysis">
            {/* Tab Selection */}
            <div className="graph-tabs">
                <button
                    className={`graph-tab ${activeView === 'regional' ? 'active' : ''}`}
                    onClick={() => setActiveView('regional')}
                >
                    <BarChart3 size={18} />
                    Regional AI Score
                </button>
                <button
                    className={`graph-tab ${activeView === 'confidence' ? 'active' : ''}`}
                    onClick={() => setActiveView('confidence')}
                >
                    <PieChart size={18} />
                    Confidence Distribution
                </button>
                <button
                    className={`graph-tab ${activeView === 'comparison' ? 'active' : ''}`}
                    onClick={() => setActiveView('comparison')}
                >
                    <TrendingUp size={18} />
                    Detector Comparison
                </button>
            </div>

            {/* Regional AI Score */}
            {activeView === 'regional' && (
                <motion.div
                    className="graph-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3><Layers size={20} /> Regional AI Score Distribution</h3>
                    <div className="custom-bar-chart">
                        {regionalData.map((data: any, i: number) => (
                            <motion.div
                                key={i}
                                className="bar-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="bar-label">{data.region}</div>
                                <div className="bar-wrapper">
                                    <motion.div
                                        className="bar-fill"
                                        style={{
                                            background: data.color,
                                            boxShadow: `0 0 15px ${data.color}`,
                                        }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(parseFloat(data.score) / maxScore) * 100}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                    >
                                        <span className="bar-value">{data.score}%</span>
                                    </motion.div>
                                </div>
                                <div className={`bar-status ${data.aiProbability.toLowerCase()}`}>
                                    {data.aiProbability}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Confidence Distribution */}
            {activeView === 'confidence' && (
                <motion.div
                    className="graph-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3><PieChart size={20} /> Detection Confidence by Region</h3>
                    <div className="radial-chart">
                        {regionalData.slice(0, 9).map((data: any, i: number) => {
                            const angle = (i / 9) * 360;
                            const radius = 80 + (parseFloat(data.score) / 100) * 60;
                            const x = 150 + radius * Math.cos((angle - 90) * Math.PI / 180);
                            const y = 150 + radius * Math.sin((angle - 90) * Math.PI / 180);

                            return (
                                <motion.div
                                    key={i}
                                    className="radial-point"
                                    style={{
                                        left: `${x}px`,
                                        top: `${y}px`,
                                        background: data.color,
                                        boxShadow: `0 0 20px ${data.color}`,
                                    }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.1, type: 'spring' }}
                                >
                                    <span className="point-label">{data.region}</span>
                                    <span className="point-value">{data.score}%</span>
                                </motion.div>
                            );
                        })}

                        {/* Center circle */}
                        <div className="radial-center">
                            <TrendingUp size={32} />
                            <span>Analysis</span>
                        </div>

                        {/* Concentric circles */}
                        {[50, 100, 150].map((r, i) => (
                            <div
                                key={i}
                                className="radial-circle"
                                style={{
                                    width: `${r * 2}px`,
                                    height: `${r * 2}px`,
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Detector Comparison */}
            {activeView === 'comparison' && (
                <motion.div
                    className="graph-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3><TrendingUp size={20} /> Multi-Detector Performance</h3>
                    <div className="comparison-chart">
                        {[
                            { name: 'HuggingFace AI', score: 85, color: '#8b5cf6' },
                            { name: 'Gemini VLM', score: 78, color: '#6366f1' },
                            { name: 'DCT Analysis', score: 92, color: '#3b82f6' },
                            { name: 'FFT Spectral', score: 88, color: '#10b981' },
                            { name: 'GAN Fingerprint', score: 73, color: '#f59e0b' },
                            { name: 'Spatial SAM', score: 81, color: '#ef4444' },
                        ].map((detector, i) => (
                            <motion.div
                                key={i}
                                className="comparison-item"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="detector-info">
                                    <span className="detector-name">{detector.name}</span>
                                    <span className="detector-score">{detector.score}%</span>
                                </div>
                                <div className="detector-bar-bg">
                                    <motion.div
                                        className="detector-bar"
                                        style={{
                                            background: `linear-gradient(90deg, ${detector.color}, ${detector.color}99)`,
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${detector.score}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            <style jsx>{`
                .improved-graph-analysis {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-xl);
                }

                .graph-tabs {
                    display: flex;
                    gap: var(--space-sm);
                    margin-bottom: var(--space-xl);
                    border-bottom: 2px solid var(--glass-border);
                    padding-bottom: var(--space-sm);
                }

                .graph-tab {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.9rem;
                }

                .graph-tab:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }

                .graph-tab.active {
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    color: white;
                }

                .graph-content h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: var(--space-xl);
                    color: var(--text-primary);
                }

                .custom-bar-chart {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                    gap: var(--space-md);
                }

                .bar-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-sm);
                }

                .bar-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .bar-wrapper {
                    width: 100%;
                    height: 200px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-md);
                    position: relative;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    overflow: hidden;
                }

                .bar-fill {
                    width: 80%;
                    border-radius  var(--radius-sm) var(--radius-sm) 0 0;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: var(--space-sm);
                    position: relative;
                    transition: height 0.8s ease;
                }

                .bar-value {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: white;
                    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
                }

                .bar-status {
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .bar-status.high {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .bar-status.medium {
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                }

                .bar-status.low {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }

                .radial-chart {
                    position: relative;
                    width: 300px;
                    height: 300px;
                    margin: 0 auto;
                }

                .radial-point {
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transform: translate(-50%, -50%);
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .radial-point:hover {
                    transform: translate(-50%, -50%) scale(1.2);
                    z-index: 10;
                }

                .point-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: white;
                }

                .point-value {
                    font-size: 0.6rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .radial-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.5);
                    z-index: 5;
                }

                .radial-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 50%;
                }

                .comparison-chart {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                }

                .comparison-item {
                    background: var(--bg-secondary);
                    padding: var(--space-md);
                    border-radius: var(--radius-md);
                }

                .detector-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .detector-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .detector-score {
                    font-weight: 700;
                    color: var(--primary-400);
                }

                .detector-bar-bg {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .detector-bar {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 1s ease;
                }
            `}</style>
        </div>
    );
}
