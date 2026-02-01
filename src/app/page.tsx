'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Upload, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    router.push('/analyze');
  };

  const handleUploadClick = () => {
    router.push('/analyze');
  };

  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <main className="hero">
        {/* Background Glow */}
        <div className="hero-bg">
          <div className="bg-glow"></div>
        </div>

        <div className="hero-content">
          {/* Hero Text */}
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="hero-title">
              <em>Define Reality.</em> <em className="light">Instantly.</em>
            </h1>
            <p className="hero-subtitle">
              The enterprise standard for discerning original from AI-generated imagery.
            </p>
          </motion.div>

          {/* Glass Card */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, scale: 0.96, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Card Header */}
            <div className="card-label">Drag & Drop or Upload Image to Analyze</div>

            {/* Split Image */}
            <div className="image-container">
              {/* Left - Original */}
              <div className="image-side left">
                <div className="badge original">
                  <span className="check-icon">✓</span> Original Capture
                </div>
              </div>

              {/* Right - AI */}
              <div className="image-side right">
                <div className="purple-overlay"></div>
                <div className="badge synthetic">99.2% Synthetic Probability</div>
                <div className="badge ai-pattern">AI Generated Pattern Detected</div>
              </div>

              {/* Divider */}
              <div className="divider"></div>

              {/* Hover Overlay */}
              <div className="upload-overlay">
                <Upload size={52} strokeWidth={1} />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer / Team Section */}
      <footer className="landing-footer">
        <div className="container">
          <motion.div
            className="footer-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Research Team</h2>
            <div className="submission-info">
              Submitted to <strong>Madhan E S</strong>
            </div>
          </motion.div>

          <div className="team-grid">
            <motion.div className="team-member" whileHover={{ y: -5 }}>
              <div className="avatar">AK</div>
              <h4>Aashish Kumar Mahato</h4>
              <span>22BCE3874</span>
            </motion.div>

            <motion.div className="team-member" whileHover={{ y: -5 }}>
              <div className="avatar">RY</div>
              <h4>Rahul Yadav</h4>
              <span>22BCE3859</span>
            </motion.div>

            <motion.div className="team-member" whileHover={{ y: -5 }}>
              <div className="avatar">BG</div>
              <h4>Bibek Gami</h4>
              <span>22BCE3860</span>
            </motion.div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* ============ BASE ============ */
        .landing-page {
          min-height: 100vh;
          background: #0c0c0e;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 24px;
        }

        /* ============ HERO ============ */
        .hero {
          position: relative;
          flex: 1; /* Allow hero to take available space */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 100px; /* Added bottom padding */
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
          overflow: hidden;
        }

        .bg-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 1200px;
          height: 600px;
          background: radial-gradient(ellipse 70% 40% at 50% 0%, rgba(60, 60, 80, 0.5) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-content {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-text {
          text-align: center;
          margin-bottom: 48px;
        }

        .hero-title {
          font-size: clamp(3rem, 7vw, 5rem);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.025em;
          margin-bottom: 20px;
          color: #fff;
        }

        .hero-title em {
          font-style: italic;
        }

        .hero-title em.light {
          opacity: 0.85;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* ============ GLASS CARD ============ */
        .glass-card {
          width: 100%;
          max-width: 820px;
          background: linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top-color: rgba(255, 255, 255, 0.22);
          border-radius: 24px;
          padding: 36px;
          cursor: pointer;
          position: relative;
          box-shadow: 
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 30px 80px rgba(0,0,0,0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .card-label {
          text-align: center;
          color: rgba(255,255,255,0.65);
          font-size: 1.05rem;
          margin-bottom: 28px;
          font-weight: 400;
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 380px;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          box-shadow: 0 15px 50px rgba(0,0,0,0.5);
        }

        .image-side {
          flex: 1;
          background-size: cover;
          background-position: center top;
          position: relative;
        }

        .image-side.left {
          background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop');
        }

        .image-side.right {
          background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop');
        }

        .purple-overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 70% at 50% 40%, rgba(160, 100, 255, 0.5) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(180, 120, 255, 0.4) 0%, transparent 50%);
          mix-blend-mode: screen;
        }

        .divider {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255,255,255,0.35);
          z-index: 10;
          box-shadow: 0 0 15px rgba(255,255,255,0.4);
        }

        .badge {
          position: absolute;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 500;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 20;
        }

        .original {
          bottom: 24px;
          left: 18px;
          background: rgba(90, 90, 100, 0.4);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .check-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: #3b82f6;
          border-radius: 50%;
          font-size: 0.65rem;
        }

        .synthetic {
          top: 22px;
          right: 18px;
          background: rgba(155, 100, 255, 0.3);
          border: 1px solid rgba(180, 140, 255, 0.4);
          color: #e8dcff;
        }

        .ai-pattern {
          bottom: 24px;
          right: 18px;
          background: rgba(155, 100, 255, 0.3);
          border: 1px solid rgba(180, 140, 255, 0.4);
          color: #e8dcff;
        }

        .upload-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease;
          backdrop-filter: blur(3px);
          z-index: 30;
          color: white;
        }

        .image-container:hover .upload-overlay {
          opacity: 1;
        }

        /* ============ FOOTER ============ */
        .landing-footer {
          padding: 60px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }

        .footer-header {
           text-align: center;
           margin-bottom: 40px;
        }

        .footer-header h2 {
           font-size: 1.8rem;
           font-weight: 600;
           margin-bottom: 8px;
           color: white;
        }

        .submission-info {
           color: rgba(255, 255, 255, 0.5);
           font-size: 1rem;
        }

        .submission-info strong {
           color: rgba(255, 255, 255, 0.9);
           font-weight: 500;
        }

        .team-grid {
           display: flex;
           justify-content: center;
           flex-wrap: wrap;
           gap: 60px;
        }

        .team-member {
           display: flex;
           flex-direction: column;
           align-items: center;
           text-align: center;
        }

        .avatar {
           width: 80px;
           height: 80px;
           border-radius: 50%;
           background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 1.25rem;
           font-weight: 500;
           color: rgba(255, 255, 255, 0.9);
           margin-bottom: 16px;
           border: 1px solid rgba(255, 255, 255, 0.1);
           box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .team-member h4 {
           font-size: 1.1rem;
           font-weight: 500;
           margin-bottom: 4px;
           color: white;
        }
        
        .team-member span {
           font-size: 0.9rem;
           color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
           .team-grid {
             gap: 40px;
             flex-direction: column;
           }
        }
      `}</style>
    </div>
  );
}
