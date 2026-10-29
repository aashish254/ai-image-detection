'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

const sequence = [
  {
    key: 'i',
    title: 'Decode and normalise',
    body: 'Colour space, block alignment and sensor-metadata extraction from the uploaded bytes.',
  },
  {
    key: 'ii',
    title: 'Frequency measurement',
    body: 'DCT spectra over 8×8 blocks; periodic peaks that a camera cannot produce.',
  },
  {
    key: 'iii',
    title: 'Spatial and semantic',
    body: "Gradient-noise residual, artifact mapping, then a vision model's independent read.",
  },
  {
    key: 'iv',
    title: 'Fuse and calibrate',
    body: 'Reliability-weighted fusion with epistemic uncertainty on the final verdict.',
  },
];

const contributions = [
  { abbr: 'DACC', title: 'Dynamic adaptive confidence', body: 'Rescales certainty from detector agreement instead of emitting raw model output.' },
  { abbr: 'DRWF', title: 'Reliability-weighted fusion', body: 'Each read is scored on its own confidence, status and latency before it can move the verdict.' },
  { abbr: 'SAM', title: 'Spatial artifact mapping', body: 'Coordinate-level localisation, so the heatmap is evidence rather than decoration.' },
  { abbr: 'FSFN', title: 'Frequency-spatial fusion', body: 'Cross-domain features that single-domain detectors cannot see.' },
  { abbr: 'XAI', title: 'Explainable reports', body: 'Every verdict ships with the measurements that produced it.' },
  { abbr: 'EUQ', title: 'Uncertainty quantification', body: 'Says what it does not know, as a ± band on the number.' },
  { abbr: 'GFI', title: 'Generator fingerprinting', body: 'Attributes synthetic output to one of six stored generator profiles, or to a watermark the cascade recognises.' },
];

// Names match the seven measurements the analyze route actually runs.
const measurements = [
  { name: 'HuggingFace classifier', value: 0.88, synthetic: true },
  { name: 'Gemini vision review', value: 0.73, synthetic: true },
  { name: 'DCT periodicity, 8×8 block grid', value: 0.81, synthetic: true },
  { name: 'Watermark & metadata cascade', value: 0.12, synthetic: false },
  { name: 'FSFN frequency-spatial fusion', value: 0.64, synthetic: true },
  { name: 'GAN generator fingerprint', value: 0.85, synthetic: true },
  { name: 'VPT artifact sentinel', value: 0.58, synthetic: true },
];

