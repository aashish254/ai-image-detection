'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Zap,
  Brain,
  Sparkles,
  Download,
  History,
  RefreshCw,
  Sparkle
} from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { getVerdictLabel, formatProcessingTime } from '@/lib/utils';
import ConfidenceGauge from './ConfidenceGauge';
import DetectorBreakdown from './DetectorBreakdown';
import ArtifactViewer from './ArtifactViewer';
import ExplanationPanel from './ExplanationPanel';
import TrustIndicator from './TrustIndicator';
import SpatialHeatmap from './SpatialHeatmap';
import PDFExportButton from './PDFExportButton';
import AnalysisHistory from './AnalysisHistory';
import NovelContributionsPanel from './NovelContributionsPanel';
import GANIdentificationPanel from './GANIdentificationPanel';
import EnhancedSpatialVisualizer from './EnhancedSpatialVisualizer';
import SpectralVisualizer from './SpectralVisualizer';
import ImprovedGraphAnalysis from './ImprovedGraphAnalysis';
import { ExtendedAnalysisResult } from '@/lib/types';

interface AnalysisResultsProps {
  result: AnalysisResult & Partial<ExtendedAnalysisResult>;
  imageUrl: string;
  imageName?: string;
}

export default function AnalysisResults({ result, imageUrl, imageName }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'novel' | 'gan' | 'spatial' | 'trust'>('overview');
  const [historyCount, setHistoryCount] = useState(0);
  const verdictInfo = getVerdictLabel(result.verdict);

  // Track history count
  useEffect(() => {
    const updateHistoryCount = () => {
      try {
        const history = localStorage.getItem('ai_forensic_history');
        if (history) {
          const items = JSON.parse(history);
          setHistoryCount(Array.isArray(items) ? items.length : 0);
        }
      } catch {
        setHistoryCount(0);
      }
    };

    updateHistoryCount();
    window.addEventListener('historyUpdated', updateHistoryCount);
    return () => window.removeEventListener('historyUpdated', updateHistoryCount);
  }, []);

  const getVerdictIcon = () => {
    switch (result.verdict) {
      case 'AI_GENERATED':
        return <XCircle size={24} />;
      case 'LIKELY_AI':
        return <AlertTriangle size={24} />;
      case 'UNCERTAIN':
        return <HelpCircle size={24} />;
      case 'LIKELY_REAL':
      case 'REAL':
        return <CheckCircle size={24} />;
      default:
        return <HelpCircle size={24} />;
    }
  };

  const totalProcessingTime =
    result.detectors.huggingface.processingTime +
    result.detectors.visionLLM.processingTime +
    result.detectors.dctAnalysis.processingTime;

  return (
    <motion.div
      className="analysis-results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section with Verdict */}
      <div className="results-hero">
        <motion.div
          className="verdict-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ borderColor: verdictInfo.color }}
        >
          <div className="verdict-icon" style={{ color: verdictInfo.color }}>
            {getVerdictIcon()}
          </div>
          <div className="verdict-content">
            <span className="verdict-emoji">{verdictInfo.emoji}</span>
            <h2 style={{ color: verdictInfo.color }}>{verdictInfo.label}</h2>
            <div className="verdict-meta">
              <span className="confidence-label">
                Calibrated Confidence: {(result.confidence * 100).toFixed(1)}%
              </span>
              {result.cached && <span className="cached-badge">Cached</span>}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat">
            <Clock size={16} />
            <span>{formatProcessingTime(totalProcessingTime)}</span>
          </div>
          <div className="stat">
            <Zap size={16} />
            <span>Trust: {(result.calibration.trustScore * 100).toFixed(0)}%</span>
          </div>
          <div className="stat">
            <Brain size={16} />
            <span>3 Detectors</span>
          </div>
          {result.spatialAnalysis.isLikelyComposite && (
            <div className="stat warning">
              <AlertTriangle size={16} />
              <span>Composite</span>
            </div>
          )}
        </div>

        <ConfidenceGauge score={result.confidence} verdict={result.verdict} />

        {/* Action Buttons */}
        <div className="action-buttons">
          <PDFExportButton result={result} imageUrl={imageUrl} imageName={imageName} />

          {/* History Button */}
          <AnalysisHistory triggerElement={
            <button className="action-btn history-btn" aria-label="View History">
              <History size={20} />
              <span>History</span>
              {historyCount > 0 && <span className="history-count">{historyCount}</span>}
            </button>
          } />

          {/* Analyze Another Image Button */}
          <button
            className="action-btn analyze-another-btn"
            onClick={() => window.location.reload()}
            aria-label="Analyze Another Image"
          >
            <Sparkle size={20} />
            <span>Analyze Another Image</span>
          </button>
        </div>
      </div>

      {/* Novel Features Badge */}
      <div className="novel-features-banner">
        <Sparkles size={18} />
        <span>
          Analysis powered by <strong>7 novel contributions</strong>:
          FSFN • XAI • EUQ • GFI • DACC • SAM • DRWF
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'novel' ? 'active' : ''}`}
            onClick={() => setActiveTab('novel')}
          >
            Novel AI
            <span className="tab-badge new">NEW</span>
          </button>
          <button
            className={`tab ${activeTab === 'gan' ? 'active' : ''}`}
            onClick={() => setActiveTab('gan')}
          >
            GAN Fingerprint
            <span className="tab-badge new">NEW</span>
          </button>
          <button
            className={`tab ${activeTab === 'spatial' ? 'active' : ''}`}
            onClick={() => setActiveTab('spatial')}
          >
            Spatial Map
            <span className="tab-badge">NOVEL</span>
          </button>
          <button
            className={`tab ${activeTab === 'trust' ? 'active' : ''}`}
            onClick={() => setActiveTab('trust')}
          >
            Trust Analysis
            <span className="tab-badge">NOVEL</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="overview-main">
              <ArtifactViewer
                imageUrl={imageUrl}
                artifacts={result.artifacts}
              />
              <ExplanationPanel
                explanation={result.explanation}
                insights={result.insights}
                visionAnalysis={result.detectors.visionLLM.analysis}
              />
            </div>
            <div className="overview-sidebar">
              <DetectorBreakdown result={result} />
            </div>
          </div>
        )}

        {activeTab === 'novel' && (
          <div className="novel-content">
            <NovelContributionsPanel
              fsfnData={result.fsfnAnalysis ? {
                frequencyScore: result.fsfnAnalysis.frequencyDomain.frequencyScore,
                spatialScore: result.fsfnAnalysis.spatialDomain.spatialScore,
                fusionScore: result.fsfnAnalysis.fusion.fusionScore,
                domainAgreement: result.fsfnAnalysis.fusion.domainAgreement,
                attentionWeights: {
                  frequency: result.fsfnAnalysis.fusion.attentionWeights.frequencyWeight,
                  spatial: result.fsfnAnalysis.fusion.attentionWeights.spatialWeight,
                },
                spectralFingerprint: result.fsfnAnalysis.frequencyDomain.spectralFingerprint,
                explanation: result.fsfnAnalysis.explanation,
              } : undefined}
              xaiData={result.xaiAnalysis ? {
                summary: result.xaiAnalysis.summary,
                attentionMap: result.xaiAnalysis.attentionMap.grid,
                regions: result.xaiAnalysis.regions,
                keyFactors: result.xaiAnalysis.keyFactors,
              } : undefined}
              uncertaintyData={result.uncertaintyAnalysis ? {
                prediction: result.uncertaintyAnalysis.prediction,
                lowerBound: result.uncertaintyAnalysis.confidenceInterval.lower,
                upperBound: result.uncertaintyAnalysis.confidenceInterval.upper,
                standardDeviation: result.uncertaintyAnalysis.standardDeviation,
                aleatoric: result.uncertaintyAnalysis.uncertaintyDecomposition.aleatoric,
                epistemic: result.uncertaintyAnalysis.uncertaintyDecomposition.epistemic,
                reliabilityScore: result.uncertaintyAnalysis.reliability.score,
                reliabilityLevel: result.uncertaintyAnalysis.reliability.level,
                humanReviewRecommended: result.uncertaintyAnalysis.reliability.humanReviewRecommended,
                recommendation: result.uncertaintyAnalysis.reliability.reason,
              } : undefined}
            />
          </div>
        )}

        {activeTab === 'gan' && (
          <div className="gan-content">
            <GANIdentificationPanel
              data={result.ganIdentification ? {
                isAIGenerated: result.ganIdentification.isAIGenerated,
                aiConfidence: result.ganIdentification.aiConfidence,
                identifiedGenerator: result.ganIdentification.identifiedGenerator,
                allMatches: result.ganIdentification.allMatches,
                analysis: result.ganIdentification.analysis,
                extractedFingerprint: result.ganIdentification.extractedFingerprint,
              } : undefined}
            />
          </div>
        )}

        {activeTab === 'spatial' && (
          <div className="spatial-content">
            {/* FFT Spectral Analysis */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <SpectralVisualizer imageBase64={imageUrl} />
            </div>

            {/* Enhanced Frequency & Reconstruction Visualizer */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <EnhancedSpatialVisualizer
                imageBase64={imageUrl}
                imageUrl={imageUrl}
              />
            </div>

            {/* Improved Graph Analysis */}
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <ImprovedGraphAnalysis
                spatialData={result.spatialAnalysis}
              />
            </div>

            {/* Original SAM Heatmap */}
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <SpatialHeatmap
                spatialAnalysis={result.spatialAnalysis}
                imageUrl={imageUrl}
              />
            </div>
          </div>
        )}

        {activeTab === 'trust' && (
          <div className="trust-content">
            <TrustIndicator calibration={result.calibration} />

            {/* Dynamic Weighting Info */}
            <motion.div
              className="dynamic-weighting-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3>
                <Zap size={18} />
                Dynamic Weight Adjustment
                <span className="novel-badge">NOVEL</span>
              </h3>
              <div className="weight-comparison">
                <div className="weight-row">
                  <span className="weight-label">Static Score:</span>
                  <span className="weight-value">
                    {(result.fusion.dynamicWeighting.staticScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="weight-row highlight">
                  <span className="weight-label">Dynamic Score:</span>
                  <span className="weight-value">
                    {(result.fusion.dynamicWeighting.dynamicScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="weight-row">
                  <span className="weight-label">Difference:</span>
                  <span className="weight-value">
                    {((result.fusion.dynamicWeighting.dynamicScore -
                      result.fusion.dynamicWeighting.staticScore) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="weight-explanation">
                {result.fusion.dynamicWeighting.weightAdjustments}
              </p>
              <div className="final-weights">
                <h4>Final Weights:</h4>
                <div className="weights-grid">
                  <div className="weight-item">
                    <span className="detector-name">HuggingFace</span>
                    <span className="detector-weight">
                      {(result.fusion.huggingfaceWeight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="weight-item">
                    <span className="detector-name">Gemini Vision</span>
                    <span className="detector-weight">
                      {(result.fusion.visionLLMWeight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="weight-item">
                    <span className="detector-name">DCT Analysis</span>
                    <span className="detector-weight">
                      {(result.fusion.dctWeight * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <style jsx>{`
        .analysis-results {
          max-width: 1200px;
          margin: 0 auto;
        }

        .results-hero {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

         .action-buttons {
          display: flex;
          justify-content: center;
          gap: var(--space-lg);
          margin-top: var(--space-xl);
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .action-btn.history-btn {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          color: white;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
        }

        .action-btn.history-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
        }

        .action-btn.analyze-another-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }

        .action-btn.analyze-another-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        .history-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
          font-weight: 700;
        }

        .verdict-card {
          display: inline-flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-xl) var(--space-2xl);
          background: var(--glass-bg);
          border: 2px solid;
          border-radius: var(--radius-xl);
          margin-bottom: var(--space-lg);
        }

        .verdict-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: currentColor;
          background: rgba(currentColor, 0.15);
          border-radius: var(--radius-lg);
        }

        .verdict-content {
          text-align: left;
        }

        .verdict-emoji {
          font-size: 1.5rem;
        }

        .verdict-content h2 {
          font-size: 1.75rem;
          margin: var(--space-xs) 0;
        }

        .verdict-meta {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .confidence-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .cached-badge {
          padding: 2px 8px;
          background: var(--primary-900);
          color: var(--primary-400);
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
        }

        .quick-stats {
          display: flex;
          justify-content: center;
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }

        .stat {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .stat.warning {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .novel-features-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-xl);
          color: var(--primary-400);
          font-size: 0.9rem;
        }

        .novel-features-banner strong {
          color: var(--primary-300);
        }

        .tabs-container {
          margin-bottom: var(--space-lg);
        }

        .tabs {
          display: flex;
          gap: var(--space-xs);
          padding: var(--space-xs);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
        }

        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--glass-bg);
        }

        .tab.active {
          background: var(--bg-elevated);
          color: var(--text-primary);
          font-weight: 500;
        }

        .tab-badge {
          padding: 1px 6px;
          background: var(--gradient-primary);
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
        }

        .tab-badge.new {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .novel-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .gan-content {
          max-width: 700px;
          margin: 0 auto;
        }


        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: var(--space-lg);
        }

        .overview-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .overview-sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .spatial-content,
        .trust-content,
        .technical-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .dynamic-weighting-card {
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }

        .dynamic-weighting-card h3 {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 1rem;
          margin-bottom: var(--space-md);
        }

        .novel-badge {
          padding: 2px 8px;
          background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          margin-left: auto;
        }

        .weight-comparison {
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
        }

        .weight-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-xs) 0;
        }

        .weight-row:not(:last-child) {
          border-bottom: 1px solid var(--glass-border);
        }

        .weight-row.highlight {
          font-weight: 600;
          color: var(--primary-400);
        }

        .weight-label {
          color: var(--text-muted);
        }

        .weight-explanation {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
        }

        .final-weights h4 {
          font-size: 0.9rem;
          margin-bottom: var(--space-sm);
        }

        .weights-grid {
          display: flex;
          gap: var(--space-md);
        }

        .weight-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .detector-name {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .detector-weight {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-400);
        }

        .raw-data-card {
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }

        .raw-data-card h3 {
          font-size: 1rem;
          margin-bottom: var(--space-md);
        }

        .raw-data-card pre {
          background: var(--bg-secondary);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          overflow-x: auto;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        @media (max-width: 992px) {
          .overview-grid {
            grid-template-columns: 1fr;
          }

          .quick-stats {
            flex-wrap: wrap;
          }

          .verdict-card {
            flex-direction: column;
            text-align: center;
          }

          .verdict-content {
            text-align: center;
          }

          .tabs {
            overflow-x: auto;
          }

          .tab {
            flex: none;
            white-space: nowrap;
          }

          .weights-grid {
            flex-direction: column;
          }
        }
      `}</style>
    </motion.div>
  );
}
