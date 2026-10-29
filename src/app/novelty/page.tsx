'use client';

import Link from 'next/link';

const contributions = [
  {
    abbr: 'DRWF',
    title: 'Dynamic reliability-weighted fusion',
    problem: 'Ensembles apply fixed weights to every detector, so a module that errors, falls back or answers slowly moves the verdict exactly as much as one that returned clean.',
    solution: 'Each read is scored for this image on its own internal confidence, its response status and its latency, and that reliability scales its base weight before the scores are combined.',
    impact: 'A failed read is down-weighted instead of voting. The weights change per image rather than per release.',
  },
  {
    abbr: 'FSFN',
    title: 'Frequency-spatial fusion network',
    problem: 'Frequency-only and pixel-only detectors each miss artifacts that only appear when the two are compared, and the gap is not visible from either side alone.',
    solution: 'DCT block spectra and spatial gradient statistics are measured over the same image and combined into one fusion score, which then carries its own weight into the verdict.',
    impact: 'Adds a signal the classifier and the DCT read do not produce on their own.',
  },
  {
    abbr: 'SAM',
    title: 'Spatial artifact mapping',
    problem: 'A binary real-or-fake label cannot be checked. Nothing in the output can be compared against the picture it describes.',
    solution: 'Detected artifacts are projected onto image coordinates and drawn over the specimen, so each claim points at a region of the file it came from.',
    impact: 'The heatmap is evidence a reader can verify or dispute, not decoration.',
  },
  {
    abbr: 'GFI',
    title: 'GAN fingerprint identification',
    problem: 'Knowing an image is synthetic says nothing about which generator produced it, which is the question provenance work actually asks.',
    solution: 'The image\u2019s eight-band spectral signature, color profile and texture statistics are scored against six stored generator profiles: DALL\u00b7E, Midjourney, Stable Diffusion, Adobe Firefly, Google Imagen and Flux.',
    impact: 'A source is named only for an image already scored synthetic. Otherwise the field is returned empty.',
  },
  {
    abbr: 'DACC',
    title: 'Dynamic adaptive confidence calibration',
    problem: 'Raw classifier output is routinely overconfident, and a number straight out of a model reads like a probability when it is not one.',
    solution: 'The fused score is recalibrated against detector agreement, and the result carries a trust score and a named disagreement type alongside it.',
    impact: 'The number shown beside a verdict is calibrated, not the model\u2019s own logits.',
  },
  {
    abbr: 'EUQ',
    title: 'Epistemic uncertainty quantification',
    problem: 'Detection systems answer with equal confidence whether the reads agree or contradict each other, so an unsure run is indistinguishable from a sure one.',
    solution: 'The spread between the weighted reads is computed as a standard deviation and published as a \u00b1 band beside the verdict.',
    impact: 'A 0.51 from five disagreeing modules does not display like a 0.51 from seven agreeing ones.',
  },
  {
    abbr: 'XAI',
    title: 'Explainable forensic reports',
    problem: 'Black-box detection hands the user a verdict with no reasoning attached, which is useless in any review that has to be defended.',
    solution: 'Every report ships the measurements that produced the verdict, each region\u2019s reasoning text, the attribution and the uncertainty band.',
    impact: 'A reader can reconstruct why the answer was given, from the same page.',
  },
];

const matrix = [
  { m: 'Real-or-fake classification', prior: true, here: true },
  { m: 'Answers in seconds', prior: true, here: true },
  { m: 'Weights that move per image', prior: false, here: true },
  { m: 'Frequency and spatial in one pass', prior: false, here: true },
  { m: 'Artifact coordinates', prior: false, here: true },
  { m: 'Generator named as the source', prior: false, here: true },
  { m: 'Calibrated confidence', prior: false, here: true },
  { m: 'Uncertainty published', prior: false, here: true },
  { m: 'Reasoning in the output', prior: false, here: true },
];

export default function NoveltyPage() {
  return (
    <div className="page">
      <div className="container report-grid">
        <dl className="case-meta">
          <dt>contributions</dt>
          <dd>Seven</dd>
          <dt>revised</dt>
          <dd>2026-05-16</dd>
        </dl>

        <div className="body">
          <div className="head">
            <h1>What this work adds.</h1>
            <p className="lede">
              Seven contributions, each stated as the problem it answers, the mechanism in this
              pipeline, and what changes in the report because of it. Every claim here is about the
              code in this repository, not about a benchmark.
            </p>
          </div>
        </div>

        <section className="report-section">
          <div className="report-section-head">
            <span className="idx">01</span>
            <h2>Contributions</h2>
            <p className="note">
              Listed in the order they appear in the run; stage order is on the{' '}
              <Link href="/working-model">method page</Link>.
            </p>
          </div>

          <div className="doc-entries">
            {contributions.map((c) => (
              <div className="doc-entry" key={c.abbr}>
                <span className="ab">{c.abbr}</span>
                <div>
                  <h3>{c.title}</h3>
                  <div className="doc-fields">
                    <div>
                      <span className="fl">problem</span>
                      <span className="fv dim">{c.problem}</span>
                    </div>
                    <div>
                      <span className="fl">mechanism</span>
                      <span className="fv">{c.solution}</span>
                    </div>
                    <div>
                      <span className="fl">effect</span>
                      <span className="fv">{c.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-head">
            <span className="idx">02</span>
            <h2>Against what is already standard</h2>
            <p className="note">
              A tick under &ldquo;standard&rdquo; means the capability is ordinary in an off-the-shelf
              detector; a tick under &ldquo;here&rdquo; means this pipeline implements it.
            </p>
          </div>
          <div className="doc-matrix">
            <div className="mh">
              <span>capability</span>
              <span>standard</span>
              <span>here</span>
            </div>
            {matrix.map((r) => (
              <div className="mr" key={r.m}>
                <span>{r.m}</span>
                <span className={r.prior ? 'yes' : 'no'}>{r.prior ? 'yes' : '\u2014'}</span>
                <span className={r.here ? 'yes' : 'no'}>{r.here ? 'yes' : '\u2014'}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="byline">
          <span>
            The claim is the <strong>mechanism</strong>, not a score
          </span>
          <Link href="/analyze" className="btn btn-secondary">
            Examine an image
          </Link>
          <span className="r">novelty</span>
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
