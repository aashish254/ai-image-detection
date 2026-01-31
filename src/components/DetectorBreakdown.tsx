'use client';

import { motion } from 'framer-motion';
import { BarChart2, CheckCircle, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { formatProcessingTime } from '@/lib/utils';

interface DetectorBreakdownProps {
  result: AnalysisResult;
}

export default function DetectorBreakdown({ result }: DetectorBreakdownProps) {
  const detectors = [
    {
      name: 'HuggingFace AI Detector',
      shortName: 'HuggingFace',
      data: result.detectors.huggingface,
      weight: result.fusion.huggingfaceWeight,
      baseWeight: 0.6,
      color: '#6366f1',
      description: 'Pre-trained classifier for AI image detection',
    },
    {
      name: 'Gemini Vision Analysis',
      shortName: 'Gemini VLM',
      data: result.detectors.visionLLM,
      weight: result.fusion.visionLLMWeight,
      baseWeight: 0.3,
      color: '#8b5cf6',
      description: 'Vision-language model for semantic analysis',
    },
    {
      name: 'DCT Frequency Analysis',
      shortName: 'DCT Analysis',
      data: result.detectors.dctAnalysis,
      weight: result.fusion.dctWeight,
      baseWeight: 0.1,
      color: '#a855f7',
      description: 'Frequency domain analysis for AI fingerprints',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={14} color="#22c55e" />;
      case 'fallback':
        return <AlertTriangle size={14} color="#f59e0b" />;
      case 'error':
        return <AlertCircle size={14} color="#ef4444" />;
      default:
        return <AlertCircle size={14} color="#6b7280" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.7) return '#ef4444';
    if (score >= 0.5) return '#f59e0b';
    if (score >= 0.3) return '#eab308';
    return '#22c55e';
  };

  return (
    <motion.div
      className="detector-breakdown"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="breakdown-header">
        <h3>
          <BarChart2 size={18} />
          Detector Breakdown
        </h3>
      </div>

      <div className="detectors-list">
        {detectors.map((detector, index) => (
          <motion.div
            key={detector.name}
            className="detector-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="detector-header">
              <div className="detector-title">
                <span
                  className="detector-dot"
                  style={{ backgroundColor: detector.color }}
                />
                <span className="detector-name">{detector.shortName}</span>
                {getStatusIcon(detector.data.status)}
              </div>
              <div className="detector-weight">
                <span
                  className={`weight-value ${detector.weight !== detector.baseWeight ? 'adjusted' : ''}`}
                >
                  {(detector.weight * 100).toFixed(0)}%
                </span>
                {detector.weight !== detector.baseWeight && (
                  <span className="weight-base">
                    (base: {(detector.baseWeight * 100).toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>

            <div className="detector-score">
              <div className="score-bar-container">
                <motion.div
                  className="score-bar"
                  style={{ backgroundColor: getScoreColor(detector.data.score) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${detector.data.score * 100}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                />
              </div>
              <span
                className="score-value"
                style={{ color: getScoreColor(detector.data.score) }}
              >
                {(detector.data.score * 100).toFixed(1)}%
              </span>
            </div>

            <div className="detector-meta">
              <span className="detector-desc">{detector.description}</span>
              <span className="detector-time">
                <Clock size={12} />
                {formatProcessingTime(detector.data.processingTime)}
              </span>
            </div>

            {detector.data.error && (
              <div className="detector-error">
                <AlertTriangle size={12} />
                {detector.data.error}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Fusion Result */}
      <div className="fusion-section">
        <div className="fusion-header">
          <span className="fusion-label">Weighted Fusion Result</span>
          <span className="fusion-formula">
            HF×{(result.fusion.huggingfaceWeight * 100).toFixed(0)}% +
            VLM×{(result.fusion.visionLLMWeight * 100).toFixed(0)}% +
            DCT×{(result.fusion.dctWeight * 100).toFixed(0)}%
          </span>
        </div>
        <div className="fusion-score">
          <div className="score-bar-container large">
            <motion.div
              className="score-bar gradient"
              initial={{ width: 0 }}
              animate={{ width: `${result.fusion.finalScore * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
          <span className="score-value large">
            {(result.fusion.finalScore * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <style jsx>{`
        .detector-breakdown {
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }

        .breakdown-header {
          margin-bottom: var(--space-lg);
        }

        .breakdown-header h3 {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 1rem;
          margin: 0;
        }

        .detectors-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .detector-card {
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .detector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-sm);
        }

        .detector-title {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .detector-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .detector-name {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .detector-weight {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .weight-value {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .weight-value.adjusted {
          color: var(--primary-400);
          font-weight: 600;
        }

        .weight-base {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .detector-score {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-sm);
        }

        .score-bar-container {
          flex: 1;
          height: 8px;
          background: var(--bg-primary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .score-bar-container.large {
          height: 12px;
        }

        .score-bar {
          height: 100%;
          border-radius: var(--radius-full);
        }

        .score-bar.gradient {
          background: var(--gradient-primary);
        }

        .score-value {
          font-weight: 600;
          font-size: 0.9rem;
          min-width: 50px;
          text-align: right;
        }

        .score-value.large {
          font-size: 1.2rem;
        }

        .detector-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-sm);
        }

        .detector-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .detector-time {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .detector-error {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          margin-top: var(--space-sm);
          padding: var(--space-xs) var(--space-sm);
          background: rgba(239, 68, 68, 0.1);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: #ef4444;
        }

        .fusion-section {
          padding-top: var(--space-md);
          border-top: 1px solid var(--glass-border);
        }

        .fusion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-sm);
        }

        .fusion-label {
          font-weight: 500;
          color: var(--text-primary);
        }

        .fusion-formula {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .fusion-score {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
      `}</style>
    </motion.div>
  );
}
