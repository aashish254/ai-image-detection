'use client';

import { useState } from 'react';
import { VisionLLMResult, ForensicReport } from '@/lib/types';
import { readable } from '@/lib/report';

interface ExplanationPanelProps {
  visionAnalysis?: VisionLLMResult['analysis'];
  forensicReport?: ForensicReport;
}

export default function ExplanationPanel({
  visionAnalysis,
  forensicReport,
}: ExplanationPanelProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  if (!forensicReport) {
    return (
      <div className="panel">
        <p className="label">Attribution</p>
        <p className="empty">
          The forensic pass did not return, so this report carries only the three weighted scores
          and the fused verdict.
        </p>

        <style jsx>{`
          .panel {
            min-width: 0;
          }

          .empty {
            margin: 10px 0 0;
            font-size: 0.9375rem;
            line-height: 1.6;
            color: var(--graphite);
            max-width: 62ch;
          }
        `}</style>
      </div>
    );
  }

  const verdict = forensicReport.verdict;
  const artifacts = forensicReport.detectedArtifacts;
  const strong = artifacts.filter((a) => a.severity === 'high');
  const moderate = artifacts.filter((a) => a.severity === 'medium');

  const platformMatch = forensicReport.forensicSummary.match(
    /Source Platform Identified: (.+?)[\*\n]/,
  );
  const platform = platformMatch?.[1]?.trim();

  const isAI = verdict === 'AI_GENERATED' || verdict === 'LIKELY_AI';

  // Only flag traces when the verdict is actually AI — the summary writes
  // "No SynthID" for a real image, which would otherwise false-match.
  const traces = [
    isAI && /SynthID Watermark.*detected/i.test(forensicReport.forensicSummary)
      ? 'SynthID (Google)'
      : null,
    isAI && /C2PA Content Credentials.*found|C2PA.*signature.*found/i.test(forensicReport.forensicSummary)
      ? 'C2PA credentials'
      : null,
    isAI && /Stable Diffusion Watermark.*detected/i.test(forensicReport.forensicSummary)
      ? 'Stable Diffusion DWT-DCT'
      : null,
  ].filter(Boolean) as string[];

  const methodology = forensicReport.technicalAnalysis
    .replace(/\*\*/g, '')
    .replace(/\\n/g, '\n')
    .split('\n')
    .filter((line) => line.trim())
    .slice(0, 8)
    .join('\n');

  return (
    <div className="panel">
      <p className="label">Attribution</p>

      <div className="doc-fields">
        <div>
          <span className="fl">platform</span>
          <span className="fv">{platform || 'Not attributed'}</span>
        </div>
        <div>
          <span className="fl">traces</span>
          <span className={traces.length > 0 ? 'fv' : 'fv dim'}>
            {traces.length > 0 ? traces.join(' · ') : 'No generator mark or signature read'}
          </span>
        </div>
        <div>
          <span className="fl">regions</span>
          <span className="fv">
            {artifacts.length} flagged
            {strong.length + moderate.length > 0 &&
              ` — ${strong.length} strong, ${moderate.length} moderate`}
          </span>
        </div>
        <div>
          <span className="fl">sentinel</span>
          <span className={forensicReport.vptModelLoaded ? 'fv' : 'fv dim'}>
            {forensicReport.vptModelLoaded
              ? 'Artifact sentinel answered'
              : forensicReport.vptServerAvailable
                ? 'Answered in demo mode (needs CUDA)'
                : 'Sentinel server did not answer'}
          </span>
        </div>
      </div>

      {strong.length > 0 && (
        <>
          <p className="label">Strongest regions, positioned as a share of the frame</p>

          <div className="coords">
            {strong.slice(0, 6).map((artifact, i) => (
              <div className="coord-row" key={`${artifact.x}-${artifact.y}-${i}`}>
                <span className="c">
                  {Math.round(artifact.regionX * 100)}, {Math.round(artifact.regionY * 100)}
                </span>
                <span className="t">{readable(artifact.anomalyType)}</span>
                <span className="v">{(artifact.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        className="toggle"
        aria-expanded={showTechnical}
        onClick={() => setShowTechnical((s) => !s)}
      >
        <span>{showTechnical ? 'Hide' : 'Read'} the technical reasoning</span>
        <span aria-hidden="true">{showTechnical ? '−' : '+'}</span>
      </button>

      {showTechnical && (
        <div className="tech">
          <div className="block">
            <p className="label">How the reasoning was built</p>
            <p className="body">{methodology}</p>
          </div>

          {visionAnalysis?.overallAssessment && (
            <div className="block">
              <p className="label">What the vision read said</p>
              <p className="body">{visionAnalysis.overallAssessment}</p>
            </div>
          )}

          {forensicReport.reasoning && (
            <div className="block">
              <p className="label">Report reasoning</p>
              <p className="body">{forensicReport.reasoning}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .coords {
          margin-top: 10px;
          border-top: 1px solid var(--rule-soft);
        }

        .coord-row {
          display: grid;
          grid-template-columns: 88px minmax(0, 1fr) 48px;
          align-items: baseline;
          gap: 14px;
          padding: 9px 0;
          border-bottom: 1px solid var(--rule-soft);
        }

        .c {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
          font-variant-numeric: tabular-nums;
        }

        .t {
          font-size: 0.9375rem;
          color: var(--graphite);
          overflow-wrap: anywhere;
        }

        .v {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          text-align: right;
          color: var(--flagged);
          font-variant-numeric: tabular-nums;
        }

        .toggle {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          background: none;
          border: 0;
          border-top: 1px solid var(--rule);
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--graphite);
          cursor: pointer;
          text-align: left;
        }

        .toggle:hover {
          color: var(--ink);
        }

        .toggle:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        .tech {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .body {
          margin: 8px 0 0;
          font-size: 0.9375rem;
          line-height: 1.6;
          color: var(--graphite);
          white-space: pre-line;
          max-width: 68ch;
          overflow-wrap: anywhere;
        }

        @media (max-width: 620px) {
          .coord-row {
            grid-template-columns: 76px minmax(0, 1fr) 44px;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}
