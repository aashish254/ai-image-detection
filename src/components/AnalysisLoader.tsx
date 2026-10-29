'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AnalysisLoaderProps {
  imageUrl?: string;
}

// The seven measurements the analyze route runs per image. The route returns one
// payload, so no per-detector progress exists to display; these stay pending until
// the response lands.
const measurements = [
  'HuggingFace classifier',
  'Gemini vision review',
  'DCT frequency, 8×8 block grid',
  'Watermark & metadata cascade',
  'FSFN frequency-spatial fusion',
  'GAN generator fingerprint',
  'VPT artifact sentinel',
];

export default function AnalysisLoader({ imageUrl }: AnalysisLoaderProps) {
  const reduceMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const tick = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 100);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="examination">
      <div className="exam-plate">
        {imageUrl ? (
          <img src={imageUrl} alt="Specimen under examination" className="exam-img" />
        ) : (
          <div className="exam-empty">no specimen</div>
        )}
      </div>

      <div className="exam-body">
        <p className="label">Under examination</p>

        <div className="exam-rule" aria-hidden="true">
          {reduceMotion ? (
            <i className="exam-static" />
          ) : (
            <motion.i
              animate={{ x: ['-100%', '400%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>

        <p className="exam-note">
          Seven measurements run against this specimen. The readout appears when the
          last one returns.
        </p>

        <ul className="exam-list">
          {measurements.map((name) => (
            <li key={name}>
              <span className="exam-name">{name}</span>
              <span className="exam-state">pending</span>
            </li>
          ))}
        </ul>

        <p className="exam-elapsed">
          elapsed <b className="data">{elapsed.toFixed(1)} s</b>
        </p>
      </div>

      <style jsx>{`
        .examination {
          display: grid;
          grid-template-columns: 288px 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .exam-plate {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--sheet-sunk);
          border: 1px solid var(--rule);
        }

        .exam-img {
          width: 100%;
          height: 212px;
          object-fit: contain;
          background: var(--sheet);
          border: 1px solid var(--rule-soft);
        }

        .exam-empty {
          height: 212px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
          border: 1px dashed var(--rule-strong);
        }

        .exam-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .exam-rule {
          position: relative;
          height: 2px;
          background: var(--rule);
          overflow: hidden;
        }

        .exam-rule i {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 25%;
          background: var(--ink);
        }

        .exam-rule .exam-static {
          left: 0;
          width: 100%;
          background: var(--rule-strong);
        }

        .exam-note {
          margin: 0;
          font-size: 0.9375rem;
          color: var(--graphite);
          max-width: 46ch;
        }

        .exam-list {
          list-style: none;
          margin: 0.25rem 0 0;
          padding: 0;
          border-top: 1px solid var(--rule);
        }

        .exam-list li {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--rule-soft);
        }

        .exam-name {
          font-size: 0.9375rem;
          color: var(--ink);
        }

        .exam-state {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          letter-spacing: 0.04em;
          color: var(--muted);
        }

        .exam-elapsed {
          margin: 0.25rem 0 0;
          font-size: 0.9375rem;
          color: var(--graphite);
        }

        @media (max-width: 700px) {
          .examination {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
