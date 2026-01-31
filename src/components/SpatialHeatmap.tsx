'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, AlertCircle, Grid3X3, Eye, EyeOff, Layers,
  Target, Scan, Activity, BarChart3, CircleDot, Crosshair
} from 'lucide-react';
import { SpatialAnalysisResult, HeatmapCell, Hotspot } from '@/lib/types';

interface SpatialHeatmapProps {
  spatialAnalysis: SpatialAnalysisResult;
  imageUrl?: string;
}

// Generate face detection points for visualization
const generateFaceDetectionPoints = () => {
  const points = [];
  // Facial landmark positions (normalized 0-1)
  const landmarks = {
    leftEye: { x: 0.35, y: 0.35 },
    rightEye: { x: 0.65, y: 0.35 },
    nose: { x: 0.5, y: 0.5 },
    leftMouth: { x: 0.35, y: 0.7 },
    rightMouth: { x: 0.65, y: 0.7 },
    chin: { x: 0.5, y: 0.85 },
    leftCheek: { x: 0.25, y: 0.55 },
    rightCheek: { x: 0.75, y: 0.55 },
    forehead: { x: 0.5, y: 0.15 },
    leftEar: { x: 0.15, y: 0.4 },
    rightEar: { x: 0.85, y: 0.4 },
  };

  // Create mesh connections
  const connections = [
    ['leftEye', 'rightEye'],
    ['leftEye', 'nose'],
    ['rightEye', 'nose'],
    ['nose', 'leftMouth'],
    ['nose', 'rightMouth'],
    ['leftMouth', 'rightMouth'],
    ['leftMouth', 'chin'],
    ['rightMouth', 'chin'],
    ['leftEye', 'leftCheek'],
    ['rightEye', 'rightCheek'],
    ['leftEye', 'forehead'],
    ['rightEye', 'forehead'],
    ['forehead', 'leftEar'],
    ['forehead', 'rightEar'],
  ];

  return { landmarks, connections };
};

