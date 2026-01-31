'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Sparkles,
  Zap,
  Brain,
  ArrowDown,
  GraduationCap,
  FlaskConical,
  Clock,
  Target,
  Database,
  Layers,
  Fingerprint
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import AnalysisResults from '@/components/AnalysisResults';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import { AnalysisResult } from '@/lib/types';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedImageName, setUploadedImageName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result: AnalysisResult, imageUrl: string, imageName: string) => {
    setAnalysisResult(result);
    setUploadedImageUrl(imageUrl);
    setUploadedImageName(imageName);
    setIsAnalyzing(false);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setUploadedImageUrl('');
    setUploadedImageName('');
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Research Badge */}
            <motion.div
              className="research-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <FlaskConical size={16} />
              <span>Research Paper Project</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              AI <span className="gradient-text glow-text">Forensic</span> Analyzer
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Advanced deepfake detection with seven novel research contributions
            </motion.p>

            {/* Novel Contributions Highlight */}
            <motion.div
              className="novel-highlights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="novel-card featured"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="novel-icon new">
                  <Sparkles size={20} />
                </div>
                <div className="novel-info">
                  <span className="novel-label new">FSFN</span>
                  <span className="novel-name">Frequency-Spatial Fusion</span>
                </div>
              </motion.div>
              <motion.div
                className="novel-card featured"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="novel-icon new">
                  <Brain size={20} />
                </div>
                <div className="novel-info">
                  <span className="novel-label new">XAI</span>
                  <span className="novel-name">Explainable AI Detection</span>
                </div>
              </motion.div>
              <motion.div
                className="novel-card featured"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="novel-icon new">
                  <Target size={20} />
                </div>
                <div className="novel-info">
                  <span className="novel-label new">EUQ</span>
                  <span className="novel-name">Uncertainty Quantification</span>
                </div>
              </motion.div>
              <motion.div
                className="novel-card featured hot"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="novel-icon hot">
                  <Fingerprint size={20} />
                </div>
                <div className="novel-info">
                  <span className="novel-label hot">GFI</span>
                  <span className="novel-name">GAN Fingerprinting</span>
                </div>
              </motion.div>
              <motion.div
                className="novel-card"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="novel-icon">
                  <Shield size={20} />
                </div>
                <div className="novel-info">
                  <span className="novel-label">DACC</span>
                  <span className="novel-name">Confidence Calibration</span>
                </div>
              </motion.div>
              <motion.div
                className="novel-card"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="novel-icon">
                  <Zap size={20} />
                </div>
                <div className="novel-info">
                  <span className="novel-label">SAM</span>
                  <span className="novel-name">Spatial Artifact Mapping</span>
                </div>
              </motion.div>
              <motion.div
                className="novel-card"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="novel-icon">
                  <Brain size={20} />
                </div>
                <div className="novel-info">
                  <span className="novel-label">DRWF</span>
                  <span className="novel-name">Dynamic Weighting</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Horizontal Stats Section with 3D Effects */}
            <motion.div
              className="stats-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="stat-card"
                whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-icon">
                  <Layers className="rotating-icon" size={32} />
                </div>
                <div className="stat-value">3</div>
                <div className="stat-label">Detection Pipelines</div>
                <div className="stat-glow"></div>
              </motion.div>

              <motion.div
                className="stat-card"
                whileHover={{ scale: 1.05, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-icon">
                  <Target className="pulsing-icon" size={32} />
                </div>
                <div className="stat-value">95%+</div>
                <div className="stat-label">Accuracy Rate</div>
                <div className="stat-glow"></div>
              </motion.div>

              <motion.div
                className="stat-card"
                whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-icon">
                  <Clock className="ticking-icon" size={32} />
                </div>
                <div className="stat-value">&lt; 5s</div>
                <div className="stat-label">Average Analysis Time</div>
                <div className="stat-glow"></div>
              </motion.div>

              <motion.div
                className="stat-card"
                whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-icon">
                  <Database className="floating-icon" size={32} />
                </div>
                <div className="stat-value">24h</div>
                <div className="stat-label">Cache Duration</div>
                <div className="stat-glow"></div>
              </motion.div>
            </motion.div>

            <div className="hero-badges">
              <motion.span
                className="badge featured"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <Sparkles size={14} />
                7 Novel Contributions
              </motion.span>
              <motion.span
                className="badge hot"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <Fingerprint size={14} />
                GAN Fingerprinting
              </motion.span>
              <motion.span
                className="badge"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <Brain size={14} />
                Multi-Modal Detection
              </motion.span>
              <motion.span
                className="badge"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <GraduationCap size={14} />
                Explainable AI
              </motion.span>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span>Scroll to analyze</span>
            <ArrowDown size={20} />
          </motion.div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="upload-section" id="analyze">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>
              Analyze Your <span className="gradient-text glow-text">Image</span>
            </h2>
            <p>
              Upload an image to detect AI-generated content using our multi-modal detection pipeline
            </p>
          </motion.div>

          {!analysisResult ? (
            <ImageUploader
              onAnalysisStart={handleAnalysisStart}
              onAnalysisComplete={handleAnalysisComplete}
              isAnalyzing={isAnalyzing}
            />
          ) : (
            <div className="results-container">
              <AnalysisResults
                result={analysisResult}
                imageUrl={uploadedImageUrl}
                imageName={uploadedImageName}
              />
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Research Section */}
      <section className="research-section" id="research">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label">Research</span>
            <h2>
              Novel <span className="gradient-text glow-text">Contributions</span>
            </h2>
            <p>
              Our system introduces seven unique innovations to the field of AI-generated image detection
            </p>
          </motion.div>

          <div className="research-grid">
            {/* NEW CONTRIBUTION #1: FSFN */}
            <motion.div
              className="research-card featured"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="research-number new">01</div>
              <span className="new-badge">NEW 2026</span>
              <h3>Frequency-Spatial Fusion Network (FSFN)</h3>
              <p>
                Dual-branch analysis combining frequency domain (DCT) and spatial domain features
                with cross-modal attention mechanism. Detects artifacts invisible in one domain
                but visible in another.
              </p>
              <div className="research-features">
                <span>• DCT frequency analysis</span>
                <span>• Spatial feature extraction</span>
                <span>• Attention-weighted fusion</span>
              </div>
            </motion.div>

            {/* NEW CONTRIBUTION #2: XAI */}
            <motion.div
              className="research-card featured"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="research-number new">02</div>
              <span className="new-badge">NEW 2026</span>
              <h3>Explainable AI Detection (XAI-Detect)</h3>
              <p>
                Provides visual attention maps showing which regions triggered detection,
                natural language explanations, and key factor analysis with contribution percentages.
              </p>
              <div className="research-features">
                <span>• Visual attention maps</span>
                <span>• Natural language summaries</span>
                <span>• Key factor identification</span>
              </div>
            </motion.div>

            {/* NEW CONTRIBUTION #3: EUQ */}
            <motion.div
              className="research-card featured"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="research-number new">03</div>
              <span className="new-badge">NEW 2026</span>
              <h3>Ensemble Uncertainty Quantification (EUQ)</h3>
              <p>
                Confidence intervals with uncertainty decomposition into aleatoric (data) and
                epistemic (model) components. Provides reliability assessment and human review recommendations.
              </p>
              <div className="research-formula">
                <code>CI = μ ± 1.96σ (95% confidence)</code>
                <span>Uncertainty = Aleatoric + Epistemic</span>
              </div>
            </motion.div>

            {/* NEW CONTRIBUTION #4: GFI */}
            <motion.div
              className="research-card featured highlight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="research-number new">04</div>
              <span className="new-badge hot">🔥 NEW 2026</span>
              <h3>GAN Fingerprint Identification (GFI)</h3>
              <p>
                Not just detecting if an image is AI-generated, but identifying WHICH AI generator
                created it. Matches spectral, color, texture, and noise signatures against
                known generator profiles.
              </p>
              <div className="research-features generators">
                <span>🎨 DALL-E</span>
                <span>🌌 Midjourney</span>
                <span>🔧 Stable Diffusion</span>
                <span>🔥 Adobe Firefly</span>
                <span>🌈 Google Imagen</span>
                <span>⚡ Flux</span>
              </div>
            </motion.div>

            {/* ORIGINAL #1: DACC */}
            <motion.div
              className="research-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="research-number">05</div>
              <h3>Disagreement-Aware Confidence Calibration (DACC)</h3>
              <p>
                Traditional multi-modal systems use fixed weighted averaging, which fails when detectors
                fundamentally disagree. Our novel DACC algorithm detects detector conflicts and calibrates
                confidence accordingly, providing a trust score that indicates result reliability.
              </p>
              <div className="research-formula">
                <code>C_calibrated = C_base × (1 - λ × D)</code>
                <span>Where D = disagreement score, λ = calibration factor</span>
              </div>
            </motion.div>

            {/* ORIGINAL #2: SAM */}
            <motion.div
              className="research-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="research-number">06</div>
              <h3>Spatial Artifact Mapping (SAM)</h3>
              <p>
                Instead of analyzing entire images and outputting a single score, our SAM technique
                divides images into regions and generates a heatmap showing WHERE AI artifacts are
                concentrated. This enables detection of composite/partially-edited images.
              </p>
              <div className="research-features">
                <span>• Region-based analysis</span>
                <span>• Visual heatmap overlay</span>
                <span>• Composite image detection</span>
              </div>
            </motion.div>

            {/* ORIGINAL #3: DRWF */}
            <motion.div
              className="research-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <div className="research-number">07</div>
              <h3>Dynamic Reliability-Weighted Fusion (DRWF)</h3>
              <p>
                Unlike static weight systems (60/30/10), DRWF dynamically adjusts fusion weights
                based on each detector's self-reported reliability for the specific image. When a
                detector reports low confidence or errors, its weight is automatically reduced.
              </p>
              <div className="research-formula">
                <code>w_i = base_w × reliability_i / Σ(w_j)</code>
                <span>Weights adapt per-image based on detector reliability</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section" id="team">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label">Team</span>
            <h2>
              Research <span className="gradient-text glow-text">Team</span>
            </h2>
          </motion.div>

          <div className="team-grid">
            <motion.div
              className="team-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="team-avatar"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                AK
              </motion.div>
              <h4>Aashish Kumar Mahato</h4>
              <span>22BCE3874</span>
              <div className="team-glow"></div>
            </motion.div>

            <motion.div
              className="team-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <motion.div
                className="team-avatar"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                RY
              </motion.div>
              <h4>Rahul Yadav</h4>
              <span>22BCE3859</span>
              <div className="team-glow"></div>
            </motion.div>

            <motion.div
              className="team-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <motion.div
                className="team-avatar"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                BG
              </motion.div>
              <h4>Bibek Gami</h4>
              <span>22BCE3860</span>
              <div className="team-glow"></div>
            </motion.div>
          </div>

          <motion.div
            className="guide-info"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <span>Submitted to:</span>
            <strong>Madhan E S</strong>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
        }

        .hero-section {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--space-3xl) 0;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse-glow 4s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }

        .hero-content {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .research-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-md);
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          color: #f59e0b;
          margin-bottom: var(--space-lg);
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2);
        }

        .hero-content h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 700;
          margin-bottom: var(--space-md);
          line-height: 1.1;
        }

        .glow-text {
          text-shadow: 0 0 40px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.3);
          animation: glow-pulse 2s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 40px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.3); }
          50% { text-shadow: 0 0 60px rgba(99, 102, 241, 0.8), 0 0 120px rgba(99, 102, 241, 0.5); }
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-xl);
        }

        .novel-highlights {
          display: flex;
          justify-content: center;
          gap: var(--space-md);
          margin-bottom: var(--space-2xl);
          flex-wrap: wrap;
          max-width: 100%;
        }

        .novel-card {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transform-style: preserve-3d;
          transition: all 0.3s ease;
        }

        .novel-card.featured {
          border-color: rgba(99, 102, 241, 0.4);
          background: linear-gradient(145deg, rgba(99, 102, 241, 0.15), var(--glass-bg));
        }

        .novel-card.hot {
          border-color: rgba(245, 158, 11, 0.5);
          background: linear-gradient(145deg, rgba(245, 158, 11, 0.15), var(--glass-bg));
          animation: glow-hot 2s infinite alternate;
        }

        @keyframes glow-hot {
          from { box-shadow: 0 8px 32px rgba(245, 158, 11, 0.2); }
          to { box-shadow: 0 8px 40px rgba(245, 158, 11, 0.4); }
        }

        .novel-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--gradient-primary);
          border-radius: var(--radius-md);
          color: white;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }

        .novel-icon.new {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        .novel-icon.hot {
          background: linear-gradient(135deg, #f59e0b, #dc2626);
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.5);
        }

        .novel-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .novel-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--primary-400);
          letter-spacing: 0.05em;
        }

        .novel-label.new {
          color: #8b5cf6;
        }

        .novel-label.hot {
          color: #f59e0b;
        }

        .novel-name {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .badge.featured {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .badge.hot {
          background: linear-gradient(135deg, #f59e0b, #dc2626);
          color: white;
          animation: pulse 2s infinite;
        }

        /* Horizontal Stats Section - FORCED HORIZONTAL */
        .stats-container {
          display: flex !important;
          flex-direction: row !important;
          justify-content: center;
          align-items: stretch;
          gap: var(--space-lg);
          margin: var(--space-2xl) 0;
          perspective: 1000px;
          flex-wrap: nowrap !important;
          width: 100%;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .stat-card {
          position: relative;
          padding: var(--space-xl);
          flex: 1 1 0 !important;
          min-width: 0;
          display: inline-block;
          background: linear-gradient(145deg, var(--bg-elevated), var(--bg-secondary));
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          text-align: center;
          overflow: hidden;
          transform-style: preserve-3d;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .stat-icon{
          margin: 0 auto var(--space-md);
          color: var(--primary-400);
        }

        .rotating-icon {
          animation: rotate-3d 6s linear infinite;
        }

        .pulsing-icon {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .ticking-icon {
          animation: tick-rotate 2s steps(12) infinite;
        }

        .floating-icon {
          animation: float-up-down 3s ease-in-out infinite;
        }

        @keyframes rotate-3d {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }

        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes tick-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes float-up-down {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--space-xs);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .stat-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .stat-card:hover .stat-glow {
          opacity: 1;
        }

        .hero-badges {
          display: flex;
          justify-content: center;
          gap: var(--space-md);
          flex-wrap: wrap;
          margin-top: var(--space-xl);
        }

        .badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          color: var(--text-secondary);
          border: 1px solid var(--glass-border);
          transition: all 0.3s ease;
        }

        .scroll-indicator {
          position: absolute;
          bottom: var(--space-2xl);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
          color: var(--text-muted);
          font-size: 0.85rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(10px); }
        }

        .upload-section {
          padding: var(--space-3xl) 0;
        }

        .section-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto var(--space-2xl);
        }

        .section-header h2 {
          margin-bottom: var(--space-sm);
        }

        .section-header p {
          color: var(--text-secondary);
        }

        .section-label {
          display: inline-block;
          padding: var(--space-xs) var(--space-md);
          background: var(--primary-900);
          color: var(--primary-400);
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-md);
        }

        .results-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xl);
        }

        .new-analysis-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-lg) var(--space-2xl);
          background: var(--gradient-primary);
          border: none;
          border-radius: var(--radius-full);
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }

        .btn-shine {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 70%
          );
          animation: shine 3s linear infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .research-section {
          padding: var(--space-3xl) 0;
          background: var(--bg-secondary);
        }

        .research-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
        }

        @media (max-width: 1200px) {
          .research-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .research-grid {
            grid-template-columns: 1fr;
          }
        }

        .research-card {
          padding: var(--space-xl);
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          transition: all 0.3s ease;
          transform-style: preserve-3d;
          position: relative;
        }

        .research-card.featured {
          border-color: rgba(99, 102, 241, 0.4);
          background: linear-gradient(145deg, rgba(99, 102, 241, 0.1), transparent);
        }

        .research-card.highlight {
          border-color: rgba(245, 158, 11, 0.5);
          background: linear-gradient(145deg, rgba(245, 158, 11, 0.15), transparent);
        }

        .new-badge {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          padding: 2px 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
        }

        .new-badge.hot {
          background: linear-gradient(135deg, #f59e0b, #dc2626);
          animation: pulse-hot 2s infinite;
        }

        @keyframes pulse-hot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 20px 5px rgba(245, 158, 11, 0.2); }
        }

        .research-number {
          display: inline-block;
          padding: var(--space-xs) var(--space-sm);
          background: var(--gradient-primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-md);
        }

        .research-number.new {
          background: linear-gradient(135deg, #f59e0b, #dc2626);
        }

        .research-card h3 {
          font-size: 1.1rem;
          margin-bottom: var(--space-md);
        }

        .research-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--space-md);
        }

        .research-formula {
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          text-align: center;
        }

        .research-formula code {
          display: block;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--primary-400);
          margin-bottom: var(--space-xs);
        }

        .research-formula span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .research-features {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .research-features.generators {
          flex-direction: row;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .research-features.generators span {
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
        }

        .team-section {
          padding: var(--space-3xl) 0;
        }

        .team-grid {
          display: flex;
          justify-content: center;
          gap: var(--space-xl);
          margin-bottom: var(--space-xl);
        }

        .team-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-2xl) var(--space-xl);
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          min-width: 220px;
          transform-style: preserve-3d;
          overflow: hidden;
          transition: all 0.4s ease;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .team-avatar {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: 50%;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: var(--space-md);
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
        }

        .team-card h4 {
          font-size: 1.1rem;
          margin-bottom: var(--space-xs);
        }

        .team-card span {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .team-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .team-card:hover .team-glow {
          opacity: 1;
        }

        .guide-info {
          text-align: center;
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-top: var(--space-xl);
        }

        .guide-info strong {
          color: var(--text-primary);
          margin-left: var(--space-sm);
        }

        @media (max-width: 992px) {
          .stats-container {
            flex-wrap: wrap;
            max-width: 100%;
          }

          .stat-card {
            flex: 1 1 calc(50% - var(--space-lg) / 2);
            min-width: 200px;
          }

          .research-grid {
            grid-template-columns: 1fr;
          }

          .novel-highlights {
            flex-direction: column;
            align-items: center;
          }
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2rem;
          }

          .stats-container {
            flex-direction: column;
            align-items: stretch;
            max-width: 500px;
          }

          .stat-card {
            flex: 1 1 auto;
            width: 100%;
          }

          .team-grid {
            flex-direction: column;
            align-items: center;
          }

          .hero-badges {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
