'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Brain,
  Lightbulb,
  BookOpen,
  Code,
  Sparkles,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { EducationalInsight, VisionLLMResult } from '@/lib/types';

interface ExplanationPanelProps {
  explanation: string;
  insights: EducationalInsight[];
  visionAnalysis?: VisionLLMResult['analysis'];
}

export default function ExplanationPanel({
  explanation,
  insights,
  visionAnalysis
}: ExplanationPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('summary');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getCategoryIcon = (category: EducationalInsight['category']) => {
    switch (category) {
      case 'technical':
        return <Code size={16} />;
      case 'visual':
        return <Brain size={16} />;
      case 'semantic':
        return <MessageSquare size={16} />;
      case 'novel':
        return <Sparkles size={16} />;
      case 'general':
      default:
        return <Lightbulb size={16} />;
    }
  };

  const getCategoryColor = (category: EducationalInsight['category']) => {
    switch (category) {
      case 'technical':
        return '#6366f1';
      case 'visual':
        return '#8b5cf6';
      case 'semantic':
        return '#ec4899';
      case 'novel':
        return '#f59e0b';
      case 'general':
      default:
        return '#22c55e';
    }
  };

  // Separate novel insights from others
  const novelInsights = insights.filter(i => i.category === 'novel');
  const otherInsights = insights.filter(i => i.category !== 'novel');

  return (
    <motion.div
      className="explanation-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main Summary */}
      <div className="panel-section">
        <button
          className={`section-header ${expandedSection === 'summary' ? 'expanded' : ''}`}
          onClick={() => toggleSection('summary')}
        >
          <div className="section-title">
            <MessageSquare size={18} />
            <span>Analysis Summary</span>
          </div>
          {expandedSection === 'summary' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <AnimatePresence>
          {expandedSection === 'summary' && (
            <motion.div
              className="section-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="summary-text">{explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Novel Contributions Section */}
      {novelInsights.length > 0 && (
        <div className="panel-section novel">
          <button
            className={`section-header ${expandedSection === 'novel' ? 'expanded' : ''}`}
            onClick={() => toggleSection('novel')}
          >
            <div className="section-title">
              <Sparkles size={18} />
              <span>Novel Analysis Features</span>
              <span className="novel-badge">NEW</span>
            </div>
            {expandedSection === 'novel' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <AnimatePresence>
            {expandedSection === 'novel' && (
              <motion.div
                className="section-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="insights-list">
                  {novelInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      className="insight-card novel"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div
                        className="insight-icon"
                        style={{
                          color: getCategoryColor(insight.category),
                          backgroundColor: `${getCategoryColor(insight.category)}15`
                        }}
                      >
                        {getCategoryIcon(insight.category)}
                      </div>
                      <div className="insight-content">
                        <h4>{insight.title}</h4>
                        <p>{insight.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Vision Model Analysis */}
      {visionAnalysis && (
        <div className="panel-section">
          <button
            className={`section-header ${expandedSection === 'vision' ? 'expanded' : ''}`}
            onClick={() => toggleSection('vision')}
          >
            <div className="section-title">
              <Brain size={18} />
              <span>Gemini Vision Analysis</span>
            </div>
            {expandedSection === 'vision' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <AnimatePresence>
            {expandedSection === 'vision' && (
              <motion.div
                className="section-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="vision-assessment">
                  <p>{visionAnalysis.overallAssessment}</p>
                </div>

                {visionAnalysis.artifactsDetected?.length > 0 && (
                  <div className="artifacts-detected">
                    <h5>Detected Artifacts:</h5>
                    <ul>
                      {visionAnalysis.artifactsDetected.map((artifact, index) => (
                        <li key={index}>
                          <strong>{artifact.type}:</strong> {artifact.description}
                          <span className="artifact-confidence">
                            ({(artifact.confidence * 100).toFixed(0)}% confidence)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {visionAnalysis.semanticIssues?.length > 0 && (
                  <div className="semantic-issues">
                    <h5>Semantic Issues:</h5>
                    <ul>
                      {visionAnalysis.semanticIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {visionAnalysis.confidenceExplanation && (
                  <div className="confidence-explanation">
                    <h5>Confidence Explanation:</h5>
                    <p>{visionAnalysis.confidenceExplanation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Educational Insights */}
      <div className="panel-section">
        <button
          className={`section-header ${expandedSection === 'insights' ? 'expanded' : ''}`}
          onClick={() => toggleSection('insights')}
        >
          <div className="section-title">
            <BookOpen size={18} />
            <span>Educational Insights</span>
          </div>
          {expandedSection === 'insights' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <AnimatePresence>
          {expandedSection === 'insights' && (
            <motion.div
              className="section-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="insights-list">
                {otherInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    className="insight-card"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className="insight-icon"
                      style={{
                        color: getCategoryColor(insight.category),
                        backgroundColor: `${getCategoryColor(insight.category)}15`
                      }}
                    >
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div className="insight-content">
                      <h4>{insight.title}</h4>
                      <p>{insight.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .explanation-panel {
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .panel-section {
          border-bottom: 1px solid var(--glass-border);
        }

        .panel-section:last-child {
          border-bottom: none;
        }

        .panel-section.novel {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.02));
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: var(--space-md) var(--space-lg);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .section-header:hover {
          background: var(--glass-bg);
        }

        .section-header.expanded {
          background: var(--glass-bg);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-weight: 500;
          color: var(--text-primary);
        }

        .novel-badge {
          padding: 2px 6px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
        }

        .section-content {
          padding: 0 var(--space-lg) var(--space-lg);
          overflow: hidden;
        }

        .summary-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .insight-card {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .insight-card.novel {
          border: 1px solid rgba(245, 158, 11, 0.3);
          background: rgba(245, 158, 11, 0.05);
        }

        .insight-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .insight-content h4 {
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0 0 var(--space-xs);
        }

        .insight-content p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .vision-assessment {
          margin-bottom: var(--space-md);
        }

        .vision-assessment p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }

        .artifacts-detected,
        .semantic-issues,
        .confidence-explanation {
          margin-bottom: var(--space-md);
        }

        .artifacts-detected h5,
        .semantic-issues h5,
        .confidence-explanation h5 {
          font-size: 0.85rem;
          color: var(--text-primary);
          margin: 0 0 var(--space-sm);
        }

        .artifacts-detected ul,
        .semantic-issues ul {
          margin: 0;
          padding-left: var(--space-lg);
        }

        .artifacts-detected li,
        .semantic-issues li {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-xs);
          line-height: 1.5;
        }

        .artifact-confidence {
          color: var(--text-muted);
          font-size: 0.75rem;
          margin-left: var(--space-xs);
        }

        .confidence-explanation p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .insight-card {
            flex-direction: column;
          }

          .insight-icon {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </motion.div>
  );
}
