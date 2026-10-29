'use client';

import { AnalysisResult } from '@/lib/types';
import { BASE_WEIGHTS } from '@/lib/dynamic-weights';
import { formatProcessingTime } from '@/lib/utils';

interface DetectorBreakdownProps {
  result: AnalysisResult;
}

const STATUS_WORD: Record<string, string> = {
  success: 'ok',
  fallback: 'fallback',
  error: 'failed',
};

export default function DetectorBreakdown({ result }: DetectorBreakdownProps) {
  const rows = [
    {
      name: 'HuggingFace classifier',
      detail: 'Organika/sdxl-detector, run locally on the Python server',
      read: result.detectors.huggingface,
      weight: result.fusion.huggingfaceWeight,
      baseWeight: BASE_WEIGHTS.huggingface,
    },
    {
      name: 'Gemini vision review',
      detail: 'gemini-3-flash-preview, semantic read of the whole frame',
      read: result.detectors.visionLLM,
      weight: result.fusion.visionLLMWeight,
      baseWeight: BASE_WEIGHTS.visionLLM,
    },
    {
      name: 'DCT spectra',
      detail: '8×8 block frequencies measured in the browser',
      read: result.detectors.dctAnalysis,
      baseWeight: BASE_WEIGHTS.dct,
      weight: result.fusion.dctWeight,
    },
  ];

  return (
    <div className="breakdown">
      <p className="label">Where each score came from</p>

      <div className="rows">
        {rows.map((row) => (
          <div className="item" key={row.name}>
            <div className="top">
              <span className="name">{row.name}</span>
              <span className={`status ${row.read.status}`}>
                {STATUS_WORD[row.read.status] ?? row.read.status}
              </span>
            </div>

            <p className="detail">{row.detail}</p>

            <div className="figures">
              <span className="fig">
                weight <b>{(row.weight * 100).toFixed(0)}%</b>
                <em>of base {(row.baseWeight * 100).toFixed(0)}%</em>
              </span>
              <span className="fig">
                took <b>{formatProcessingTime(row.read.processingTime)}</b>
              </span>
              <span className="fig">
                self-reported <b>{(row.read.confidence * 100).toFixed(0)}%</b>
              </span>
            </div>

            {row.read.error && <p className="error">{row.read.error}</p>}
          </div>
        ))}
      </div>

      <div className="fusion">
        <p className="label">Fused score</p>
        <div className="ro-row pair">
          <span className="ro-name">Three weighted reads, before calibration</span>
          <span className="ro-val">{result.fusion.finalScore.toFixed(2)}</span>
        </div>
        <div className="ro-row pair">
          <span className="ro-name">After calibration</span>
          <span className="ro-val">{result.calibration.calibratedScore.toFixed(2)}</span>
        </div>
      </div>

      <style jsx>{`
        .breakdown,
        .fusion {
          min-width: 0;
        }

        .fusion {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--rule);
        }

        .ro-row.pair {
          grid-template-columns: minmax(0, 1fr) 56px;
          gap: 10px;
        }

        .rows {
          margin-top: 4px;
        }

        .item {
          padding: 14px 0;
          border-bottom: 1px solid var(--rule-soft);
        }

        .top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
        }

        .name {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--ink);
        }

        .status {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
          white-space: nowrap;
        }

        .status.success {
          color: var(--verified);
        }

        .status.fallback,
        .status.error {
          color: var(--flagged);
        }

        .detail {
          margin: 3px 0 0;
          font-size: 0.875rem;
          line-height: 1.45;
          color: var(--muted);
        }

        .figures {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 16px;
          margin-top: 8px;
        }

        .fig {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
          font-variant-numeric: tabular-nums;
        }

        .fig b {
          color: var(--ink);
          font-weight: 600;
          margin-left: 3px;
        }

        .fig em {
          font-style: normal;
          margin-left: 4px;
        }

        .error {
          margin: 8px 0 0;
          padding: 7px 9px;
          border-left: 2px solid var(--flagged);
          background: var(--flagged-wash);
          font-family: var(--font-mono);
          font-size: 0.875rem;
          line-height: 1.4;
          color: var(--ink);
          overflow-wrap: anywhere;
        }
      `}</style>
    </div>
  );
}
