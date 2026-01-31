'use client';

import { motion } from 'framer-motion';
import {
    Upload,
    Cpu,
    GitMerge,
    FileCheck,
    ArrowRight,
    Cloud,
    Brain,
    BarChart3
} from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: <Upload size={32} />,
        title: 'Upload Image',
        description: 'User uploads an image through the React-based frontend. Supports JPG, PNG, and WebP formats up to 10MB.',
        color: '#6366f1',
    },
    {
        number: '02',
        icon: <Cloud size={32} />,
        title: 'API Dispatch',
        description: 'The Next.js backend receives the request and immediately dispatches three parallel processing pipelines.',
        color: '#8b5cf6',
    },
    {
        number: '03',
        icon: <Cpu size={32} />,
        title: 'Multi-Modal Analysis',
        description: 'HuggingFace AI detector, GPT-4 Vision analysis, and DCT frequency analysis run simultaneously.',
        color: '#a855f7',
    },
    {
        number: '04',
        icon: <GitMerge size={32} />,
        title: 'Weighted Fusion',
        description: 'Results are aggregated using our weighted fusion algorithm: 60% detection, 30% LLM, 10% frequency.',
        color: '#ec4899',
    },
    {
        number: '05',
        icon: <FileCheck size={32} />,
        title: 'Results & Insights',
        description: 'Comprehensive response with classification, confidence, detected artifacts, and educational insights.',
        color: '#14b8a6',
    },
];

const pipelines = [
    {
        name: 'HuggingFace Detector',
        weight: '60%',
        description: 'Quantitative AI detection using trained classification model',
        icon: <BarChart3 size={20} />,
    },
    {
        name: 'Vision-Language Model',
        weight: '30%',
        description: 'GPT-4V analyzes visual artifacts and semantic inconsistencies',
        icon: <Brain size={20} />,
    },
    {
        name: 'DCT Analysis',
        weight: '10%',
        description: 'Frequency domain analysis for spectral anomaly detection',
        icon: <Cpu size={20} />,
    },
];

export default function HowItWorks() {
    return (
        <section className="how-it-works-section" id="how-it-works">
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="section-label">Workflow</span>
                    <h2>
                        How <span className="gradient-text">It Works</span>
                    </h2>
                    <p>
                        Our microservices-based architecture orchestrates multiple AI services
                        through a unified API gateway for scalable deepfake detection.
                    </p>
                </motion.div>

                {/* Process Steps */}
                <div className="steps-container">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            className="step-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                            <div className="step-number" style={{ color: step.color }}>
                                {step.number}
                            </div>
                            <div
                                className="step-icon"
                                style={{ color: step.color, backgroundColor: `${step.color}15` }}
                            >
                                {step.icon}
                            </div>
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                            {index < steps.length - 1 && (
                                <div className="step-arrow">
                                    <ArrowRight size={24} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Detection Pipelines Diagram */}
                <motion.div
                    className="pipelines-section"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <h3>Detection Pipelines</h3>
                    <div className="pipelines-diagram">
                        <div className="input-node">
                            <Upload size={24} />
                            <span>Image Input</span>
                        </div>

                        <div className="pipelines-branch">
                            <div className="branch-line"></div>
                            <div className="pipelines-list">
                                {pipelines.map((pipeline, index) => (
                                    <motion.div
                                        key={pipeline.name}
                                        className="pipeline-card"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                                    >
                                        <div className="pipeline-header">
                                            {pipeline.icon}
                                            <span className="pipeline-name">{pipeline.name}</span>
                                            <span className="pipeline-weight">{pipeline.weight}</span>
                                        </div>
                                        <p className="pipeline-desc">{pipeline.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="branch-line"></div>
                        </div>

                        <div className="fusion-node">
                            <GitMerge size={24} />
                            <span>Weighted Fusion</span>
                        </div>

                        <div className="output-node">
                            <FileCheck size={24} />
                            <span>Results + Explanation</span>
                        </div>
                    </div>
                </motion.div>

                {/* Formula Display */}
                <motion.div
                    className="formula-section"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <h4>Fusion Formula</h4>
                    <div className="formula">
                        <code>
                            Final Score = (HuggingFace × 0.6) + (Vision-LLM × 0.3) + (DCT × 0.1)
                        </code>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
        .how-it-works-section {
          padding: var(--space-3xl) 0;
        }

        .section-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto var(--space-3xl);
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

        .steps-container {
          display: flex;
          justify-content: space-between;
          gap: var(--space-md);
          margin-bottom: var(--space-3xl);
          overflow-x: auto;
          padding-bottom: var(--space-md);
        }

        .step-card {
          position: relative;
          flex: 1;
          min-width: 180px;
          padding: var(--space-xl);
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .step-number {
          font-size: 0.85rem;
          font-weight: 700;
          font-family: var(--font-mono);
          margin-bottom: var(--space-sm);
        }

        .step-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-md);
          border-radius: var(--radius-lg);
        }

        .step-card h3 {
          font-size: 1rem;
          margin-bottom: var(--space-sm);
        }

        .step-card p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        .step-arrow {
          position: absolute;
          right: -22px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          z-index: 1;
        }

        .pipelines-section {
          margin-bottom: var(--space-2xl);
        }

        .pipelines-section h3 {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .pipelines-diagram {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-lg);
          flex-wrap: wrap;
        }

        .input-node,
        .fusion-node,
        .output-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-lg);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          color: var(--primary-400);
        }

        .input-node span,
        .fusion-node span,
        .output-node span {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .pipelines-branch {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .branch-line {
          width: 40px;
          height: 2px;
          background: var(--glass-border);
        }

        .pipelines-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .pipeline-card {
          padding: var(--space-md);
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          min-width: 280px;
        }

        .pipeline-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-xs);
          color: var(--primary-400);
        }

        .pipeline-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .pipeline-weight {
          margin-left: auto;
          padding: 2px 8px;
          background: var(--primary-900);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary-400);
        }

        .pipeline-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }

        .formula-section {
          text-align: center;
          padding: var(--space-xl);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
        }

        .formula-section h4 {
          margin-bottom: var(--space-md);
          color: var(--text-muted);
          font-weight: 500;
        }

        .formula code {
          font-family: var(--font-mono);
          font-size: 1.1rem;
          color: var(--primary-400);
          background: var(--primary-900);
          padding: var(--space-sm) var(--space-lg);
          border-radius: var(--radius-md);
        }

        @media (max-width: 992px) {
          .steps-container {
            flex-wrap: wrap;
            justify-content: center;
          }

          .step-card {
            flex: 0 0 calc(50% - var(--space-md));
          }

          .step-arrow {
            display: none;
          }

          .pipelines-diagram {
            flex-direction: column;
          }

          .pipelines-branch {
            flex-direction: column;
          }

          .branch-line {
            width: 2px;
            height: 20px;
          }
        }

        @media (max-width: 768px) {
          .step-card {
            flex: 0 0 100%;
          }

          .formula code {
            font-size: 0.85rem;
            display: block;
            word-break: break-all;
          }
        }
      `}</style>
        </section>
    );
}
