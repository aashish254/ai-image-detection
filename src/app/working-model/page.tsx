'use client';

import Link from 'next/link';

const stages = [
  {
    title: 'Intake and cache check',
    body: 'The file is decoded, its bytes hashed, and the hash looked up in the result cache. A specimen measured in the last 24 hours is returned from cache instead of being run again.',
    details: [
      'JPG, PNG and WebP accepted',
      '10 MB ceiling on the file, checked in the browser',
      'SHA-256 of the encoded bytes, keyed to the result',
      'Image bytes are never written to disk',
    ],
    where: 'src/app/api/analyze/route.ts · src/lib/cache.ts',
  },
  {
    title: 'Four parallel reads',
    body: 'The classifier, the vision model, the frequency measurement and the watermark cascade are fired together. None of them sees another\u2019s output before it returns.',
    details: [
      'HuggingFace classifier',
      'Gemini vision review',
      'DCT spectra, 8\u00d78 blocks',
      'Watermark and metadata cascade',
    ],
    where: 'src/lib/detectors · huggingface, vision-llm, dct, watermark',
  },
  {
    title: 'Cascade override',
    body: 'Watermarks and provenance metadata are treated as definitive. If the cascade finds a visible generator mark, a SynthID trace or a C2PA signature, that evidence raises the classifier\u2019s score before fusion rather than averaging against it.',
    details: [
      'Generator watermark match',
      'SynthID trace reported by the vision read',
      'C2PA and metadata signatures',
    ],
    where: 'src/app/api/analyze/route.ts',
  },
  {
    title: 'Fusion and calibration',
    body: 'Reliability-weighted fusion scores each read on its own confidence, response status and latency, then combines them. The fused number is calibrated before it can become a verdict.',
    details: [
      'Reliability = confidence, status, latency',
      'Error and fallback reads down-weighted',
      'Calibrated score, trust and disagreement',
      'Epistemic uncertainty as a \u00b1 band',
    ],
    where: 'src/lib/fusion.ts · src/lib/dynamic-weights.ts',
  },
  {
    title: 'Attribution passes',
    body: 'With a verdict in hand, three passes ask what produced the image and where the evidence sits: frequency-spatial fusion, generator fingerprint matching, and the artifact sentinel cross-checked against the DCT measurement.',
    details: [
      'FSFN frequency-spatial fusion',
      'GAN generator fingerprint',
      'VPT artifact sentinel',
      'DCT cross-verification of regions',
    ],
    where: 'src/lib · frequency-spatial-fusion, gan-fingerprint, vpt',
  },
  {
    title: 'Report',
    body: 'The last stage writes the explanation: artifact regions with image coordinates, per-region reasoning, the source attribution and the uncertainty band, assembled into the forensic report the page renders.',
    details: [
      'Coordinate-level artifact regions',
      'Per-region reasoning text',
      'Generator attribution',
      'Verdict, confidence and \u00b1 band',
    ],
    where: 'src/lib/explainable-ai.ts · gradcam-analysis.ts',
  },
];

export default function WorkingModelPage() {
  return (
    <div className="page">
      <div className="container report-grid">
        <dl className="case-meta">
          <dt>stages</dt>
          <dd>Six, in run order</dd>
          <dt>revised</dt>
          <dd>2026-05-16</dd>
        </dl>

        <div className="body">
          <div className="head">
            <h1>How the examination runs.</h1>
            <p className="lede">
              Six stages, in the order the analyze route executes them. Reads happen together, the
              verdict is formed after them, and attribution runs last.
            </p>
          </div>
        </div>

        <section className="report-section">
          <div className="report-section-head">
            <span className="idx">01</span>
            <h2>Stages</h2>
            <p className="note">
              Module-by-module index on the{' '}
              <Link href="/features">capabilities page</Link>.
            </p>
          </div>

          <div className="doc-entries">
            {stages.map((s, i) => (
              <div className="doc-entry" key={s.title}>
                <span className="ab">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <ul className="doc-ticks">
                    {s.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  <p className="k">{s.where}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <span className="idx">02</span>
            <h2>Constraints on this run</h2>
            <p className="note">Four limits a reader should know before trusting a report.</p>
          </div>
          <div className="doc-list">
            <div className="doc-item">
              <span className="ab">cache</span>
              <div>
                <b>Same bytes, same answer</b>
                <p>
                  The same bytes uploaded twice inside 24 hours return the stored result.
                  Measurements are not re-run, so a verdict cannot drift between attempts.
                </p>
              </div>
            </div>
            <div className="doc-item">
              <span className="ab">loader</span>
              <div>
                <b>No progress to report mid-run</b>
                <p>
                  The route answers with one payload when the last stage finishes. The waiting
                  screen lists the seven measurements as pending and does not invent a percentage.
                </p>
              </div>
            </div>
            <div className="doc-item">
              <span className="ab">storage</span>
              <div>
                <b>No server-side copy of the image</b>
                <p>
                  Bytes are decoded, measured and dropped. The cache holds a hash and the numbers,
                  not the picture.
                </p>
              </div>
            </div>
            <div className="doc-item">
              <span className="ab">errors</span>
              <div>
                <b>No silent failure</b>
                <p>
                  A read that errors is reported with its status and carries a small weight; the
                  verdict names the disagreement rather than hiding it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="byline">
          <span>
            Runs in <strong>six stages</strong>, answers in one report
          </span>
          <Link href="/novelty" className="btn btn-secondary">
            What is novel about it
          </Link>
          <span className="r">method</span>
        </div>
      </div>

      <style jsx>{`
        .report-grid {
          padding-top: 44px;
        }

        h1 {
          font-size: clamp(2rem, 3.2vw, 2.5rem);
        }

        .body {
          min-width: 0;
        }

        @media (max-width: 900px) {
          .report-grid {
            padding-top: 32px;
          }
        }
      `}</style>
    </div>
  );
}
