'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Tag,
  MapPin,
  Fingerprint,
  Cpu,
  XCircle,
} from 'lucide-react';
import { EducationalInsight, VisionLLMResult, ForensicReport } from '@/lib/types';

interface ExplanationPanelProps {
  explanation: string;
  insights: EducationalInsight[];
  visionAnalysis?: VisionLLMResult['analysis'];
  forensicReport?: ForensicReport;
}

export default function ExplanationPanel({
  explanation,
  insights,
  visionAnalysis,
  forensicReport
}: ExplanationPanelProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  if (!forensicReport) {
    return (
      <motion.div
        className="explanation-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="summary-fallback">
          <Shield size={20} />
          <p>{explanation}</p>
        </div>
        <style jsx>{`
          .explanation-panel {
            background: var(--bg-elevated);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 1.25rem;
          }
          .summary-fallback {
            display: flex; gap: 0.75rem; align-items: flex-start;
            color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;
          }
          .summary-fallback p { margin: 0; }
        `}</style>
      </motion.div>
    );
  }

  const verdict = forensicReport.verdict;
  const confidence = forensicReport.overallConfidence;
  const artifacts = forensicReport.detectedArtifacts;
  const highSeverity = artifacts.filter(a => a.severity === 'high');
  const mediumSeverity = artifacts.filter(a => a.severity === 'medium');

  // Extract platform info from forensicSummary
  const platformMatch = forensicReport.forensicSummary.match(/Source Platform Identified: (.+?)[\*\n]/);
  const platform = platformMatch?.[1]?.trim();

  const isAI = verdict === 'AI_GENERATED' || verdict === 'LIKELY_AI';
  const isReal = verdict === 'REAL' || verdict === 'LIKELY_REAL';

  const verdictConfig = isAI
    ? { icon: <AlertTriangle size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: 'AI-Generated Content Detected' }
    : isReal
      ? { icon: <CheckCircle size={20} />, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', label: 'Authentic Content' }
      : { icon: <Shield size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', label: 'Inconclusive — Manual Review Advised' };

  // Only flag watermarks when the verdict is actually AI — 
  // the summary mentions 'No SynthID' for real images which would false-match
  const hasSynthID = isAI && /SynthID Watermark.*detected/i.test(forensicReport.forensicSummary);
  const hasC2PA = isAI && /C2PA Content Credentials.*found|C2PA.*signature.*found/i.test(forensicReport.forensicSummary);
  const hasSDWatermark = isAI && /Stable Diffusion Watermark.*detected/i.test(forensicReport.forensicSummary);

  // Extract key reasoning points (bullet items only)
  const reasoningBullets: string[] = [];
  if (hasSynthID) reasoningBullets.push('SynthID watermark detected (Google Gemini/Imagen)');
  if (hasSDWatermark) reasoningBullets.push('Stable Diffusion DWT-DCT watermark detected');
  if (hasC2PA) reasoningBullets.push('C2PA content credentials verified');
  if (highSeverity.length > 0) reasoningBullets.push(`${highSeverity.length} high-confidence anomalies at specific coordinates`);
  if (mediumSeverity.length > 0) reasoningBullets.push(`${mediumSeverity.length} medium-confidence indicators found`);
  if (isReal) {
    reasoningBullets.push('No AI watermarks or signatures detected');
    reasoningBullets.push('Natural noise and texture patterns consistent with camera output');
  } else if (!isAI && !hasSynthID && !hasC2PA && !hasSDWatermark) {
    reasoningBullets.push('Analysis inconclusive — mixed signals detected');
  }

  return (
    <motion.div
      className="explanation-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Verdict Banner */}
      <motion.div
        className="verdict-banner"
        style={{ background: verdictConfig.bg, borderColor: verdictConfig.border }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="verdict-icon" style={{ color: verdictConfig.color }}>
          {verdictConfig.icon}
        </div>
        <div className="verdict-info">
          <h4 style={{ color: verdictConfig.color }}>{verdictConfig.label}</h4>
          <p>{(confidence * 100).toFixed(1)}% AI likelihood</p>
        </div>
      </motion.div>

      {/* Key Findings Grid */}
      <div className="findings-grid">
        {/* Platform Detection */}
        {platform && (
          <motion.div className="finding-card platform" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="card-header">
              <Tag size={16} />
              <span>Source Platform</span>
            </div>
            <div className="card-value">{platform}</div>
            <div className="card-tags">
              {hasSynthID && <span className="tag synthid">SynthID ✓</span>}
              {hasC2PA && <span className="tag c2pa">C2PA ✓</span>}
              {hasSDWatermark && <span className="tag sd">SD Watermark ✓</span>}
            </div>
          </motion.div>
        )}

        {/* Anomaly Count */}
        <motion.div className="finding-card anomalies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card-header">
            <MapPin size={16} />
            <span>Anomalies Detected</span>
          </div>
          <div className="card-value">{artifacts.length} <span className="unit">points</span></div>
          <div className="card-breakdown">
            {highSeverity.length > 0 && <span className="severity high">{highSeverity.length} high</span>}
            {mediumSeverity.length > 0 && <span className="severity medium">{mediumSeverity.length} medium</span>}
          </div>
        </motion.div>

        {/* VPT Status */}
        <motion.div className="finding-card vpt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="card-header">
            <Cpu size={16} />
            <span>VPT Model</span>
          </div>
          <div className="card-value">
            {forensicReport.vptModelLoaded ? (
              <span className="status-ok"><CheckCircle size={14} /> Active</span>
            ) : (
              <span className="status-off"><XCircle size={14} /> Unavailable</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Key Reasons — Compact Bullets */}
      <motion.div className="key-reasons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h5><Fingerprint size={14} /> Key Findings</h5>
        <ul>
          {reasoningBullets.map((bullet, i) => (
            <li key={i}>
              <span className="bullet-dot" style={{ background: isAI ? '#ef4444' : isReal ? '#22c55e' : '#f59e0b' }} />
              {bullet}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Top Artifacts — Compact List (max 4) */}
      {highSeverity.length > 0 && (
        <motion.div className="top-artifacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <h5><MapPin size={14} /> Top Artifact Locations</h5>
          <div className="artifacts-compact">
            {highSeverity.slice(0, 4).map((artifact, i) => (
              <div key={i} className="artifact-row">
                <span className="coord">({artifact.x}, {artifact.y})</span>
                <span className="desc">{artifact.anomalyType}</span>
                <span className="conf">{(artifact.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Collapsible Technical Details */}
      <button className="tech-toggle" onClick={() => setShowTechnical(!showTechnical)}>
        <span>Technical Details</span>
        {showTechnical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {showTechnical && (
          <motion.div
            className="technical-section"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="tech-content">
              <div className="tech-block">
                <h6>Detection Methodology</h6>
                <p>{forensicReport.technicalAnalysis.replace(/\*\*/g, '').replace(/\\n/g, '\n').split('\n').filter(l => l.trim()).slice(0, 8).join('\n')}</p>
              </div>
              {visionAnalysis?.overallAssessment && (
                <div className="tech-block">
                  <h6>Gemini Vision Assessment</h6>
                  <p>{visionAnalysis.overallAssessment}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .explanation-panel {
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .verdict-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border: 1px solid;
          border-radius: 12px;
        }
        .verdict-icon { flex-shrink: 0; }
        .verdict-info h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .verdict-info p {
          margin: 0.2rem 0 0;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .findings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.75rem;
        }
        .finding-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1rem;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .card-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .card-value .unit {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--text-muted);
        }
        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.5rem;
        }
        .tag {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }
        .tag.synthid { background: rgba(99,102,241,0.15); color: #818cf8; }
        .tag.c2pa { background: rgba(34,197,94,0.15); color: #4ade80; }
        .tag.sd { background: rgba(245,158,11,0.15); color: #fbbf24; }

        .card-breakdown {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.4rem;
        }
        .severity {
          font-size: 0.68rem;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-weight: 500;
        }
        .severity.high { background: rgba(239,68,68,0.15); color: #f87171; }
        .severity.medium { background: rgba(245,158,11,0.15); color: #fbbf24; }

        .status-ok {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #4ade80;
          font-size: 0.9rem;
        }
        .status-off {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .key-reasons {
          padding: 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
        }
        .key-reasons h5 {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin: 0 0 0.75rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .key-reasons ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .key-reasons li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .bullet-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .top-artifacts h5 {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin: 0 0 0.6rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .artifacts-compact {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .artifact-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: rgba(239,68,68,0.04);
          border: 1px solid rgba(239,68,68,0.1);
          border-radius: 8px;
          font-size: 0.82rem;
        }
        .coord {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #818cf8;
          font-size: 0.78rem;
          min-width: 80px;
        }
        .desc {
          flex: 1;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .conf {
          font-weight: 600;
          color: #f87171;
          font-size: 0.78rem;
        }

        .tech-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .tech-toggle:hover {
          background: var(--hover-bg);
          color: var(--text-secondary);
        }

        .technical-section {
          overflow: hidden;
        }
        .tech-content {
          padding: 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .tech-block h6 {
          margin: 0 0 0.4rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .tech-block p {
          margin: 0;
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.6;
          white-space: pre-line;
        }

        @media (max-width: 640px) {
          .findings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
}