export default function LandingPage() {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="page">
      <div className="container report-grid">
        <motion.dl className="case-meta" {...reveal} transition={{ duration: 0.4 }}>
          <dt>subject</dt>
          <dd>OriginLayer</dd>
          <dt>examiners</dt>
          <dd>A. K. Mahato<br />R. Yadav<br />B. Gami</dd>
          <dt>supervision</dt>
          <dd>Madhan E.S.</dd>
          <dt>method</dt>
          <dd>Frequency-domain<br />+ semantic fusion</dd>
          <dt>revised</dt>
          <dd>2026-05-16</dd>
        </motion.dl>

        <div className="body">
          <motion.div {...reveal} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <h1>Tell a photograph from a prompt.</h1>
            <p className="lede">
              OriginLayer runs seven independent measurements over one image — frequency spectra,
              generator fingerprints, watermark and metadata traces, a vision-model read — and
              reports each with its own confidence and uncertainty. Nothing here is a black box.
            </p>
            <div className="actions">
              <Link href="/analyze" className="btn btn-primary">Examine an image</Link>
              <Link href="/working-model" className="btn btn-secondary">Read the method</Link>
            </div>
          </motion.div>

          <motion.div {...reveal} transition={{ duration: 0.5, delay: 0.08 }}>
            <section className="specimen" aria-label="Example measurement readout">
              <div className="plate">
                <div className="frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/specimen-synthetic.webp"
                    width={1408}
                    height={768}
                    alt="Specimen under examination: an AI-generated photograph of a birthday party in a dorm room, marked synthetic"
                  />
                  <div className="seal flagged" aria-hidden="true">
                    <b>SYNTHETIC</b>
                    <span>classifier read 0.99</span>
                  </div>
                </div>
                <span className="tag">specimen-synthetic.webp 1408×768</span>
              </div>

              <div className="readout">
                <p className="label">Measurement readout · worked example</p>
                <div className="ro-head">
                  <span className="ro-word flagged">Synthetic</span>
                  <span className="ro-ci">example verdict 0.91 ± 0.04</span>
                </div>

                <div className="ro-rows">
                  {measurements.map((m) => (
                    <div className="ro-row" key={m.name}>
                      <span className="ro-name">{m.name}</span>
                      <span className="ro-meter" aria-hidden="true">
                        <i
                          className={m.synthetic ? '' : 'verified'}
                          style={{ width: `${m.value * 100}%` }}
                        />
                      </span>
                      <span className="ro-val">{m.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <p className="ro-foot">
                  Each read is scored on its own confidence, status and latency. The verdict is
                  weighted, not averaged.
                </p>
              </div>
            </section>
          </motion.div>
        </div>

        <section className="report-section">
          <div className="report-section-head">
            <span className="idx">01</span>
            <h2>Examination sequence</h2>
            <p className="note">Four ordered passes; each one writes to the readout above.</p>
          </div>
          <div className="doc-grid">
            {sequence.map((s) => (
              <div className="doc-step" key={s.key}>
                <span className="k">{s.key}</span>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <span className="idx">02</span>
            <h2>Contributions</h2>
            <p className="note">Seven methods this pipeline introduces.</p>
          </div>
          <div className="doc-list">
            {contributions.map((c) => (
              <div className="doc-item" key={c.abbr}>
                <span className="ab">{c.abbr}</span>
                <div>
                  <b>{c.title}</b>
                  <p>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="byline">
          <span>Built by <strong>Aashish Kumar Mahato</strong>, Rahul Yadav &amp; Bibek Gami</span>
          <span>Under the guidance of <strong>Madhan E.S.</strong></span>
          <span className="r mono">© 2026 OriginLayer, research project</span>
        </div>
      </div>

      <style jsx>{`
        .page {
          padding-bottom: 0;
        }

        .report-grid {
          padding-top: 64px;
        }

        h1 {
          font-size: clamp(2.375rem, 4.2vw, 3.5rem);
          max-width: 15ch;
        }

        .lede {
          margin-top: 22px;
          font-size: 1.1875rem;
          max-width: 60ch;
        }

        .actions {
          margin-top: 34px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* ---- specimen panel ---- */
        /* Stacked, not side-by-side: the specimen is a 1408×768 landscape, so a
           narrow column would shrink it to a thumbnail and leave the plate empty. */
        .specimen {
          margin-top: 56px;
          background: var(--sheet);
          border: 1px solid var(--rule);
        }

        .plate {
          position: relative;
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid var(--rule);
          padding: 18px;
        }

        /* The frame, not the plate, anchors the seal so the stamp follows the
           print's corner as the specimen scales with the card. */
        .frame {
          position: relative;
          align-self: stretch;
        }

        .frame img {
          display: block;
          width: 100%;
          height: auto;
          border: 1px solid var(--rule-soft);
          background: var(--sheet-sunk);
        }

        .tag {
          margin-top: 14px;
          align-self: flex-start;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
          border: 1px solid var(--rule);
          border-radius: 2px;
          padding: 4px 7px;
          background: var(--sheet);
        }

        .seal {
          position: absolute;
          right: 22px;
          bottom: 14px;
          background: var(--sheet);
        }

        .readout {
          padding: 26px 30px 24px;
          min-width: 0;
        }

        /* Full card width makes the readout a 826px measure; the rows and prose
           keep a report column so the meters do not float far from their labels. */
        .readout .label,
        .readout .ro-head,
        .readout .ro-rows,
        .readout .ro-foot {
          max-width: 660px;
        }

        @media (max-width: 620px) {
          .plate,
          .readout {
            padding: 18px;
          }

          .seal {
            right: 14px;
            bottom: 22px;
            transform: rotate(-7deg) scale(0.72);
            transform-origin: bottom right;
          }
        }

        @media (max-width: 900px) {
          .report-grid {
            padding-top: 40px;
          }
        }
      `}</style>
    </div>
  );
}
