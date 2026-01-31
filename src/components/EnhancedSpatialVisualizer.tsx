/**
 * ENHANCED SPATIAL HEATMAP - Real Frequency Analysis
 * 
 * This component visualizes:
 * - High-frequency noise fingerprints (DFT/FFT-style analysis)
 * - Reconstruction error hotspots
 * - Grid-like pattern detection
 * - AI generation artifacts
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Map, Activity, AlertCircle, Sparkles } from 'lucide-react';
import { generateEnhancedHeatmap, EnhancedHeatmapData } from '@/lib/enhanced-heatmap';

interface EnhancedSpatialVisualizerProps {
    imageBase64: string;
    imageUrl?: string;
}

export default function EnhancedSpatialVisualizer({ imageBase64, imageUrl }: EnhancedSpatialVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [heatmapData, setHeatmapData] = useState<EnhancedHeatmapData | null>(null);
    const [showDots, setShowDots] = useState(true);

    useEffect(() => {
        // Generate enhanced heatmap
        const data = generateEnhancedHeatmap(imageBase64);
        setHeatmapData(data);
    }, [imageBase64]);

    useEffect(() => {
        if (!canvasRef.current || !heatmapData) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const displaySize = 600;
        canvas.width = displaySize;
        canvas.height = displaySize;

        // Clear canvas
        ctx.clearRect(0, 0, displaySize, displaySize);

        // Load and draw background image if available
        if (imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.globalAlpha = 0.6;
                ctx.drawImage(img, 0, 0, displaySize, displaySize);
                ctx.globalAlpha = 1.0;
                drawHeatmap();
            };
            img.onerror = () => {
                // If image fails to load, just draw heatmap
                drawHeatmap();
            };
            img.src = imageUrl;
        } else {
            drawHeatmap();
        }

        function drawHeatmap() {
            if (!ctx || !heatmapData) return;

            const scaleX = displaySize / heatmapData.width;
            const scaleY = displaySize / heatmapData.height;

            // Draw main heatmap regions (blurred blobs)
            for (const point of heatmapData.points) {
                // Skip small frequency dots in this pass
                if (point.type === 'frequency' && showDots) continue;

                const x = point.x * scaleX;
                const y = point.y * scaleY;
                const radius = 30;

                // Color based on type
                let color = '';
                if (point.type === 'frequency') {
                    color = `rgba(139, 92, 246, ${point.intensity * 0.7})`;
                } else if (point.type === 'reconstruction') {
                    color = `rgba(239, 68, 68, ${point.intensity * 0.7})`;
                } else if (point.type === 'grid') {
                    color = `rgba(245, 158, 11, ${point.intensity * 0.7})`;
                } else {
                    color = `rgba(34, 197, 94, ${point.intensity * 0.4})`;
                }

                // Gradient blob
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, color.replace(/[0-9.]+\)$/, '0)'));
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw noise dots if toggle is ON
            if (showDots) {
                // Draw dots for high-intensity frequency points
                for (const point of heatmapData.points) {
                    if (point.type === 'frequency' && point.intensity > 0.4) {
                        const x = point.x * scaleX;
                        const y = point.y * scaleY;
                        const radius = 3 + point.intensity * 4; // Size based on intensity

                        // Purple dot with glow
                        ctx.fillStyle = `rgba(139, 92, 246, ${point.intensity})`;
                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, Math.PI * 2);
                        ctx.fill();

                        // Outer ring for high-intensity dots
                        if (point.intensity > 0.7) {
                            ctx.strokeStyle = `rgba(139, 92, 246, ${point.intensity * 0.8})`;
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                    }
                }

                // Add extra dots in high-intensity anomaly regions
                for (const region of heatmapData.anomalyRegions) {
                    if (region.severity > 0.6) {
                        const numDots = Math.floor(region.severity * 15); // More dots for higher severity
                        for (let i = 0; i < numDots; i++) {
                            const dotX = (region.x + Math.random() * region.width) * scaleX;
                            const dotY = (region.y + Math.random() * region.height) * scaleY;
                            const dotRadius = 2 + Math.random() * 3;

                            ctx.fillStyle = `rgba(139, 92, 246, ${0.6 + Math.random() * 0.4})`;
                            ctx.beginPath();
                            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            }

            // Draw anomaly region borders
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            for (const region of heatmapData.anomalyRegions) {
                if (region.severity > 0.5) {
                    ctx.strokeRect(
                        region.x * scaleX,
                        region.y * scaleY,
                        region.width * scaleX,
                        region.height * scaleY
                    );
                }
            }
        }
    }, [heatmapData, imageUrl, showDots]);

    if (!heatmapData) {
        return <div className="loading-heatmap">Generating enhanced heatmap...</div>;
    }

    return (
        <div className="enhanced-spatial-visualizer">
            <div className="visualizer-header">
                <div className="header-info">
                    <Map size={24} />
                    <div>
                        <h3>Spatial Artifact Analysis</h3>
                        <p>Advanced frequency & reconstruction error mapping</p>
                    </div>
                </div>
                <div className="controls">
                    <button
                        className={`toggle-btn ${showDots ? 'active' : ''}`}
                        onClick={() => setShowDots(!showDots)}
                    >
                        <Sparkles size={16} />
                        Show Noise Dots
                    </button>
                </div>
            </div>

            <div className="visualizer-canvas-container">
                <canvas ref={canvasRef} className="heatmap-canvas" />

                {/* Legend */}
                <div className="heatmap-legend">
                    <div className="legend-item">
                        <div className="legend-dot frequency"></div>
                        <span>High-Frequency Noise</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot reconstruction"></div>
                        <span>Reconstruction Error</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot grid"></div>
                        <span>Grid Pattern</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot normal"></div>
                        <span>Normal</span>
                    </div>
                </div>

                {/* Intensity scale */}
                <div className="intensity-scale">
                    <span>0% - Real</span>
                    <div className="scale-gradient"></div>
                    <span>100% - AI</span>
                </div>
            </div>

            {/* Anomaly List */}
            {heatmapData.anomalyRegions.length > 0 && (
                <div className="anomaly-list">
                    <h4><AlertCircle size={18} /> Detected Anomalies</h4>
                    <div className="anomaly-items">
                        {heatmapData.anomalyRegions.slice(0, 5).map((region, i) => (
                            <motion.div
                                key={i}
                                className="anomaly-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Activity size={16} />
                                <div className="anomaly-info">
                                    <span className="anomaly-type">{region.type}</span>
                                    <span className="anomaly-severity">
                                        Severity: {(region.severity * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .enhanced-spatial-visualizer {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-xl);
                }

                .visualizer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-lg);
                }

                .header-info {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                }

                .header-info h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    color: var(--text-primary);
                }

                .header-info p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .toggle-btn.active {
                    background: linear-gradient(135deg, #8b5cf6, #a855f7);
                    color: white;
                    border-color: transparent;
                }

                .visualizer-canvas-container {
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .heatmap-canvas {
                    width: 100%;
                    border-radius: var(--radius-md);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                .heatmap-legend {
                    display: flex;
                    justify-content: center;
                    gap: var(--space-lg);
                    margin-top: var(--space-md);
                    flex-wrap: wrap;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .legend-dot {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                .legend-dot.frequency {
                    background: #8b5cf6;
                }

                .legend-dot.reconstruction {
                    background: #ef4444;
                }

                .legend-dot.grid {
                    background: #f59e0b;
                }

                .legend-dot.normal {
                    background: #22c55e;
                }

                .intensity-scale {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    margin-top: var(--space-md);
                    justify-content: center;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .scale-gradient {
                    width: 200px;
                    height: 12px;
                    border-radius: 6px;
                    background: linear-gradient(to right, #22c55e, #f59e0b, #ef4444);
                }

                .anomaly-list {
                    margin-top: var(--space-xl);
                    padding-top: var(--space-lg);
                    border-top: 1px solid var(--glass-border);
                }

                .anomaly-list h4 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: var(--space-md);
                    color: var(--text-primary);
                }

                .anomaly-items {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                }

                .anomaly-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-md);
                    background: var(--bg-secondary);
                    border-radius: var(--radius-md);
                    border-left: 3px solid #ef4444;
                }

                .anomaly-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .anomaly-type {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }

                .anomaly-severity {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .loading-heatmap {
                    padding: var(--space-xl);
                    text-align: center;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