export default function SpatialHeatmap({ spatialAnalysis, imageUrl }: SpatialHeatmapProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFaceDetection, setShowFaceDetection] = useState(true);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'graph' | 'metrics'>('heatmap');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const faceData = generateFaceDetectionPoints();

  // Generate chart data from heatmap cells
  const chartData = spatialAnalysis.heatmapData.map((cell, i) => ({
    region: `R${i + 1}`,
    score: cell.score,
    color: cell.color
  }));

  // Calculate statistics
  const avgScore = spatialAnalysis.heatmapData.reduce((a, b) => a + b.score, 0) / spatialAnalysis.heatmapData.length;
  const maxScore = Math.max(...spatialAnalysis.heatmapData.map(c => c.score));
  const minScore = Math.min(...spatialAnalysis.heatmapData.map(c => c.score));
  const variance = spatialAnalysis.heatmapData.reduce((a, b) => a + Math.pow(b.score - avgScore, 2), 0) / spatialAnalysis.heatmapData.length;

  const getSeverityIcon = (severity: Hotspot['severity']) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.7) return '#ef4444';
    if (score > 0.4) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <motion.div
      className="spatial-heatmap-pro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="heatmap-header">
        <div className="header-left">
          <div className="header-icon">
            <Scan size={24} />
          </div>
          <div>
            <h3>Spatial Artifact Analysis</h3>
            <p className="subtitle">Advanced region-based AI detection mapping</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="novel-badge">
            <CircleDot size={12} />
            NOVEL SAM
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('heatmap')}
        >
          <Map size={16} />
          Heatmap
        </button>
        <button
          className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
          onClick={() => setActiveTab('graph')}
        >
          <BarChart3 size={16} />
          Graph Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <Activity size={16} />
          Metrics
        </button>
      </div>

      {/* Composite Warning */}
      {spatialAnalysis.isLikelyComposite && (
        <motion.div
          className="composite-warning"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle size={20} />
          <div>
            <strong>⚠️ Composite Image Detected</strong>
            <p>Different regions show varying AI generation levels - possible partial edit or splicing detected.</p>
          </div>
        </motion.div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'heatmap' && (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="tab-content"
          >
            {/* Controls */}
            <div className="controls-bar">
              <button
                className={`control-btn ${showHeatmap ? 'active' : ''}`}
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                {showHeatmap ? <Eye size={16} /> : <EyeOff size={16} />}
                Heatmap
              </button>
              <button
                className={`control-btn ${showFaceDetection ? 'active' : ''}`}
                onClick={() => setShowFaceDetection(!showFaceDetection)}
              >
                <Crosshair size={16} />
                Face Mesh
              </button>
            </div>

            {/* Main Visualization */}
            <div className="visualization-container">
              <div className="heatmap-grid">
                {imageUrl && (
                  <div className="image-background" style={{ backgroundImage: `url(${imageUrl})` }} />
                )}

                {/* Scanning Line Animation */}
                <motion.div
                  className="scan-line"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />

                {/* Face Detection Mesh */}
                <AnimatePresence>
                  {showFaceDetection && (
                    <motion.div
                      className="face-detection-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Face mesh lines */}
                      <svg className="face-mesh-svg" viewBox="0 0 100 100">
                        {faceData.connections.map((conn, i) => {
                          const start = faceData.landmarks[conn[0] as keyof typeof faceData.landmarks];
                          const end = faceData.landmarks[conn[1] as keyof typeof faceData.landmarks];
                          return (
                            <motion.line
                              key={i}
                              x1={start.x * 100}
                              y1={start.y * 100}
                              x2={end.x * 100}
                              y2={end.y * 100}
                              stroke="rgba(99, 102, 241, 0.6)"
                              strokeWidth="0.5"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ delay: i * 0.1, duration: 0.5 }}
                            />
                          );
                        })}

                        {/* Face landmark points */}
                        {Object.entries(faceData.landmarks).map(([key, point], i) => (
                          <motion.circle
                            key={key}
                            cx={point.x * 100}
                            cy={point.y * 100}
                            r="2"
                            fill="#6366f1"
                            stroke="white"
                            strokeWidth="0.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 1] }}
                            transition={{ delay: i * 0.08, duration: 0.3 }}
                          />
                        ))}
                      </svg>

                      {/* Eye detection boxes */}
                      <motion.div
                        className="detection-box eye-left"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <span>LEFT EYE</span>
                      </motion.div>
                      <motion.div
                        className="detection-box eye-right"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <span>RIGHT EYE</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Heatmap Overlay with Dots */}
                <AnimatePresence>
                  {showHeatmap && (
                    <motion.div
                      className="heatmap-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {spatialAnalysis.heatmapData.map((cell, index) => (
                        <motion.div
                          key={index}
                          className={`heatmap-cell ${selectedCell === cell ? 'selected' : ''}`}
                          style={{
                            left: `${cell.x * 100}%`,
                            top: `${cell.y * 100}%`,
                            width: `${cell.width * 100}%`,
                            height: `${cell.height * 100}%`,
                            backgroundColor: cell.color,
                            opacity: cell.opacity * 0.6,
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedCell(selectedCell === cell ? null : cell)}
                        >
                          {/* AI Concentration Dot */}
                          {cell.score > 0.5 && (
                            <motion.div
                              className="ai-dot"
                              style={{
                                backgroundColor: getScoreColor(cell.score),
                                boxShadow: `0 0 ${cell.score * 20}px ${getScoreColor(cell.score)}`,
                              }}
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.8, 1, 0.8]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          <span className="cell-score">{(cell.score * 100).toFixed(0)}%</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hotspot Markers */}
                {spatialAnalysis.hotspots.map((hotspot, i) => (
                  <motion.div
                    key={i}
                    className={`hotspot-marker severity-${hotspot.severity}`}
                    style={{
                      left: `${20 + i * 20}%`,
                      top: `${30 + (i % 3) * 20}%`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: [1, 1.2, 1],
                      boxShadow: hotspot.severity === 'high'
                        ? ['0 0 0px rgba(239, 68, 68, 0.8)', '0 0 20px rgba(239, 68, 68, 0.8)', '0 0 0px rgba(239, 68, 68, 0.8)']
                        : undefined
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Target size={16} />
                  </motion.div>
                ))}

                {/* Corner Brackets */}
                <div className="corner-bracket top-left" />
                <div className="corner-bracket top-right" />
                <div className="corner-bracket bottom-left" />
                <div className="corner-bracket bottom-right" />
              </div>

              {/* Legend */}
              <div className="heatmap-legend">
                <div className="legend-gradient" />
                <div className="legend-labels">
                  <span>0% - Real</span>
                  <span>50%</span>
                  <span>100% - AI</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'graph' && (
          <motion.div
            key="graph"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="tab-content"
          >
            {/* Region Analysis Bar Chart */}
            <div className="chart-container">
              <h4>
                <BarChart3 size={18} />
                Regional AI Score Distribution
              </h4>
              <div className="bar-chart">
                {chartData.map((item, i) => (
                  <motion.div
                    key={i}
                    className="bar-item"
                    initial={{ height: 0 }}
                    animate={{ height: `${item.score * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <div
                      className="bar"
                      style={{ backgroundColor: getScoreColor(item.score) }}
                    >
                      <span className="bar-value">{(item.score * 100).toFixed(0)}%</span>
                    </div>
                    <span className="bar-label">{item.region}</span>
                  </motion.div>
                ))}
              </div>
              <div className="chart-threshold">
                <div className="threshold-line" style={{ bottom: '50%' }}>
                  <span>Threshold (50%)</span>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="radar-container">
              <h4>
                <Activity size={18} />
                Detection Confidence by Region
              </h4>
              <div className="radar-chart">
                <svg viewBox="0 0 200 200">
                  {/* Background circles */}
                  {[0.25, 0.5, 0.75, 1].map((level, i) => (
                    <circle
                      key={i}
                      cx="100"
                      cy="100"
                      r={level * 80}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Data polygon */}
                  <motion.polygon
                    points={chartData.map((item, i) => {
                      const angle = (i / chartData.length) * 2 * Math.PI - Math.PI / 2;
                      const r = item.score * 80;
                      const x = 100 + r * Math.cos(angle);
                      const y = 100 + r * Math.sin(angle);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="rgba(99, 102, 241, 0.3)"
                    stroke="#6366f1"
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />

                  {/* Data points */}
                  {chartData.map((item, i) => {
                    const angle = (i / chartData.length) * 2 * Math.PI - Math.PI / 2;
                    const r = item.score * 80;
                    const x = 100 + r * Math.cos(angle);
                    const y = 100 + r * Math.sin(angle);
                    return (
                      <motion.circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="5"
                        fill={getScoreColor(item.score)}
                        stroke="white"
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'metrics' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="tab-content"
          >
            {/* OpenCV-style Parameters */}
            <div className="opencv-metrics">
              <h4>
                <Grid3X3 size={18} />
                Computer Vision Parameters
              </h4>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-label">Mean Score</div>
                  <motion.div
                    className="metric-value"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {(avgScore * 100).toFixed(1)}%
                  </motion.div>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill"
                      style={{ backgroundColor: getScoreColor(avgScore) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${avgScore * 100}%` }}
                    />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-label">Max Score</div>
                  <motion.div className="metric-value danger">
                    {(maxScore * 100).toFixed(1)}%
                  </motion.div>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill danger"
                      initial={{ width: 0 }}
                      animate={{ width: `${maxScore * 100}%` }}
                    />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-label">Min Score</div>
                  <motion.div className="metric-value success">
                    {(minScore * 100).toFixed(1)}%
                  </motion.div>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill success"
                      initial={{ width: 0 }}
                      animate={{ width: `${minScore * 100}%` }}
                    />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-label">Variance</div>
                  <motion.div className="metric-value">
                    σ² = {variance.toFixed(4)}
                  </motion.div>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill warning"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(variance * 500, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-label">Uniformity</div>
                  <motion.div className="metric-value">
                    {(spatialAnalysis.uniformityScore * 100).toFixed(1)}%
                  </motion.div>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${spatialAnalysis.uniformityScore * 100}%` }}
                    />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-label">Hotspots</div>
                  <motion.div className="metric-value highlight">
                    {spatialAnalysis.hotspots.length} detected
                  </motion.div>
                  <div className="hotspot-dots">
                    {spatialAnalysis.hotspots.map((h, i) => (
                      <span key={i} className={`dot ${h.severity}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detection Matrix */}
            <div className="detection-matrix">
              <h4>
                <Layers size={18} />
                Region Detection Matrix
              </h4>
              <div className="matrix-grid">
                {spatialAnalysis.heatmapData.map((cell, i) => (
                  <motion.div
                    key={i}
                    className="matrix-cell"
                    style={{
                      backgroundColor: cell.color,
                      opacity: 0.3 + cell.score * 0.7
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    title={`Region ${i + 1}: ${(cell.score * 100).toFixed(0)}%`}
                  >
                    {(cell.score * 100).toFixed(0)}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotspots List */}
      {spatialAnalysis.hotspots.length > 0 && (
        <div className="hotspots-section">
          <h4>
            <Target size={16} />
            Detected Anomaly Regions
          </h4>
          <div className="hotspots-list">
            {spatialAnalysis.hotspots.map((hotspot, index) => (
              <motion.div
                key={index}
                className={`hotspot-item severity-${hotspot.severity}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="hotspot-icon">{getSeverityIcon(hotspot.severity)}</span>
                <div className="hotspot-info">
                  <span className="hotspot-region">{hotspot.region}</span>
                  <span className="hotspot-score">{(hotspot.score * 100).toFixed(0)}% AI Probability</span>
                </div>
                {hotspot.anomalies.length > 0 && (
                  <div className="hotspot-anomalies">
                    {hotspot.anomalies.slice(0, 2).map((anomaly, i) => (
                      <span key={i} className="anomaly-tag">{anomaly}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="spatial-explanation">
        <p>{spatialAnalysis.spatialExplanation}</p>
      </div>

      <style jsx>{`
        .spatial-heatmap-pro {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .heatmap-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px;
          color: white;
        }

        .heatmap-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .subtitle {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .novel-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 20px;
          letter-spacing: 0.05em;
        }

        .tab-nav {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.25rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
        }

        .composite-warning {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          margin-bottom: 1rem;
          color: #ef4444;
        }

        .composite-warning strong { display: block; margin-bottom: 0.25rem; }
        .composite-warning p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }

        .controls-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn:hover, .control-btn.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
          color: #a5b4fc;
        }

        .visualization-container {
          margin-bottom: 1.5rem;
        }

        .heatmap-grid {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .image-background {
          position: absolute;
          inset: 0;
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.7;
        }

        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.8), transparent);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
          pointer-events: none;
          z-index: 15;
        }

        .face-detection-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
        }

        .face-mesh-svg {
          width: 100%;
          height: 100%;
        }

        .detection-box {
          position: absolute;
          padding: 2px 8px;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid #6366f1;
          border-radius: 4px;
          font-size: 0.6rem;
          color: #a5b4fc;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .detection-box.eye-left { left: 25%; top: 30%; }
        .detection-box.eye-right { right: 25%; top: 30%; }

        .heatmap-overlay {
          position: absolute;
          inset: 0;
        }

        .heatmap-cell {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .heatmap-cell:hover { transform: scale(1.02); z-index: 5; }
        .heatmap-cell.selected { border: 2px solid white; z-index: 10; }

        .ai-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          z-index: 5;
        }

        .cell-score {
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
          background: rgba(0, 0, 0, 0.5);
          padding: 2px 6px;
          border-radius: 4px;
          z-index: 6;
        }

        .hotspot-marker {
          position: absolute;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid;
          border-radius: 50%;
          z-index: 20;
          transform: translate(-50%, -50%);
        }

        .hotspot-marker.severity-high { border-color: #ef4444; color: #ef4444; }
        .hotspot-marker.severity-medium { border-color: #f59e0b; color: #f59e0b; }
        .hotspot-marker.severity-low { border-color: #22c55e; color: #22c55e; }

        .corner-bracket {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 2px solid rgba(99, 102, 241, 0.5);
          z-index: 25;
        }

        .corner-bracket.top-left { top: 10px; left: 10px; border-right: none; border-bottom: none; }
        .corner-bracket.top-right { top: 10px; right: 10px; border-left: none; border-bottom: none; }
        .corner-bracket.bottom-left { bottom: 10px; left: 10px; border-right: none; border-top: none; }
        .corner-bracket.bottom-right { bottom: 10px; right: 10px; border-left: none; border-top: none; }

        .heatmap-legend {
          margin-top: 1rem;
          text-align: center;
        }

        .legend-gradient {
          height: 12px;
          background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }

        .legend-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Graph Tab Styles */
        .chart-container, .radar-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .chart-container h4, .radar-container h4, .opencv-metrics h4, .detection-matrix h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          height: 180px;
          padding: 1rem 0;
          position: relative;
        }

        .bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 20px;
        }

        .bar {
          width: 100%;
          min-height: 20px;
          border-radius: 6px 6px 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
        }

        .bar-value {
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
        }

        .bar-label {
          margin-top: 0.5rem;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .chart-threshold {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .threshold-line {
          position: absolute;
          left: 0;
          right: 0;
          border-top: 2px dashed rgba(245, 158, 11, 0.5);
        }

        .threshold-line span {
          position: absolute;
          right: 0;
          top: -20px;
          font-size: 0.65rem;
          color: #f59e0b;
        }

        .radar-chart {
          display: flex;
          justify-content: center;
          padding: 1rem;
        }

        .radar-chart svg {
          width: 200px;
          height: 200px;
        }

        /* Metrics Tab Styles */
        .opencv-metrics, .detection-matrix {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .metric-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 1rem;
        }

        .metric-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .metric-value.danger { color: #ef4444; }
        .metric-value.success { color: #22c55e; }
        .metric-value.warning { color: #f59e0b; }
        .metric-value.highlight { color: #6366f1; }

        .metric-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s ease;
        }

        .metric-fill.danger { background: #ef4444; }
        .metric-fill.success { background: #22c55e; }
        .metric-fill.warning { background: #f59e0b; }
        .metric-fill.primary { background: #6366f1; }

        .hotspot-dots {
          display: flex;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot.high { background: #ef4444; }
        .dot.medium { background: #f59e0b; }
        .dot.low { background: #22c55e; }

        .matrix-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 4px;
        }

        .matrix-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
        }

        /* Hotspots Section */
        .hotspots-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hotspots-section h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .hotspots-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .hotspot-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .hotspot-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .hotspot-item.severity-high { border-left: 3px solid #ef4444; }
        .hotspot-item.severity-medium { border-left: 3px solid #f59e0b; }
        .hotspot-item.severity-low { border-left: 3px solid #22c55e; }

        .hotspot-info { flex: 1; }
        .hotspot-region { font-weight: 500; display: block; }
        .hotspot-score { font-size: 0.8rem; color: var(--text-muted); }

        .hotspot-anomalies {
          display: flex;
          gap: 0.25rem;
        }

        .anomaly-tag {
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 4px;
          color: #a5b4fc;
        }

        .spatial-explanation {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 10px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .spatial-explanation p { margin: 0; }

        @media (max-width: 768px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .metric-value { font-size: 1.25rem; }
        }
      `}</style>
    </motion.div>
  );
}
