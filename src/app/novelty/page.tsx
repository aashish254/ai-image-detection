'use client';

import { motion } from 'framer-motion';
import { Sparkles, Check, X, ArrowRight, Zap, Shield, Award } from 'lucide-react';
import Link from 'next/link';


const contributions = [
  {
    id: 'DRWF',
    title: 'Dynamic Reliability Weighted Fusion',
    problem: 'Traditional ensemble methods use fixed weights that don\'t adapt to image characteristics.',
    solution: 'DRWF dynamically adjusts each detector\'s influence based on its historical reliability and per-image confidence metrics.',
    impact: 'Reduces false positives by 40% on adversarial inputs compared to static ensembles.',
  },
  {
    id: 'FSFN',
    title: 'Frequency-Spatial Fusion Network',
    problem: 'Single-domain detectors miss artifacts that span both frequency and spatial domains.',
    solution: 'FSFN jointly analyzes DCT frequency coefficients and spatial pixel patterns through a dual-branch architecture.',
    impact: 'Catches generation artifacts invisible to single-domain analysis.',
  },
  {
    id: 'SAM',
    title: 'Spatial Artifact Mapping',
    problem: 'Existing detectors provide a single "fake/real" label without localization.',
    solution: 'SAM produces coordinate-level artifact maps showing exactly where AI artifacts appear in the image.',
    impact: 'Enables forensic investigators to verify and explain detections spatially.',
  },
  {
    id: 'GFI',
    title: 'GAN Fingerprint Identification',
    problem: 'Knowing an image is AI-generated doesn\'t reveal which generator produced it.',
    solution: 'GFI matches spectral fingerprints against known generator profiles (DALL·E, Midjourney, Stable Diffusion, Gemini).',
    impact: 'Source attribution enables provenance tracking and supply chain transparency.',
  },
  {
    id: 'DACC',
    title: 'Dynamic Adaptive Confidence Calibration',
    problem: 'Raw model outputs are often overconfident or poorly calibrated.',
    solution: 'DACC adjusts confidence scores in real-time based on cross-detector agreement and image signal quality.',
    impact: 'Produces calibrated probabilities that users can actually trust.',
  },
  {
    id: 'EUQ',
    title: 'Epistemic Uncertainty Quantification',
    problem: 'Systems never say "I don\'t know" — high confidence regardless of input difficulty.',
    solution: 'EUQ measures model uncertainty and transparently communicates reliability of each prediction.',
    impact: 'Users can distinguish between confident detections and uncertain assessments.',
  },
  {
    id: 'XAI',
    title: 'Explainable AI Forensic Reports',
    problem: 'Black-box detection offers no insight into why a verdict was reached.',
    solution: 'Every verdict includes a structured forensic report with evidence, reasoning, and coordinate references.',
    impact: 'Bridges the gap between AI classification and human understanding.',
  },
];

const comparisonPoints = [
  { feature: 'Multi-modal detection', legacy: false, ours: true },
  { feature: 'Coordinate-level localization', legacy: false, ours: true },
  { feature: 'Source generator identification', legacy: false, ours: true },
  { feature: 'Explainable reports', legacy: false, ours: true },
  { feature: 'Confidence calibration', legacy: false, ours: true },
  { feature: 'Uncertainty quantification', legacy: false, ours: true },
  { feature: 'Real-time analysis', legacy: true, ours: true },
  { feature: 'Basic classification', legacy: true, ours: true },
];

export default function NoveltyPage() {
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
            <Award size={14} />
            <span>Research Contributions</span>
          </div>
          <h1>
            What Makes
            <span className="gradient-text"> OriginLayer Novel</span>
          </h1>
          <p>
            Seven distinct contributions that advance the state-of-the-art
            in AI-generated content detection.
          </p>
        </motion.div>

        {/* Contributions */}
        <div className="contributions">
          {contributions.map((contrib, i) => (
            <motion.div
              key={i}
              className="contrib-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{
                y: -4,
                borderColor: 'rgba(99, 102, 241, 0.2)',
                boxShadow: '0 16px 50px rgba(99, 102, 241, 0.08)',
              }}
            >
              <div className="contrib-header">
                <span className="contrib-id">{contrib.id}</span>
                <h3>{contrib.title}</h3>
              </div>
              <div className="contrib-grid">
                <div className="contrib-block problem">
                  <span className="block-label">Problem</span>
                  <p>{contrib.problem}</p>
                </div>
                <div className="contrib-block solution">
                  <span className="block-label">Solution</span>
                  <p>{contrib.solution}</p>
                </div>
                <div className="contrib-block impact">
                  <span className="block-label">Impact</span>
                  <p>{contrib.impact}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          className="comparison-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3>OriginLayer vs Legacy Detectors</h3>
          <div className="comparison-table">
            <div className="table-header">
              <span>Capability</span>
              <span>Legacy</span>
              <span>OriginLayer</span>
            </div>
            {comparisonPoints.map((point, i) => (
              <motion.div
                key={i}
                className="table-row"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <span className="row-feature">{point.feature}</span>
                <span className="row-check">
                  {point.legacy ? (
                    <Check size={16} className="check-yes" />
                  ) : (
                    <X size={16} className="check-no" />
                  )}
                </span>
                <span className="row-check">
                  {point.ours ? (
                    <Check size={16} className="check-yes accent" />
                  ) : (
                    <X size={16} className="check-no" />
                  )}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="cta"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/analyze" className="cta-btn">
            <Zap size={18} />
            Try the Analysis
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </main>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--bg-primary);
          color: white;
        }

        .main {
          max-width: 900px;
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
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .contributions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 80px;
        }

        .contrib-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .contrib-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .contrib-id {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 4px 10px;
          background: rgba(99,102,241,0.12);
          color: #818cf8;
          border-radius: 6px;
          border: 1px solid rgba(99,102,241,0.2);
        }

        .contrib-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .contrib-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .contrib-block {
          padding: 14px;
          border-radius: 12px;
          background: var(--glass-bg);
          border: 1px solid rgba(255,255,255,0.04);
        }

        .block-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .problem .block-label { color: #f87171; }
        .solution .block-label { color: #34d399; }
        .impact .block-label { color: #818cf8; }

        .contrib-block p {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Comparison */
        .comparison-section {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 60px;
        }

        .comparison-section h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }

        .table-header, .table-row {
          display: grid;
          grid-template-columns: 1fr 100px 100px;
          gap: 12px;
          align-items: center;
          padding: 10px 16px;
        }

        .table-header {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--glass-border);
        }

        .table-header span:not(:first-child) {
          text-align: center;
        }

        .table-row {
          border-bottom: 1px solid rgba(255,255,255,0.03);
          font-size: 0.88rem;
        }

        .row-feature {
          color: rgba(255,255,255,0.7);
        }

        .row-check {
          display: flex;
          justify-content: center;
        }

        :global(.check-yes) {
          color: #22c55e;
        }

        :global(.check-yes.accent) {
          color: #818cf8;
        }

        :global(.check-no) {
          color: rgba(255,255,255,0.15);
        }

        /* CTA */
        .cta {
          display: flex;
          justify-content: center;
        }

        .cta-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.45);
        }

        @media (max-width: 768px) {
          .main {
            padding: 140px 20px 60px;
          }

          .contrib-grid {
            grid-template-columns: 1fr;
          }

          .table-header, .table-row {
            grid-template-columns: 1fr 60px 80px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
