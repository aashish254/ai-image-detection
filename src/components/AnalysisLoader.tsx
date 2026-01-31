'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan, Eye, Fingerprint, Cpu, Activity, CheckCircle,
  RadioTower, Layers, Zap, CircleDot, Grid3X3, BarChart3, Brain
} from 'lucide-react';

interface AnalysisLoaderProps {
  imageUrl?: string;
}

const analysisPhases = [
  { id: 'upload', label: 'Image Processing', icon: Layers, color: '#6366f1', duration: 1500 },
  { id: 'face', label: 'Facial Geometry Analysis', icon: Eye, color: '#22c55e', duration: 2000 },
  { id: 'texture', label: 'Texture Pattern Detection', icon: Fingerprint, color: '#f59e0b', duration: 2500 },
  { id: 'frequency', label: 'DCT Frequency Analysis', icon: Activity, color: '#8b5cf6', duration: 2000 },
  { id: 'ai', label: 'AI Neural Classification', icon: Brain, color: '#ef4444', duration: 3000 },
  { id: 'fusion', label: 'Multi-Modal Fusion', icon: RadioTower, color: '#06b6d4', duration: 1500 },
];

export default function AnalysisLoader({ imageUrl }: AnalysisLoaderProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanPosition, setScanPosition] = useState(0);
  const [detectedPoints, setDetectedPoints] = useState<{ x: number; y: number; color: string }[]>([]);

  // Progress through phases
  useEffect(() => {
    let totalElapsed = 0;
    const totalDuration = analysisPhases.reduce((a, b) => a + b.duration, 0);

    const interval = setInterval(() => {
      totalElapsed += 100;
      const newProgress = Math.min((totalElapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Calculate current phase
      let elapsed = 0;
      for (let i = 0; i < analysisPhases.length; i++) {
        elapsed += analysisPhases[i].duration;
        if (totalElapsed < elapsed) {
          setCurrentPhase(i);
          break;
        }
      }

      if (totalElapsed >= totalDuration) {
        setCurrentPhase(analysisPhases.length);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Animate scan line
  useEffect(() => {
    const interval = setInterval(() => {
      setScanPosition((prev) => (prev + 2) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate detection points
  useEffect(() => {
    if (currentPhase >= 1 && detectedPoints.length < 20) {
      const interval = setInterval(() => {
        const colors = ['#22c55e', '#6366f1', '#ef4444', '#f59e0b'];
        setDetectedPoints((prev) => [
          ...prev,
          {
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80,
            color: colors[Math.floor(Math.random() * colors.length)]
          }
        ].slice(-20));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [currentPhase, detectedPoints.length]);

  return (
    <div className="analysis-loader">
      {/* Main Scanner Viewport */}
      <div className="scanner-viewport">
        {/* Image or Placeholder */}
        <div className="image-area">
          {imageUrl ? (
            <img src={imageUrl} alt="Analyzing" className="preview-image" />
          ) : (
            <div className="placeholder">
              <motion.div
                className="cube-3d"
                animate={{ rotateY: 360, rotateX: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <div className="cube-face front" />
                <div className="cube-face back" />
                <div className="cube-face left" />
                <div className="cube-face right" />
                <div className="cube-face top" />
                <div className="cube-face bottom" />
              </motion.div>
            </div>
          )}
        </div>

        {/* Scanning Overlays */}
        <div className="scan-overlay">
          {/* Horizontal scan line */}
          <motion.div
            className="scan-line-h"
            style={{ top: `${scanPosition}%` }}
          />

          {/* Vertical scan line */}
          <motion.div
            className="scan-line-v"
            style={{ left: `${(scanPosition + 30) % 100}%` }}
          />

          {/* Face detection grid */}
          {currentPhase >= 1 && (
            <motion.svg
              className="face-mesh"
              viewBox="0 0 100 100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Face outline */}
              <motion.ellipse
                cx="50" cy="50" rx="30" ry="40"
                fill="none"
                stroke="rgba(99, 102, 241, 0.4)"
                strokeWidth="0.5"
                strokeDasharray="3 2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />

              {/* Eye regions */}
              <motion.rect
                x="30" y="38" width="12" height="6" rx="1"
                fill="none" stroke="#22c55e" strokeWidth="0.8"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              />
              <motion.rect
                x="58" y="38" width="12" height="6" rx="1"
                fill="none" stroke="#22c55e" strokeWidth="0.8"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              />

              {/* Nose */}
              <motion.line
                x1="50" y1="45" x2="50" y2="58"
                stroke="rgba(99, 102, 241, 0.3)"
                strokeWidth="0.8"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 0.7 }}
              />

              {/* Mouth */}
              <motion.rect
                x="38" y="64" width="24" height="5" rx="2"
                fill="none" stroke="#f59e0b" strokeWidth="0.8"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
              />

              {/* Grid overlay */}
              {[0, 1, 2, 3, 4].map((row) =>
                [0, 1, 2, 3, 4].map((col) => (
                  <motion.rect
                    key={`${row}-${col}`}
                    x={10 + col * 16} y={10 + row * 16}
                    width="16" height="16"
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.15)"
                    strokeWidth="0.3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 + (row * 5 + col) * 0.03 }}
                  />
                ))
              )}
            </motion.svg>
          )}

          {/* Detection points */}
          <AnimatePresence>
            {detectedPoints.map((point, i) => (
              <motion.div
                key={i}
                className="detection-dot"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  backgroundColor: point.color,
                  boxShadow: `0 0 10px ${point.color}`
                }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                exit={{ scale: 0 }}
              />
            ))}
          </AnimatePresence>

          {/* Corner brackets */}
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />

          {/* Crosshair */}
          <motion.div
            className="crosshair"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Status HUD */}
        <div className="hud-overlay">
          <div className="hud-item">
            <span className="hud-label">MODE</span>
            <span className="hud-value">FORENSIC</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">SCAN</span>
            <span className="hud-value active">ACTIVE</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">PROC</span>
            <span className="hud-value">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Analysis Pipeline */}
      <div className="pipeline-section">
        <div className="pipeline-header">
          <Cpu size={18} />
          <span>AI Forensic Pipeline</span>
          <div className="progress-indicator">
            <motion.div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="phases-grid">
          {analysisPhases.map((phase, index) => {
            const PhaseIcon = phase.icon;
            const isActive = index === currentPhase;
            const isComplete = index < currentPhase;

            return (
              <motion.div
                key={phase.id}
                className={`phase-card ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                style={{ '--phase-color': phase.color } as React.CSSProperties}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: isActive || isComplete ? 1 : 0.4 }}
              >
                <div className="phase-icon-wrapper">
                  {isComplete ? (
                    <CheckCircle size={20} />
                  ) : (
                    <PhaseIcon size={20} />
                  )}
                  {isActive && (
                    <motion.div
                      className="icon-ring"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className="phase-label">{phase.label}</span>
                {isActive && (
                  <motion.div
                    className="loading-bar"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: phase.duration / 1000 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live Metrics */}
      <div className="metrics-grid">
        <div className="metric-box">
          <BarChart3 size={16} />
          <span className="metric-name">Confidence</span>
          <motion.span
            className="metric-val"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {Math.round(30 + progress * 0.65)}%
          </motion.span>
        </div>
        <div className="metric-box">
          <Grid3X3 size={16} />
          <span className="metric-name">Regions</span>
          <span className="metric-val">{Math.min(detectedPoints.length, 20)}/25</span>
        </div>
        <div className="metric-box">
          <CircleDot size={16} />
          <span className="metric-name">Hotspots</span>
          <span className="metric-val warning">{Math.floor(progress / 20)}</span>
        </div>
        <div className="metric-box">
          <Zap size={16} />
          <span className="metric-name">Status</span>
          <span className="metric-val success">PROCESSING</span>
        </div>
      </div>

      <style jsx>{`
        .analysis-loader {
          max-width: 700px;
          margin: 0 auto;
        }

        .scanner-viewport {
          position: relative;
          aspect-ratio: 16/10;
          background: linear-gradient(135deg, #0a0f1a, #1a1f2e);
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          box-shadow: 0 0 50px rgba(99, 102, 241, 0.15), inset 0 0 80px rgba(0, 0, 0, 0.6);
        }

        .image-area {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          opacity: 0.75;
        }

        .placeholder {
          perspective: 400px;
        }

        .cube-3d {
          width: 80px;
          height: 80px;
          position: relative;
          transform-style: preserve-3d;
        }

        .cube-face {
          position: absolute;
          width: 80px;
          height: 80px;
          border: 1px solid rgba(99, 102, 241, 0.4);
          background: rgba(99, 102, 241, 0.1);
          backdrop-filter: blur(4px);
        }

        .front { transform: translateZ(40px); }
        .back { transform: translateZ(-40px) rotateY(180deg); }
        .left { transform: translateX(-40px) rotateY(-90deg); }
        .right { transform: translateX(40px) rotateY(90deg); }
        .top { transform: translateY(-40px) rotateX(90deg); }
        .bottom { transform: translateY(40px) rotateX(-90deg); }

        .scan-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .scan-line-h {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.8), transparent);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
        }

        .scan-line-v {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, transparent, rgba(34, 197, 94, 0.6), transparent);
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
        }

        .face-mesh {
          position: absolute;
          inset: 15%;
          width: 70%;
          height: 70%;
        }

        .detection-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .corner {
          position: absolute;
          width: 35px;
          height: 35px;
          border: 2px solid rgba(99, 102, 241, 0.5);
        }

        .tl { top: 12px; left: 12px; border-right: none; border-bottom: none; }
        .tr { top: 12px; right: 12px; border-left: none; border-bottom: none; }
        .bl { bottom: 12px; left: 12px; border-right: none; border-top: none; }
        .br { bottom: 12px; right: 12px; border-left: none; border-top: none; }

        .crosshair {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50px;
          height: 50px;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(99, 102, 241, 0.4);
          border-radius: 50%;
        }

        .crosshair::before, .crosshair::after {
          content: '';
          position: absolute;
          background: rgba(99, 102, 241, 0.4);
        }

        .crosshair::before {
          width: 100%;
          height: 1px;
          top: 50%;
        }

        .crosshair::after {
          width: 1px;
          height: 100%;
          left: 50%;
        }

        .hud-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.65rem;
        }

        .hud-item {
          display: flex;
          gap: 8px;
          padding: 3px 8px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 4px;
        }

        .hud-label { color: #475569; }
        .hud-value { color: #22c55e; }
        .hud-value.active { animation: blink 1s infinite; }

        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.3; }
        }

        .pipeline-section {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .pipeline-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-indicator {
          flex: 1;
          height: 5px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-left: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 0.2s ease;
        }

        .phases-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .phase-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          text-align: center;
          overflow: hidden;
        }

        .phase-card.active {
          background: rgba(99, 102, 241, 0.1);
          border-color: var(--phase-color, #6366f1);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
        }

        .phase-card.complete {
          color: #22c55e;
        }

        .phase-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .icon-ring {
          position: absolute;
          inset: -5px;
          border: 2px solid var(--phase-color, #6366f1);
          border-radius: 15px;
        }

        .phase-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .loading-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: var(--phase-color, #6366f1);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          padding: 0.9rem;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }

        .metric-name {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-val {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .metric-val.warning { color: #f59e0b; }
        .metric-val.success { color: #22c55e; }

        @media (max-width: 640px) {
          .phases-grid { grid-template-columns: repeat(2, 1fr); }
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
