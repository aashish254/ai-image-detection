'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { AnalysisResult, ExtendedAnalysisResult } from '@/lib/types';
import { VERDICT_TONE, scoreTone } from '@/lib/report';
import { getVerdictLabel, formatProcessingTime } from '@/lib/utils';
import DetectorBreakdown from './DetectorBreakdown';
import ArtifactViewer from './ArtifactViewer';
import ExplanationPanel from './ExplanationPanel';
import TrustIndicator from './TrustIndicator';
import SpatialHeatmap from './SpatialHeatmap';
import PDFExportButton from './PDFExportButton';
import AnalysisHistory from './AnalysisHistory';
import NovelContributionsPanel from './NovelContributionsPanel';
import GANIdentificationPanel from './GANIdentificationPanel';
import SpectralVisualizer from './SpectralVisualizer';

interface AnalysisResultsProps {
  result: AnalysisResult & Partial<ExtendedAnalysisResult>;
  imageUrl: string;
  imageName?: string;
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'novel', label: 'Novel methods' },
  { key: 'gan', label: 'Generator' },
  { key: 'spatial', label: 'Spatial map' },
  { key: 'reliability', label: 'Reliability' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function AnalysisResults({ result, imageUrl, imageName }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [historyCount, setHistoryCount] = useState(0);

  const verdictInfo = getVerdictLabel(result.verdict);
  const tone = VERDICT_TONE[result.verdict] ?? 'caution';

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

  const reads = [
    { name: 'HuggingFace classifier', read: result.detectors.huggingface },
    { name: 'Gemini vision review', read: result.detectors.visionLLM },
    { name: 'DCT spectra', read: result.detectors.dctAnalysis },
  ];

  const slowestRead = Math.max(...reads.map((r) => r.read.processingTime));

  return (
    <motion.div
      className="analysis-results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="issued">
        <div className={`stamp ${tone}`}>
          <span className="seal">
            <b>{verdictInfo.label.toUpperCase()}</b>
            <span>confidence {result.confidence.toFixed(2)}</span>
          </span>
        </div>

        <p className="measure">
          trust {result.calibration.trustScore.toFixed(2)} · read agreement{' '}
          {result.calibration.disagreementType} · three weighted reads
        </p>

        <p className="statement">{result.explanation}</p>

        <div className="ro-rows">
          {reads.map(({ name, read }) => (
            <div className="ro-row" key={name}>
              <span className="ro-name">{name}</span>
              <span className="ro-meter" aria-hidden="true">
                <i
                  className={scoreTone(read.score)}
                  style={{ width: `${Math.round(read.score * 100)}%` }}
                />
              </span>
              <span className="ro-val">{read.score.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <p className="ro-foot">
          {result.cached
            ? 'Served from the 24-hour result cache.'
            : `Four reads ran together; the slowest took ${formatProcessingTime(slowestRead)}.`}{' '}
          {result.spatialAnalysis.isLikelyComposite
            ? 'The spatial read flags this image as a composite.'
            : 'The spatial read found no boundary a pasted region would leave.'}
        </p>

        <div className="actions">
          <PDFExportButton result={result} imageUrl={imageUrl} imageName={imageName} />

          <AnalysisHistory
            triggerElement={
              <button className="btn btn-secondary" aria-label="Past reports">
                <History size={16} />
                <span>Past reports{historyCount > 0 ? ` · ${historyCount}` : ''}</span>
              </button>
            }
          />
        </div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="overview-main">
              <ArtifactViewer
                imageUrl={imageUrl}
                marks={result.vptAnalysis?.boundingBoxes ?? []}
                artifacts={result.artifacts}
              />
              <ExplanationPanel
                visionAnalysis={result.detectors.visionLLM.analysis}
                forensicReport={result.forensicReport}
              />
            </div>
            <div className="overview-side">
              <DetectorBreakdown result={result} />
            </div>
          </div>
        )}

        {activeTab === 'novel' && (
          <NovelContributionsPanel
            fsfnData={
              result.fsfnAnalysis
                ? {
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
                  }
                : undefined
            }
            xaiData={
              result.xaiAnalysis
                ? {
                    summary: result.xaiAnalysis.summary,
                    attentionMap: result.xaiAnalysis.attentionMap.grid,
                    regions: result.xaiAnalysis.regions,
                    keyFactors: result.xaiAnalysis.keyFactors,
                  }
                : undefined
            }
            uncertaintyData={
              result.uncertaintyAnalysis
                ? {
                    prediction: result.uncertaintyAnalysis.prediction,
                    lowerBound: result.uncertaintyAnalysis.confidenceInterval.lower,
                    upperBound: result.uncertaintyAnalysis.confidenceInterval.upper,
                    standardDeviation: result.uncertaintyAnalysis.standardDeviation,
                    aleatoric: result.uncertaintyAnalysis.uncertaintyDecomposition.aleatoric,
                    epistemic: result.uncertaintyAnalysis.uncertaintyDecomposition.epistemic,
                    reliabilityScore: result.uncertaintyAnalysis.reliability.score,
                    reliabilityLevel: result.uncertaintyAnalysis.reliability.level,
                    humanReviewRecommended:
                      result.uncertaintyAnalysis.reliability.humanReviewRecommended,
                    recommendation: result.uncertaintyAnalysis.reliability.reason,
                  }
                : undefined
            }
          />
        )}

        {activeTab === 'gan' && (
          <GANIdentificationPanel
            data={
              result.ganIdentification
                ? {
                    isAIGenerated: result.ganIdentification.isAIGenerated,
                    aiConfidence: result.ganIdentification.aiConfidence,
                    identifiedGenerator: result.ganIdentification.identifiedGenerator,
                    allMatches: result.ganIdentification.allMatches,
                    analysis: result.ganIdentification.analysis,
                    extractedFingerprint: result.ganIdentification.extractedFingerprint,
                  }
                : undefined
            }
          />
        )}

        {activeTab === 'spatial' && (
          <div className="stack">
            <SpectralVisualizer imageBase64={imageUrl} />

            <SpatialHeatmap
              spatialAnalysis={result.spatialAnalysis}
              imageUrl={imageUrl}
              forensicReport={result.forensicReport}
            />
          </div>
        )}

        {activeTab === 'reliability' && (
          <div className="stack">
            <TrustIndicator calibration={result.calibration} />

            <div className="weighting">
              <p className="label">Score before and after reliability weighting</p>

              <div className="ro-rows">
                <div className="ro-row pair">
                  <span className="ro-name">Fixed weights</span>
                  <span className="ro-val">
                    {(result.fusion.dynamicWeighting.staticScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="ro-row pair">
                  <span className="ro-name">Reliability-weighted</span>
                  <span className="ro-val">
                    {(result.fusion.dynamicWeighting.dynamicScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="ro-row pair">
                  <span className="ro-name">Change</span>
                  <span className="ro-val">
                    {(
                      (result.fusion.dynamicWeighting.dynamicScore -
                        result.fusion.dynamicWeighting.staticScore) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>

              <p className="note">{result.fusion.dynamicWeighting.weightAdjustments}</p>

              <p className="label">Weights each read carried into the fusion</p>

              <div className="ro-rows">
                <div className="ro-row pair">
                  <span className="ro-name">HuggingFace classifier</span>
                  <span className="ro-val">
                    {(result.fusion.huggingfaceWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="ro-row pair">
                  <span className="ro-name">Gemini vision review</span>
                  <span className="ro-val">{(result.fusion.visionLLMWeight * 100).toFixed(0)}%</span>
                </div>
                <div className="ro-row pair">
                  <span className="ro-name">DCT spectra</span>
                  <span className="ro-val">{(result.fusion.dctWeight * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* motion.div is a custom component, so styled-jsx cannot inject its scope
           class onto the DOM node. Declared :global with the ol- prefix instead. */
        :global(.analysis-results) {
          min-width: 0;
        }

        .issued {
          padding: 26px 30px 24px;
          border-bottom: 1px solid var(--rule);
        }

        .stamp {
          display: inline-block;
          padding: 2px 3px;
        }

        .stamp .seal {
          padding: 0.75rem 1.0625rem;
        }

        .stamp .seal b {
          font-size: 1.375rem;
          letter-spacing: 0.02em;
        }

        .stamp .seal span {
          font-size: 0.9375rem;
          margin-top: 0.3125rem;
        }

        .measure {
          margin: 18px 0 0;
          font-family: var(--font-mono);
          font-size: 0.9375rem;
          color: var(--graphite);
          font-variant-numeric: tabular-nums;
        }

        .stamp.flagged {
          color: var(--flagged);
        }

        .stamp.caution {
          color: var(--caution);
        }

        .stamp.verified {
          color: var(--verified);
        }

        .statement {
          margin-top: 16px;
          font-size: 1rem;
          line-height: 1.65;
          color: var(--graphite);
          max-width: 68ch;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0 24px;
          padding: 0 30px;
          border-bottom: 1px solid var(--rule);
        }

        .tab {
          padding: 12px 0 10px;
          margin-bottom: -1px;
          background: none;
          border: 0;
          border-bottom: 2px solid transparent;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
          cursor: pointer;
          transition: color var(--transition-fast), border-color var(--transition-fast);
        }

        .tab:hover {
          color: var(--ink);
        }

        .tab.active {
          color: var(--ink);
          border-bottom-color: var(--ink);
          font-weight: 600;
        }

        .tab:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        .tab-content {
          padding: 24px 30px 28px;
          min-width: 0;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 32px;
          align-items: start;
        }

        .overview-main,
        .overview-side,
        .stack {
          display: flex;
          flex-direction: column;
          gap: 26px;
          min-width: 0;
        }

        .ro-row.pair {
          grid-template-columns: minmax(0, 1fr) 88px;
        }

        .weighting .ro-rows:first-of-type {
          margin-top: 12px;
        }

        .weighting .note {
          margin: 14px 0 24px;
          font-size: 0.9375rem;
          line-height: 1.55;
          color: var(--muted);
          max-width: 66ch;
        }

        @media (max-width: 1040px) {
          .overview-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .issued,
          .tabs,
          .tab-content {
            padding-left: 20px;
            padding-right: 20px;
          }
        }
      `}</style>
    </motion.div>
  );
}
