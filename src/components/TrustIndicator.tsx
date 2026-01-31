'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { CalibrationResult } from '@/lib/types';
import { getTrustColor, getRecommendationStyle, getDisagreementLabel } from '@/lib/utils';

interface TrustIndicatorProps {
    calibration: CalibrationResult;
}

export default function TrustIndicator({ calibration }: TrustIndicatorProps) {
    const trustPercent = Math.round(calibration.trustScore * 100);
    const trustColor = getTrustColor(calibration.trustScore);
    const recommendationStyle = getRecommendationStyle(calibration.recommendation);
    const disagreementLabel = getDisagreementLabel(calibration.disagreementType);

    const getConfidenceIcon = () => {
        switch (calibration.recommendation) {
            case 'high_confidence':
                return <CheckCircle size={20} />;
            case 'moderate_confidence':
                return <Shield size={20} />;
            case 'low_confidence':
                return <HelpCircle size={20} />;
            case 'human_review_recommended':
                return <AlertTriangle size={20} />;
            default:
                return <Shield size={20} />;
        }
    };

    return (
        <motion.div
            className="trust-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="trust-header">
                <h3>
                    <Shield size={18} />
                    Trust Analysis
                </h3>
                <span className="novel-badge">NOVEL</span>
            </div>

            {/* Trust Score Gauge */}
            <div className="trust-gauge">
                <div className="gauge-label">Trust Score</div>
                <div className="gauge-bar-container">
                    <motion.div
                        className="gauge-bar"
                        style={{ backgroundColor: trustColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${trustPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <div className="gauge-value" style={{ color: trustColor }}>
                    {trustPercent}%
                </div>
            </div>

            {/* Calibration Info */}
            <div className="calibration-info">
                <div className="info-row">
                    <span className="info-label">Original Score</span>
                    <span className="info-value">{(calibration.rawScore * 100).toFixed(1)}%</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Calibrated Score</span>
                    <span className="info-value highlight">
                        {(calibration.calibratedScore * 100).toFixed(1)}%
                    </span>
                </div>
                {calibration.rawScore !== calibration.calibratedScore && (
                    <div className="info-row adjustment">
                        <span className="info-label">Adjustment</span>
                        <span className="info-value">
                            {((calibration.calibratedScore - calibration.rawScore) * 100).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Disagreement Status */}
            <div className="disagreement-section">
                <div className="disagreement-header">
                    <span className="disagreement-label">Detector Agreement</span>
                    <span
                        className="disagreement-badge"
                        style={{ backgroundColor: `${disagreementLabel.color}20`, color: disagreementLabel.color }}
                    >
                        {disagreementLabel.label}
                    </span>
                </div>
                <div className="disagreement-bar-container">
                    <motion.div
                        className="disagreement-bar"
                        style={{
                            width: `${(1 - calibration.disagreementScore) * 100}%`,
                            backgroundColor: disagreementLabel.color
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(1 - calibration.disagreementScore) * 100}%` }}
                        transition={{ duration: 0.6 }}
                    />
                </div>
            </div>

            {/* Recommendation Badge */}
            <div
                className="recommendation-badge"
                style={{
                    backgroundColor: recommendationStyle.bgColor,
                    borderColor: recommendationStyle.color
                }}
            >
                <span style={{ color: recommendationStyle.color }}>
                    {getConfidenceIcon()}
                </span>
                <span style={{ color: recommendationStyle.color }}>
                    {recommendationStyle.label}
                </span>
            </div>

            {/* Explanation */}
            <div className="trust-explanation">
                <p>{calibration.explanation}</p>
            </div>

            <style jsx>{`
        .trust-indicator {
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }

        .trust-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-md);
        }

        .trust-header h3 {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 1rem;
          margin: 0;
        }

        .novel-badge {
          padding: 2px 8px;
          background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          letter-spacing: 0.05em;
        }

        .trust-gauge {
          margin-bottom: var(--space-md);
        }

        .gauge-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: var(--space-xs);
        }

        .gauge-bar-container {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: var(--space-xs);
        }

        .gauge-bar {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }

        .gauge-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .calibration-info {
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-xs) 0;
        }

        .info-row:not(:last-child) {
          border-bottom: 1px solid var(--glass-border);
        }

        .info-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .info-value {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .info-value.highlight {
          color: var(--primary-400);
          font-weight: 600;
        }

        .info-row.adjustment .info-value {
          color: #f59e0b;
        }

        .disagreement-section {
          margin-bottom: var(--space-md);
        }

        .disagreement-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-xs);
        }

        .disagreement-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .disagreement-badge {
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 500;
        }

        .disagreement-bar-container {
          height: 6px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .disagreement-bar {
          height: 100%;
          border-radius: var(--radius-full);
        }

        .recommendation-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          border: 1px solid;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .trust-explanation {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .trust-explanation p {
          margin: 0;
        }
      `}</style>
        </motion.div>
    );
}
