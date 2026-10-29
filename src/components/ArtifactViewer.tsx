'use client';

import { useState } from 'react';
import { Artifact } from '@/lib/types';
import { readable } from '@/lib/report';

interface Mark {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  label: string;
  description: string;
  confidence: number;
}

interface ArtifactViewerProps {
  imageUrl: string;
  marks: Mark[];
  artifacts: Artifact[];
}

/** Same thresholds the sentinel itself uses when it grades a box. */
const confidenceTone = (confidence: number): 'high' | 'medium' | 'low' =>
  confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low';

const SEVERITY_WORD: Record<'high' | 'medium' | 'low', string> = {
  high: 'strong',
  medium: 'moderate',
  low: 'weak',
};

export default function ArtifactViewer({ imageUrl, marks, artifacts }: ArtifactViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [showMarks, setShowMarks] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  const toggle = (index: number) => setSelected(selected === index ? null : index);

  return (
    <div className="viewer">
      <p className="label">Specimen with the regions the sentinel boxed</p>

      <div className="frame">
        <div className="viewport">
          <div className="plate" style={{ transform: `scale(${zoom})` }}>
            <img src={imageUrl} alt="Analysed image with the regions the sentinel boxed" />
            {showMarks &&
              marks.map((mark, index) => (
                <span
                  key={`${mark.label}-${index}`}
                  className={`mark ${confidenceTone(mark.confidence)} ${
                    selected === index ? 'on' : ''
                  }`}
                  style={{
                    left: `${mark.xmin * 100}%`,
                    top: `${mark.ymin * 100}%`,
                    width: `${(mark.xmax - mark.xmin) * 100}%`,
                    height: `${(mark.ymax - mark.ymin) * 100}%`,
                  }}
                  onClick={() => toggle(index)}
                />
              ))}
          </div>
        </div>

        <div className="bar">
          <div className="group">
            <button
              className="ctl"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              disabled={zoom <= 0.5}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="zoom">{Math.round(zoom * 100)}%</span>
            <button
              className="ctl"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              disabled={zoom >= 3}
              aria-label="Zoom in"
            >
              +
            </button>
            <button className="ctl" onClick={() => setZoom(1)} aria-label="Reset zoom">
              1:1
            </button>
          </div>

          {marks.length > 0 && (
            <button
              className="ctl text"
              aria-pressed={showMarks}
              onClick={() => setShowMarks((s) => !s)}
            >
              {showMarks ? 'Hide boxes' : 'Show boxes'}
            </button>
          )}
        </div>
      </div>

      {marks.length > 0 ? (
        <div className="list">
          {marks.map((mark, index) => (
            <button
              key={`${mark.label}-${index}`}
              className={`row ${selected === index ? 'on' : ''}`}
              onClick={() => toggle(index)}
            >
              <span className={`sev ${confidenceTone(mark.confidence)}`}>
                {SEVERITY_WORD[confidenceTone(mark.confidence)]}
              </span>
              <span className="what">
                <b>{readable(mark.label)}</b>
                <p>{mark.description}</p>
              </span>
              <span className="where">
                {Math.round(mark.xmin * 100)}–{Math.round(mark.xmax * 100)}×
              </span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <p className="none">
            Nothing came back with a box around it, so the image is unmarked. The findings below
            describe the whole frame.
          </p>

          {artifacts.length > 0 && (
            <div className="list">
              {artifacts.map((artifact) => (
                <div className="row still" key={artifact.id}>
                  <span className={`sev ${artifact.severity}`}>
                    {SEVERITY_WORD[artifact.severity]}
                  </span>
                  <span className="what">
                    <b>{readable(artifact.type)}</b>
                    <p>{artifact.description}</p>
                  </span>
                  <span className="where">{artifact.region ?? 'whole frame'}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .viewer {
          min-width: 0;
        }

        .frame {
          margin-top: 12px;
          border: 1px solid var(--rule);
          background: var(--sheet-sunk);
        }

        .viewport {
          max-height: 460px;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .plate {
          position: relative;
          display: inline-block;
          transition: transform var(--transition-normal);
        }

        .plate img {
          display: block;
          max-width: 100%;
          max-height: 460px;
          height: auto;
        }

        .mark {
          position: absolute;
          display: block;
          border: 1px solid;
          cursor: pointer;
        }

        .mark.high {
          border-color: var(--flagged);
          background: color-mix(in srgb, var(--flagged) 14%, transparent);
        }

        .mark.medium {
          border-color: var(--caution);
          background: color-mix(in srgb, var(--caution) 14%, transparent);
        }

        .mark.low {
          border-color: var(--rule-strong);
          background: color-mix(in srgb, var(--rule-strong) 14%, transparent);
        }

        .mark.on {
          border-width: 2px;
        }

        .bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 9px 12px;
          border-top: 1px solid var(--rule);
          background: var(--sheet);
        }

        .group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ctl {
          padding: 5px 10px;
          background: transparent;
          border: 1px solid var(--rule);
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-size: 0.875rem;
          line-height: 1.3;
          color: var(--graphite);
          cursor: pointer;
          transition: color var(--transition-fast), border-color var(--transition-fast);
        }

        .ctl:hover:not(:disabled) {
          color: var(--ink);
          border-color: var(--rule-strong);
        }

        .ctl:disabled {
          color: var(--muted);
          opacity: 0.55;
          cursor: not-allowed;
        }

        .ctl:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }

        .zoom {
          min-width: 46px;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
          font-variant-numeric: tabular-nums;
        }

        .list {
          margin-top: 18px;
          border-top: 1px solid var(--rule);
        }

        .row {
          display: grid;
          grid-template-columns: 78px minmax(0, 1fr) 92px;
          align-items: baseline;
          gap: 14px;
          width: 100%;
          padding: 11px 2px;
          background: none;
          border: 0;
          border-bottom: 1px solid var(--rule-soft);
          text-align: left;
          cursor: pointer;
        }

        .row.still {
          cursor: default;
        }

        .row.on {
          border-bottom-color: var(--ink);
        }

        .sev {
          font-family: var(--font-mono);
          font-size: 0.875rem;
        }

        .sev.high {
          color: var(--flagged);
        }

        .sev.medium {
          color: var(--caution);
        }

        .sev.low {
          color: var(--muted);
        }

        .what b {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--ink);
        }

        .what p {
          margin: 2px 0 0;
          font-size: 0.9375rem;
          line-height: 1.5;
          color: var(--graphite);
        }

        .where {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          text-align: right;
          color: var(--muted);
          font-variant-numeric: tabular-nums;
        }

        .none {
          margin: 16px 0 0;
          font-size: 0.9375rem;
          line-height: 1.55;
          color: var(--muted);
          max-width: 62ch;
        }

        @media (max-width: 620px) {
          .row {
            grid-template-columns: 68px minmax(0, 1fr);
          }

          .row .where {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
