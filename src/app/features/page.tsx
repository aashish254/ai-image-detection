'use client';

import Link from 'next/link';

const modules = [
  {
    abbr: 'DRWF',
    title: 'Reliability-weighted fusion',
    body: 'Combines the seven reads, scoring each on its own confidence, status and latency rather than applying fixed ensemble weights.',
    phase: 'phase · fuse',
  },
  {
    abbr: 'VISION',
    title: 'Gemini vision read',
    body: 'A Gemini flash model reviews the image semantically: anatomy, physics, text rendering, and any visible watermark or provenance signature.',
    phase: 'phase · parallel read',
  },
  {
    abbr: 'FSFN',
    title: 'Frequency-spatial fusion',
    body: 'Runs the frequency and spatial-domain signals together, so artifacts that live between the two are not lost by either alone.',
    phase: 'phase · after fusion',
  },
  {
    abbr: 'DACC',
    title: 'Adaptive confidence calibration',
    body: 'Rescales certainty from how much the detectors agree instead of passing raw model output through as a probability.',
    phase: 'phase · inside fusion',
  },
  {
    abbr: 'EUQ',
    title: 'Uncertainty quantification',
    body: 'Measures disagreement between the reads and publishes it as a ± band beside the verdict, so an unsure result says so.',
    phase: 'phase · after fusion',
  },
  {
    abbr: 'GFI',
    title: 'Generator fingerprinting',
    body: 'Matches the image\u2019s spectral signature against six stored generator profiles \u2014 DALL\u00b7E, Midjourney, Stable Diffusion, Adobe Firefly, Google Imagen, Flux \u2014 to name the likely source.',
    phase: 'phase · after fusion',
  },
  {
    abbr: 'SAM',
    title: 'Spatial artifact mapping',
    body: 'Projects detected artifacts onto image coordinates, so the heatmap is evidence a person can check rather than decoration.',
    phase: 'phase · report',
  },
  {
    abbr: 'XAI',
    title: 'Explainable report',
    body: 'Attaches the reasoning behind each region claim to the verdict, so the report can be read, checked and argued with.',
    phase: 'phase · report',
  },
];

export default function FeaturesPage() {
  return (
    <div className="page">
      <div className="container report-grid">
        <dl className="case-meta">
          <dt>modules</dt>
          <dd>Eight &mdash; seven novel</dd>
          <dt>revised</dt>
          <dd>2026-05-16</dd>
        </dl>

        <div className="body">
          <div className="head">
            <h1>Detection capabilities.</h1>
            <p className="lede">
              Eight modules carry the analysis. Seven of them are this project&rsquo;s own
              contribution; the eighth is a call to a vision model. Each is listed with the phase it
              runs in, so the execution order reads from the margins.
            </p>
          </div>
        </div>

        <section className="report-section">
          <div className="report-section-head">
            <span className="idx">01</span>
            <h2>Modules</h2>
            <p className="note">
              Ordered stage-by-stage on the{' '}
              <Link href="/working-model">method page</Link>.
            </p>
          </div>
          <div className="doc-list">
            {modules.map((m) => (
              <div className="doc-item" key={m.abbr}>
                <span className="ab">{m.abbr}</span>
                <div>
                  <b>{m.title}</b>
                  <p>{m.body}</p>
                  <p className="k">{m.phase}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <span className="idx">02</span>
            <h2>What each module is judged on</h2>
          </div>
          <div className="doc-list">
            <div className="doc-item">
              <span className="ab">score</span>
              <div>
                <b>Synthetic likelihood, not certainty</b>
                <p>
                  Every read returns a score between 0 and 1 for &ldquo;this looks generated&rdquo;.
                  A low score is a measurement, not a claim that the image is authentic.
                </p>
              </div>
            </div>
            <div className="doc-item">
              <span className="ab">weight</span>
              <div>
                <b>Recomputed per image</b>
                <p>
                  A read that errors out or returns outside its usual range carries less into the
                  verdict than one that returns clean.
                </p>
              </div>
            </div>
            <div className="doc-item">
              <span className="ab">band</span>
              <div>
                <b>Shown beside the verdict</b>
                <p>
                  The spread between the reads is published as a ± band, so a 0.51 from five
                  disagreeing modules is not displayed like a 0.51 from seven agreeing ones.
                </p>
              </div>
            </div>
            <div className="doc-item">
              <span className="ab">proof</span>
              <div>
                <b>Coordinates over adjectives</b>
                <p>
                  Anything asserted about the image is attached to a region of it, and appears in
                  the report with the measurement that produced it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="byline">
          <span>
            The verdict is <strong>weighted, not averaged</strong>
          </span>
          <Link href="/analyze" className="btn btn-secondary">
            Examine an image
          </Link>
          <span className="r">capabilities</span>
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
