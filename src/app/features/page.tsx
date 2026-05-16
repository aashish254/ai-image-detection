'use client';
import React from 'react';

import { motion } from 'framer-motion';
import {
  Shield, Cpu, Eye, Fingerprint, BarChart3, Map,
  Layers, Zap, Brain, Lock, Sparkles, Activity, Target, Scan
} from 'lucide-react';


const capabilities = [
  {
    icon: <Layers size={22} />,
    title: 'Multi-Modal Fusion Engine',
    description: 'Three independent detection pipelines (DCT frequency, CLIP embeddings, Vision LLM) fused via Dynamic Reliability Weighted Fusion (DRWF) for robust verdicts.',
    tag: 'DRWF',
    color: '#6366f1',
  },
  {
    icon: <Activity size={22} />,
    title: 'Frequency-Spatial Fusion Network',
    description: 'FSFN combines DCT frequency artifacts with spatial domain analysis to detect subtle generation patterns invisible to single-domain detectors.',
    tag: 'FSFN',
    color: '#8b5cf6',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Dynamic Adaptive Confidence',
    description: 'DACC calibrates confidence scores in real-time based on detection agreement and image characteristics, reducing false positives.',
    tag: 'DACC',
    color: '#06b6d4',
  },
  {
    icon: <Map size={22} />,
    title: 'Spatial Artifact Mapping',
    description: 'SAM provides coordinate-level artifact localization on a visual heatmap, pinpointing exactly where AI artifacts appear in the image.',
    tag: 'SAM',
    color: '#22c55e',
  },
  {
    icon: <Fingerprint size={22} />,
    title: 'GAN Fingerprint Identification',
    description: 'GFI traces AI content back to its source generator — DALL·E, Midjourney, Stable Diffusion, or Gemini — through spectral fingerprint matching.',
    tag: 'GFI',
    color: '#f59e0b',
  },
  {
    icon: <Target size={22} />,
    title: 'Epistemic Uncertainty Quantification',
    description: 'EUQ measures how certain each detector is about its prediction, transparently communicating what the system knows and doesn\'t know.',
    tag: 'EUQ',
    color: '#ec4899',
  },
  {
    icon: <Brain size={22} />,
    title: 'Gemini Vision Analysis',
    description: 'Leverages Google\'s Gemini 2.0 Flash for semantic understanding — detecting logical inconsistencies, anatomical errors, and contextual anomalies.',
    tag: 'VISION',
    color: '#3b82f6',
  },
  {
    icon: <Scan size={22} />,
    title: 'Explainable AI Reports',
    description: 'Every detection comes with a human-readable forensic report detailing what was found, where, and why — bridging the gap between AI and user trust.',
    tag: 'XAI',
    color: '#14b8a6',
  },
];

export default function FeaturesPage() {
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
            <Sparkles size={14} />
            <span>7 Novel Contributions</span>
          </div>
          <h1>
            Detection
            <span className="gradient-text"> Capabilities</span>
          </h1>
          <p>
            Each module represents a novel contribution to the field of AI-generated content detection,
            working together as an integrated forensic pipeline.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="features-grid">
          {capabilities.map((cap, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{
                y: -6,
                borderColor: `${cap.color}33`,
                boxShadow: `0 20px 50px ${cap.color}15`,
              }}
            >
              <div className="card-top-line" style={{ background: `linear-gradient(90deg, ${cap.color}, transparent)` }} />
              <div className="card-header">
                <div className="card-icon" style={{ color: cap.color, background: `${cap.color}12`, borderColor: `${cap.color}20` }}>
                  {cap.icon}
                </div>
                <span className="card-tag" style={{ color: cap.color, background: `${cap.color}12`, borderColor: `${cap.color}25` }}>
                  {cap.tag}
                </span>
              </div>
              <h3>{cap.title}</h3>
              <p>{cap.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Pipeline Summary */}
        <motion.div
          className="pipeline-summary"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="pipeline-header">
            <h3>How They Work Together</h3>
            <p>Each module feeds into the DRWF fusion engine for a unified verdict</p>
          </div>
          <div className="pipeline-flow">
            {['Image Upload', 'DCT Analysis', 'CLIP Embeddings', 'Vision LLM', 'DRWF Fusion', 'Forensic Report'].map((step, i) => (
              <React.Fragment key={i}>
                <motion.div
                  className="pipeline-step"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="step-number">{i + 1}</span>
                  <span className="step-label">{step}</span>
                </motion.div>
                {i < 5 && <span className="step-arrow">→</span>}
              </React.Fragment>
            ))}
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
          max-width: 1100px;
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
          font-size: clamp(2.5rem, 5vw, 4rem);
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
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 80px;
        }

        .feature-card {
          position: relative;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }

        .card-top-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card:hover .card-top-line {
          opacity: 1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .card-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid;
        }

        .card-tag {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid;
        }

        .feature-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: rgba(255,255,255,0.95);
        }

        .feature-card p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* Pipeline */
        .pipeline-summary {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 24px 16px;
        }

        .pipeline-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .pipeline-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .pipeline-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .pipeline-flow {
          display: grid;
          grid-template-columns: repeat(6, 1fr) repeat(5, auto);
          /* Use a simpler approach: inline-flex with small sizing */
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex-wrap: nowrap;
          overflow-x: auto;
        }

        .pipeline-step {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 10px;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.1);
          border-radius: 10px;
          font-size: 0.75rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .step-number {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,0.2);
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #818cf8;
          flex-shrink: 0;
        }

        .step-label {
          color: rgba(255,255,255,0.7);
          font-weight: 500;
        }

        .step-arrow {
          color: rgba(255,255,255,0.2);
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .main {
            padding: 140px 20px 60px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .pipeline-flow {
            flex-direction: column;
            flex-wrap: wrap;
            overflow-x: visible;
          }

          .step-arrow {
            transform: rotate(90deg);
          }

          .pipeline-step {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
