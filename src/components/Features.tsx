'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  Shield,
  Eye,
  Layers,
  BookOpen,
  Server,
  Lock,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: <Brain size={28} />,
    title: 'Multi-Modal Detection',
    description: 'Combines three detection pipelines: AI classification, vision-language analysis, and frequency domain inspection for robust results.',
    color: '#6366f1',
  },
  {
    icon: <Eye size={28} />,
    title: 'Explainable AI',
    description: 'Goes beyond simple scores to provide human-readable explanations of detected artifacts and why an image may be AI-generated.',
    color: '#8b5cf6',
  },
  {
    icon: <Layers size={28} />,
    title: 'Weighted Fusion',
    description: '60% HuggingFace AI detector, 30% Vision-LLM analysis, 10% DCT frequency analysis for balanced, accurate classification.',
    color: '#a855f7',
  },
  {
    icon: <Zap size={28} />,
    title: 'No GPU Required',
    description: 'Leverages cloud APIs for heavy computation, making professional-grade detection accessible without expensive hardware.',
    color: '#ec4899',
  },
  {
    icon: <Shield size={28} />,
    title: 'Intelligent Caching',
    description: 'Redis-backed caching prevents redundant API calls for the same image, reducing costs and speeding up repeated analyses.',
    color: '#14b8a6',
  },
  {
    icon: <BookOpen size={28} />,
    title: 'Educational Insights',
    description: 'Provides learning resources about deepfakes and AI-generated content to help users understand detection methods.',
    color: '#f59e0b',
  },
];

export default function Features() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label">Features</span>
          <h2>
            Advanced <span className="gradient-text">Detection Technology</span>
          </h2>
          <p>
            Our system leverages cutting-edge AI and signal processing techniques
            to provide accurate, explainable deepfake detection.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div
                className="feature-icon"
                style={{ color: feature.color, backgroundColor: `${feature.color}15` }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Architecture Highlight */}
        <motion.div
          className="architecture-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="architecture-content">
            <h3>Microservices Architecture</h3>
            <p>
              Our system uses API orchestration to combine multiple AI services,
              eliminating the need for local GPU infrastructure while maintaining
              high accuracy and explainability.
            </p>
            <div className="architecture-highlights">
              <div className="highlight-item">
                <Server size={20} />
                <span>FastAPI Backend</span>
              </div>
              <div className="highlight-item">
                <Lock size={20} />
                <span>Secure API Orchestration</span>
              </div>
              <div className="highlight-item">
                <TrendingUp size={20} />
                <span>Scalable Design</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .features-section {
          padding: var(--space-3xl) 0;
          background: var(--bg-secondary);
        }

        .section-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto var(--space-2xl);
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

        .section-header h2 {
          margin-bottom: var(--space-md);
        }

        .section-header p {
          font-size: 1.1rem;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
          margin-bottom: var(--space-2xl);
        }

        .feature-card {
          padding: var(--space-xl);
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }

        .feature-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: var(--shadow-lg);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
        }

        .feature-card h3 {
          font-size: 1.1rem;
          margin-bottom: var(--space-sm);
        }

        .feature-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        .architecture-section {
          padding: var(--space-2xl);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          text-align: center;
        }

        .architecture-content h3 {
          margin-bottom: var(--space-md);
        }

        .architecture-content > p {
          max-width: 600px;
          margin: 0 auto var(--space-xl);
          font-size: 1rem;
        }

        .architecture-highlights {
          display: flex;
          justify-content: center;
          gap: var(--space-2xl);
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--primary-400);
        }

        @media (max-width: 992px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
          }

          .architecture-highlights {
            flex-direction: column;
            align-items: center;
            gap: var(--space-md);
          }
        }
      `}</style>
    </section>
  );
}
