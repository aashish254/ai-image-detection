'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scan, Eye, Fingerprint, Cpu, Activity, CheckCircle,
    RadioTower, Layers, Zap, CircleDot, Grid3X3, BarChart3
} from 'lucide-react';

interface AnalysisScannerProps {
    imageUrl?: string;
}

const analysisPhases = [
    { id: 'upload', label: 'Image Processing', icon: Layers, duration: 1500 },
    { id: 'face', label: 'Facial Geometry Analysis', icon: Eye, duration: 2000 },
    { id: 'texture', label: 'Texture Pattern Detection', icon: Fingerprint, duration: 2500 },
    { id: 'frequency', label: 'DCT Frequency Analysis', icon: Activity, duration: 2000 },
    { id: 'ai', label: 'Neural Network Classification', icon: Cpu, duration: 3000 },
    { id: 'fusion', label: 'Multi-Modal Fusion', icon: RadioTower, duration: 1500 },
];

export default function AnalysisScanner({ imageUrl }: AnalysisScannerProps) {
    const [currentPhase, setCurrentPhase] = useState(0);
    const [progress, setProgress] = useState(0);
    const [detectedPoints, setDetectedPoints] = useState<{ x: number; y: number; type: string }[]>([]);
    const [scanlinePosition, setScanlinePosition] = useState(0);

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
                setCurrentPhase(analysisPhases.length - 1);
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Animate scanline
    useEffect(() => {
        const interval = setInterval(() => {
            setScanlinePosition((prev) => (prev + 1) % 100);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    // Generate detection points during scanning
    useEffect(() => {
        if (currentPhase >= 1 && detectedPoints.length < 30) {
            const interval = setInterval(() => {
                setDetectedPoints((prev) => [
                    ...prev,
                    {
                        x: 15 + Math.random() * 70,
                        y: 15 + Math.random() * 70,
                        type: ['eye', 'texture', 'artifact', 'edge'][Math.floor(Math.random() * 4)]
                    }
                ].slice(-30));
            }, 200);
            return () => clearInterval(interval);
        }
    }, [currentPhase, detectedPoints.length]);

    const getCurrentPhase = () => analysisPhases[currentPhase];

    return (
        <div className="scanner-container">
            {/* Main Scanner Display */}
            <div className="scanner-display">
                {/* Image with Scanning Overlay */}
                <div className="scan-viewport">
                    {/* Placeholder or Image */}
                    <div className="image-container">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Analyzing" className="scan-image" />
                        ) : (
                            <div className="placeholder-grid">
                                {Array(16).fill(0).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="grid-cell"
                                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                                        transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Scanning Overlays */}
                    <div className="scan-overlays">
                        {/* Horizontal Scan Line */}
                        <motion.div
                            className="scan-line horizontal"
                            style={{ top: `${scanlinePosition}%` }}
                        />

                        {/* Vertical Scan Line */}
                        <motion.div
                            className="scan-line vertical"
                            style={{ left: `${(scanlinePosition + 50) % 100}%` }}
                        />

                        {/* Face Detection Grid */}
                        {currentPhase >= 1 && (
                            <motion.div
                                className="face-grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <svg viewBox="0 0 100 100" className="face-svg">
                                    {/* Face oval */}
                                    <motion.ellipse
                                        cx="50" cy="50" rx="35" ry="45"
                                        fill="none"
                                        stroke="rgba(99, 102, 241, 0.6)"
                                        strokeWidth="0.5"
                                        strokeDasharray="4 2"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2 }}
                                    />

                                    {/* Eye boxes */}
                                    <motion.rect
                                        x="25" y="35" width="18" height="10" rx="2"
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="1"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                    />
                                    <motion.rect
                                        x="57" y="35" width="18" height="10" rx="2"
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="1"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                    />

                                    {/* Nose line */}
                                    <motion.line
                                        x1="50" y1="45" x2="50" y2="60"
                                        stroke="rgba(99, 102, 241, 0.4)"
                                        strokeWidth="1"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ delay: 0.7 }}
                                    />

                                    {/* Mouth box */}
                                    <motion.rect
                                        x="35" y="65" width="30" height="8" rx="4"
                                        fill="none"
                                        stroke="#f59e0b"
                                        strokeWidth="1"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.8 }}
                                    />

                                    {/* Detection mesh */}
                                    {[0, 1, 2].map((row) =>
                                        [0, 1, 2, 3].map((col) => (
                                            <motion.rect
                                                key={`${row}-${col}`}
                                                x={20 + col * 15}
                                                y={25 + row * 20}
                                                width="15"
                                                height="20"
                                                fill="none"
                                                stroke="rgba(99, 102, 241, 0.2)"
                                                strokeWidth="0.3"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 1 + (row * 4 + col) * 0.1 }}
                                            />
                                        ))
                                    )}
                                </svg>
                            </motion.div>
                        )}

                        {/* Detection Points */}
                        <AnimatePresence>
                            {detectedPoints.map((point, i) => (
                                <motion.div
                                    key={i}
                                    className={`detection-point ${point.type}`}
                                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Corner Brackets */}
                        <div className="corner corner-tl" />
                        <div className="corner corner-tr" />
                        <div className="corner corner-bl" />
                        <div className="corner corner-br" />

                        {/* Center Crosshair */}
                        <motion.div
                            className="crosshair"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="crosshair-h" />
                            <div className="crosshair-v" />
                            <div className="crosshair-circle" />
                        </motion.div>
                    </div>

                    {/* Status Overlay */}
                    <div className="status-overlay">
                        <div className="status-row">
                            <span className="status-label">RES</span>
                            <span className="status-value">1920×1080</span>
                        </div>
                        <div className="status-row">
                            <span className="status-label">FPS</span>
                            <span className="status-value">60</span>
                        </div>
                        <div className="status-row">
                            <span className="status-label">SCAN</span>
                            <span className="status-value blink">ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Phases */}
            <div className="phases-panel">
                <div className="phases-header">
                    <Cpu size={18} />
                    <span>Analysis Pipeline</span>
                    <span className="progress-text">{Math.round(progress)}%</span>
                </div>

                <div className="phases-list">
                    {analysisPhases.map((phase, index) => {
                        const PhaseIcon = phase.icon;
                        const isActive = index === currentPhase;
                        const isComplete = index < currentPhase;

                        return (
                            <motion.div
                                key={phase.id}
                                className={`phase-item ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: isActive || isComplete ? 1 : 0.5 }}
                            >
                                <div className="phase-icon">
                                    {isComplete ? (
                                        <CheckCircle size={18} />
                                    ) : (
                                        <PhaseIcon size={18} />
                                    )}
                                </div>
                                <span className="phase-label">{phase.label}</span>
                                {isActive && (
                                    <motion.div
                                        className="phase-loader"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress Bar */}
                <div className="progress-bar-container">
                    <motion.div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                    <div className="progress-glow" style={{ left: `${progress}%` }} />
                </div>
            </div>

            {/* Real-time Metrics */}
            <div className="metrics-panel">
                <div className="metric-item">
                    <BarChart3 size={16} />
                    <span className="metric-label">Confidence</span>
                    <motion.span
                        className="metric-value"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {Math.round(30 + progress * 0.6)}%
                    </motion.span>
                </div>
                <div className="metric-item">
                    <Grid3X3 size={16} />
                    <span className="metric-label">Regions</span>
                    <span className="metric-value">{Math.min(detectedPoints.length, 25)}/25</span>
                </div>
                <div className="metric-item">
                    <CircleDot size={16} />
                    <span className="metric-label">Anomalies</span>
                    <span className="metric-value warning">
                        {Math.floor(detectedPoints.filter(p => p.type === 'artifact').length)}
                    </span>
                </div>
                <div className="metric-item">
                    <Zap size={16} />
                    <span className="metric-label">Status</span>
                    <span className="metric-value success">SCANNING</span>
                </div>
            </div>

            <style jsx>{`
        .scanner-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .scanner-display {
          margin-bottom: 1.5rem;
        }

        .scan-viewport {
          position: relative;
          aspect-ratio: 16/10;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(99, 102, 241, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.5);
        }

        .image-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scan-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          opacity: 0.8;
        }

        .placeholder-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 20%;
          width: 100%;
          height: 100%;
        }

        .grid-cell {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 8px;
        }

        .scan-overlays {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .scan-line {
          position: absolute;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.8), transparent);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
        }

        .scan-line.horizontal {
          left: 0;
          right: 0;
          height: 2px;
        }

        .scan-line.vertical {
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, transparent, rgba(34, 197, 94, 0.6), transparent);
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
        }

        .face-grid {
          position: absolute;
          inset: 10%;
        }

        .face-svg {
          width: 100%;
          height: 100%;
        }

        .detection-point {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .detection-point.eye {
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
        }

        .detection-point.texture {
          background: #6366f1;
          box-shadow: 0 0 10px #6366f1;
        }

        .detection-point.artifact {
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
        }

        .detection-point.edge {
          background: #f59e0b;
          box-shadow: 0 0 10px #f59e0b;
        }

        .corner {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 2px solid rgba(99, 102, 241, 0.6);
        }

        .corner-tl { top: 15px; left: 15px; border-right: none; border-bottom: none; }
        .corner-tr { top: 15px; right: 15px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 15px; left: 15px; border-right: none; border-top: none; }
        .corner-br { bottom: 15px; right: 15px; border-left: none; border-top: none; }

        .crosshair {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
        }

        .crosshair-h, .crosshair-v {
          position: absolute;
          background: rgba(99, 102, 241, 0.5);
        }

        .crosshair-h {
          width: 100%;
          height: 1px;
          top: 50%;
        }

        .crosshair-v {
          width: 1px;
          height: 100%;
          left: 50%;
        }

        .crosshair-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border: 1px solid rgba(99, 102, 241, 0.6);
          border-radius: 50%;
        }

        .status-overlay {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.7rem;
        }

        .status-row {
          display: flex;
          gap: 8px;
          padding: 2px 6px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 4px;
        }

        .status-label {
          color: #64748b;
        }

        .status-value {
          color: #22c55e;
        }

        .status-value.blink {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        .phases-panel {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .phases-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .progress-text {
          margin-left: auto;
          font-size: 0.9rem;
          color: #6366f1;
        }

        .phases-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .phase-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          color: var(--text-muted);
          transition: all 0.3s ease;
        }

        .phase-item.active {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
        }

        .phase-item.complete {
          color: #22c55e;
        }

        .phase-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .phase-label {
          flex: 1;
          font-size: 0.9rem;
        }

        .phase-loader {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-top-color: #6366f1;
          border-radius: 50%;
        }

        .progress-bar-container {
          position: relative;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-glow {
          position: absolute;
          top: -10px;
          width: 30px;
          height: 26px;
          background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.6) 0%, transparent 70%);
          transform: translateX(-50%);
          transition: left 0.3s ease;
        }

        .metrics-panel {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 10px;
          text-align: center;
        }

        .metric-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .metric-value.warning { color: #f59e0b; }
        .metric-value.success { color: #22c55e; }

        @media (max-width: 768px) {
          .scanner-container { padding: 1rem; }
          .metrics-panel { grid-template-columns: repeat(2, 1fr); }
          .metric-value { font-size: 0.95rem; }
        }
      `}</style>
        </div>
    );
}
