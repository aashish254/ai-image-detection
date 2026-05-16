'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Upload, ArrowRight, Shield, Cpu, Eye, Fingerprint, Sparkles, Zap } from 'lucide-react';
import { useState, useRef } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    router.push('/analyze');
  };

  const features = [
    { icon: <Shield size={20} />, label: 'Multi-Modal Detection', desc: 'Three independent engines for maximum coverage' },
    { icon: <Cpu size={20} />, label: 'DCT Frequency Analysis', desc: 'Mathematical artifact detection in frequency domain' },
    { icon: <Eye size={20} />, label: 'Vision AI Analysis', desc: 'Gemini-powered semantic understanding' },
    { icon: <Fingerprint size={20} />, label: 'GAN Fingerprinting', desc: 'Trace AI content back to its source generator' },
  ];

  const techStack = [
    { name: 'DACC', desc: 'Dynamic Adaptive Confidence Calibration' },
    { name: 'SAM', desc: 'Spatial Artifact Mapping' },
    { name: 'DRWF', desc: 'Dynamic Reliability Weighted Fusion' },
    { name: 'FSFN', desc: 'Frequency-Spatial Fusion Network' },
    { name: 'XAI', desc: 'Explainable AI Reports' },
    { name: 'EUQ', desc: 'Epistemic Uncertainty Quantification' },
    { name: 'GFI', desc: 'GAN Fingerprint Identification' },
  ];

  return (
    <div className="page-wrapper">

      {/* Hero Section */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={14} />
            <span>7 Novel Research Contributions</span>
          </motion.div>

          <h1 className="hero-title">
            Detect AI-Generated
            <br />
            <span className="hero-gradient">Content with Precision.</span>
          </h1>

          <p className="hero-subtitle">
            Multi-modal forensic analysis powered by frequency-domain mathematics,
            vision AI, and proprietary detection algorithms. Engineered for accuracy.
          </p>

          <div className="hero-actions">
            <motion.button
              className="hero-btn primary"
              onClick={() => router.push('/analyze')}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Upload size={17} />
              <span>Start Analysis</span>
              <ArrowRight size={15} />
            </motion.button>
            <motion.button
              className="hero-btn secondary"
              onClick={() => router.push('/working-model')}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>See How It Works</span>
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </motion.div>

        {/* 3D-style Floating Card */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 40, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="visual-card">
            <div className="card-glow" />
            <div className="card-inner">
              <div className="scan-indicator">
                <div className="scan-dot" />
                <span>AI DETECTION ENGINE</span>
              </div>
              <div className="metrics-grid">
                <div className="metric">
                  <span className="metric-label">Confidence</span>
                  <motion.span
                    className="metric-value"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    91.1%
                  </motion.span>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill danger"
                      initial={{ width: 0 }}
                      animate={{ width: '91%' }}
                      transition={{ delay: 1, duration: 1 }}
                    />
                  </div>
                </div>
                <div className="metric">
                  <span className="metric-label">Trust Score</span>
                  <motion.span
                    className="metric-value"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    35%
                  </motion.span>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill warning"
                      initial={{ width: 0 }}
                      animate={{ width: '35%' }}
                      transition={{ delay: 1.1, duration: 1 }}
                    />
                  </div>
                </div>
                <div className="metric">
                  <span className="metric-label">Detectors Active</span>
                  <motion.span
                    className="metric-value accent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    3 / 3
                  </motion.span>
                </div>
              </div>
              <div className="verdict-strip">
                <span className="verdict-dot danger" />
                <span>AI GENERATED</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Novel Contributions Ticker */}
      <section className="ticker-section">
        <div className="ticker-track">
          {[...techStack, ...techStack].map((tech, i) => (
            <div key={i} className="ticker-item">
              <Zap size={12} />
              <span className="ticker-name">{tech.name}</span>
              <span className="ticker-desc">{tech.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Detection Pipeline</h2>
          <p>Four layers of analysis working in concert</p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{
                y: -6,
                borderColor: 'rgba(99, 102, 241, 0.3)',
                boxShadow: '0 20px 60px rgba(99, 102, 241, 0.15)',
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.label}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Ready to verify your content?</h2>
          <p>Upload an image and get a comprehensive forensic analysis report in seconds.</p>
          <motion.button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 36px',
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'inherit',
              letterSpacing: '0.01em',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(99,102,241,0.25), 0 8px 30px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              margin: '0 auto',
            }}
            onClick={() => router.push('/analyze')}
            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 4px 12px rgba(99,102,241,0.35), 0 14px 44px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.96 }}
          >
            <Upload size={17} />
            <span>Try It Now</span>
            <ArrowRight size={15} />
          </motion.button>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-header">
          <h2>Research Team</h2>
          <p>Built by researchers, for researchers</p>
        </div>
        <div className="team-grid">
          {[
            { name: 'Aashish Kumar Mahato', role: 'Lead Developer & AI/ML Engineer', initials: 'AK', lead: true },
            { name: 'Rahul Yadav', role: 'Frontend Developer', initials: 'RY', lead: false },
            { name: 'Bibek Gami', role: 'Research Assistant', initials: 'BG', lead: false },
          ].map((member, i) => (
            <motion.div
              key={i}
              className={member.lead ? 'team-card lead' : 'team-card'}
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                padding: '32px 28px',
                borderRadius: '20px',
                minWidth: '200px',
                position: 'relative' as const,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6, borderColor: member.lead ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.15)' }}
            >
              {member.lead && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-8px',
                  padding: '3px 10px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  borderRadius: '8px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                  zIndex: 2,
                }}>★ Lead</div>
              )}
              <div style={{
                width: '56px',
                height: '56px',
                background: member.lead ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(99,102,241,0.12)',
                border: member.lead ? 'none' : '1px solid rgba(99,102,241,0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: member.lead ? 'white' : '#a5b4fc',
                marginBottom: '16px',
                boxShadow: member.lead ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
              }}>{member.initials}</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }} className="team-name">{member.name}</h4>
              <span className="team-role">{member.role}</span>
            </motion.div>
          ))}
        </div>
        <div className="guide-info">
          Under the guidance of <strong>Madhan E.S.</strong>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 OriginLayer • Research Project</p>
      </footer>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          overflow-x: hidden;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* Hero */
        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 160px 40px 80px;
          gap: 60px;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 100px;
          font-size: 0.8rem;
          color: #818cf8;
          margin-bottom: 32px;
          font-weight: 500;
        }

        .hero-title {
          font-size: clamp(2.8rem, 5.5vw, 4.5rem);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          color: var(--text-primary);
        }

        .hero-gradient {
          background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 40px;
          max-width: 500px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        :global(.hero-btn) {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 30px;
          border-radius: 14px;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          letter-spacing: 0.01em;
          font-family: inherit;
        }

        :global(.hero-btn.primary) {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%);
          color: white;
          box-shadow:
            0 2px 8px rgba(99, 102, 241, 0.25),
            0 8px 30px rgba(99, 102, 241, 0.2),
            inset 0 1px 0 rgba(255,255,255,0.15);
          position: relative;
          overflow: hidden;
        }

        :global(.hero-btn.primary)::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
          pointer-events: none;
        }

        :global(.hero-btn.primary:hover) {
          box-shadow:
            0 4px 12px rgba(99, 102, 241, 0.35),
            0 12px 40px rgba(99, 102, 241, 0.3),
            inset 0 1px 0 rgba(255,255,255,0.2);
        }

        :global(.hero-btn.secondary) {
          background: var(--glass-bg);
          color: var(--text-secondary);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(10px);
        }

        :global(.hero-btn.secondary:hover) {
          background: var(--hover-bg-strong);
          border-color: rgba(99, 102, 241, 0.3);
          color: var(--text-primary);
        }

        :global(.hero-btn .btn-arrow) {
          opacity: 0.7;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }

        :global(.hero-btn:hover .btn-arrow) {
          transform: translateX(3px);
          opacity: 1;
        }

        :global(.hero-btn.cta-btn) {
          padding: 16px 36px;
          font-size: 0.95rem;
        }

        /* Visual Card */
        .hero-visual {
          flex: 0 0 380px;
          perspective: 1000px;
        }

        .visual-card {
          position: relative;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          overflow: hidden;
          transform: rotateY(-3deg) rotateX(2deg);
          transition: transform 0.5s ease;
        }

        .visual-card:hover {
          transform: rotateY(0deg) rotateX(0deg);
        }

        .card-glow {
          position: absolute;
          top: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
        }

        .card-inner {
          padding: 28px;
        }

        .scan-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 24px;
          text-transform: uppercase;
        }

        .scan-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }

        .metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 20px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .metric-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ef4444;
          font-variant-numeric: tabular-nums;
        }

        .metric-value.accent {
          color: #818cf8;
          font-size: 1.2rem;
        }

        .metric-bar {
          height: 4px;
          background: var(--hover-bg);
          border-radius: 100px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 1s ease;
        }

        .metric-fill.danger {
          background: linear-gradient(90deg, #ef4444, #f87171);
        }

        .metric-fill.warning {
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }

        .verdict-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #ef4444;
        }

        .verdict-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        .verdict-dot.danger {
          background: #ef4444;
        }

        /* Ticker */
        .ticker-section {
          position: relative;
          z-index: 2;
          overflow: hidden;
          padding: 20px 0;
          border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
          background: var(--glass-bg);
        }

        .ticker-track {
          display: flex;
          gap: 32px;
          animation: scroll-ticker 30s linear infinite;
          width: max-content;
        }

        @keyframes scroll-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .ticker-name {
          color: #818cf8;
          font-weight: 600;
          font-size: 0.75rem;
          padding: 2px 8px;
          background: rgba(99,102,241,0.1);
          border-radius: 4px;
        }

        .ticker-desc {
          color: var(--text-muted);
        }

        /* Features */
        .features-section {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 40px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-header h2 {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .section-header p {
          font-size: 1rem;
          color: var(--text-muted);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .feature-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 12px;
          color: #818cf8;
          margin-bottom: 18px;
        }

        .feature-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .feature-card p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.55;
        }

        /* CTA */
        .cta-section {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 40px 100px;
        }

        .cta-card {
          text-align: center;
          padding: 64px 48px;
          background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 50%, rgba(99,102,241,0.06) 100%);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 28px;
          position: relative;
          overflow: hidden;
        }

        .cta-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent);
        }

        .cta-card h2 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .cta-card p {
          color: var(--text-muted);
          margin: 0 auto 36px;
          max-width: 440px;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .cta-card .hero-btn {
          margin: 0 auto;
        }

        /* Team */
        .team-section {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 40px 100px;
        }

        .team-grid {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .team-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 28px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          min-width: 200px;
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
        }

        .team-card.lead {
          border-color: rgba(99, 102, 241, 0.2);
          background: rgba(99, 102, 241, 0.04);
        }

        .lead-badge {
          position: absolute;
          top: -10px;
          right: -8px;
          padding: 3px 10px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .team-avatar {
          width: 56px;
          height: 56px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 700;
          color: #a5b4fc;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .team-avatar.lead-avatar {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }

        :global(.team-name) {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-primary) !important;
        }

        :global(.team-role) {
          font-size: 0.78rem;
          color: var(--text-muted) !important;
          text-align: center;
          max-width: 160px;
          line-height: 1.4;
        }

        .guide-info {
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .guide-info strong {
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Footer */
        .landing-footer {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 32px 0;
          border-top: 1px solid var(--glass-border);
        }

        .landing-footer p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .hero {
            flex-direction: column;
            padding: 140px 24px 60px;
            gap: 40px;
          }

          .hero-visual {
            flex: unset;
            width: 100%;
            max-width: 400px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}
