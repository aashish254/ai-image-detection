'use client';

import { motion } from 'framer-motion';
import {
  Upload, Scan, Brain, Layers, FileText,
  ArrowDown, CheckCircle, Sparkles, Cpu, Eye, BarChart3
} from 'lucide-react';


const steps = [
  {
    icon: <Upload size={22} />,
    title: 'Image Ingestion',
    description: 'The uploaded image is validated, decoded, and prepared for analysis. Base64 encoding is used for API transmission while preserving all pixel data.',
    details: ['Format validation (JPG, PNG, WebP)', 'Size validation (≤10MB)', 'Base64 encoding for API pipeline'],
    color: '#6366f1',
  },
  {
    icon: <Scan size={22} />,
    title: 'DCT Frequency Analysis',
    description: 'Discrete Cosine Transform decomposes the image into frequency components. AI-generated images exhibit distinct spectral signatures that differ from natural photographs.',
    details: ['8×8 block DCT decomposition', 'High-frequency artifact detection', 'JPEG compression artifact analysis', 'Spectral energy distribution mapping'],
    color: '#8b5cf6',
  },
  {
    icon: <Cpu size={22} />,
    title: 'CLIP Embedding Analysis',
    description: 'The image is passed through a CLIP-based classifier that has been trained to distinguish AI-generated content from authentic photographs in embedding space.',
    details: ['CLIP ViT-L/14 feature extraction', 'Cosine similarity scoring', 'Multi-label classification', 'Embedding space distance analysis'],
    color: '#06b6d4',
  },
  {
    icon: <Eye size={22} />,
    title: 'Gemini Vision LLM',
    description: 'Google\'s Gemini 2.0 Flash model performs semantic analysis, examining the image for logical inconsistencies, anatomical errors, and contextual anomalies.',
    details: ['Semantic consistency evaluation', 'Anatomical plausibility checks', 'Contextual artifact detection', 'Natural language reasoning output'],
    color: '#22c55e',
  },
  {
    icon: <Layers size={22} />,
    title: 'DRWF Fusion Engine',
    description: 'Dynamic Reliability Weighted Fusion combines all detector outputs, weighting each by its historical reliability and internal confidence for a unified verdict.',
    details: ['Per-detector confidence weighting', 'Cross-detector agreement analysis', 'Dynamic weight adjustment', 'Epistemic uncertainty quantification'],
    color: '#f59e0b',
  },
  {
    icon: <FileText size={22} />,
    title: 'Forensic Report Generation',
    description: 'A comprehensive human-readable report is generated with coordinate-level artifact locations, GAN fingerprint identification, and explainable reasoning.',
    details: ['Coordinate-based artifact mapping', 'GAN source identification', 'Spatial heatmap visualization', 'Confidence calibration (DACC)'],
    color: '#ec4899',
  },
];

export default function WorkingModelPage() {
  return (
    <div className="page-wrapper">


      <main className="main">
        {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-badge">
            <BarChart3 size={14} />
            <span>Detection Pipeline</span>
          </div>
          <h1>
            How
            <span className="gradient-text"> OriginLayer Works</span>
          </h1>
          <p>
            A 6-stage forensic pipeline that analyzes images through multiple
            independent detection methods before fusion and report generation.
          </p>
        </motion.div>

        {/* Pipeline Steps */}
        <div className="pipeline">
          {steps.map((step, i) => (
            <div key={i} className="pipeline-item">
              <motion.div
                className="step-card"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{
                  borderColor: `${step.color}33`,
                  boxShadow: `0 16px 50px ${step.color}12`,
                }}
              >
                <div className="step-top-line" style={{ background: `linear-gradient(90deg, ${step.color}, transparent)` }} />
                <div className="step-header">
                  <div className="step-icon" style={{ color: step.color, background: `${step.color}12`, borderColor: `${step.color}25` }}>
                    {step.icon}
                  </div>
                  <div className="step-number" style={{ color: step.color, background: `${step.color}10` }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>
                <h3>{step.title}</h3>
                <p className="step-desc">{step.description}</p>
                <div className="step-details">
                  {step.details.map((detail, j) => (
                    <div key={j} className="detail-item">
                      <CheckCircle size={13} style={{ color: step.color, flexShrink: 0 }} />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <motion.div
                  className="connector"
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <ArrowDown size={18} />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          className="summary-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Sparkles size={20} />
          <div>
            <h4>End-to-End Analysis</h4>
            <p>The complete pipeline executes in under 5 seconds, returning a forensic-grade analysis with coordinate-level artifact detection and source attribution.</p>
          </div>
        </motion.div>
      </main>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--bg-primary);
          color: white;
        }

        .main {
          max-width: 800px;
          margin: 0 auto;
          padding: 160px 40px 100px;
          position: relative;
          z-index: 2;
        }

        .page-header {
          text-align: center;
          margin-bottom: 72px;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 100px;
          font-size: 0.78rem;
          color: #818cf8;
          margin-bottom: 24px;
          font-weight: 500;
        }

        .page-header h1 {
          font-size: clamp(2.5rem, 5vw, 3.8rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #a5b4fc, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .page-header p {
          font-size: 1.1rem;
          color: var(--text-muted);
          max-width: 550px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .pipeline {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          margin-bottom: 60px;
        }

        .pipeline-item {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-card {
          position: relative;
          width: 100%;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }

        .step-top-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .step-card:hover .step-top-line {
          opacity: 1;
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .step-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid;
        }

        .step-number {
          font-size: 0.75rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          padding: 6px 12px;
          border-radius: 8px;
          letter-spacing: 0.05em;
        }

        .step-card h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .step-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .step-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.55);
        }

        .connector {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 0;
          color: rgba(255,255,255,0.15);
        }

        .summary-card {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 24px;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 16px;
          color: #818cf8;
        }

        .summary-card h4 {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }

        .summary-card p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .main {
            padding: 140px 20px 60px;
          }
        }
      `}</style>
    </div>
  );
}
