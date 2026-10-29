'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import AnalysisResults from '@/components/AnalysisResults';
import { AnalysisResult } from '@/lib/types';

const specs = [
  { k: 'formats', v: 'JPG, PNG, WebP', n: '10 MB ceiling on the file' },
  { k: 'fusion', v: 'Reliability-weighted', n: 'Each read is scored on confidence, status and latency' },
  { k: 'retention', v: 'Server keeps no copy', n: 'Only a hash and the result are cached' },
];

export default function AnalyzePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedImageName, setUploadedImageName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result: AnalysisResult, imageUrl: string, imageName: string) => {
    setAnalysisResult(result);
    setUploadedImageUrl(imageUrl);
    setUploadedImageName(imageName);
    setIsAnalyzing(false);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setUploadedImageUrl('');
    setUploadedImageName('');
  };

  const idle = !analysisResult && !isAnalyzing;

  return (
    <div className="page">
      <div className="container report-grid">
        <dl className="case-meta">
          <dt>examination</dt>
          <dd>{analysisResult ? 'Report issued' : isAnalyzing ? 'In progress' : 'New request'}</dd>
          <dt>accepts</dt>
          <dd>JPG, PNG, WebP</dd>
          <dt>limit</dt>
          <dd>10 MB</dd>
          <dt>retention</dt>
          <dd>Hash and result only</dd>
          <dt>measurements</dt>
          <dd>Seven per image</dd>
        </dl>

        <div className="body">
          <div className="head">
            <h1>Examine an image.</h1>
            <p className="lede">
              Drop a file to run all seven measurements. One report is issued when the last read returns.
            </p>
          </div>

          {analysisResult ? (
            <div className="report">
              <div className="report-bar">
                <span className="label">specimen</span>
                <span className="report-name">{uploadedImageName}</span>
                <button className="report-new" onClick={handleNewAnalysis}>
                  Examine another
                </button>
              </div>
              <AnalysisResults
                result={analysisResult}
                imageUrl={uploadedImageUrl}
                imageName={uploadedImageName}
              />
            </div>
          ) : (
            <section className="panel">
              <div className="panel-bar">
                <span className="panel-title">Specimen</span>
                <span className="panel-state">{isAnalyzing ? 'measuring' : 'awaiting input'}</span>
              </div>

              <div className="panel-body">
                <ImageUploader
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisComplete={handleAnalysisComplete}
                  isAnalyzing={isAnalyzing}
                />
              </div>

              {idle && (
                <div className="specs">
                  {specs.map((s) => (
                    <div className="spec" key={s.k}>
                      <p className="label">{s.k}</p>
                      <p className="spec-v">{s.v}</p>
                      <p className="spec-n">{s.n}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <style jsx>{`
        .report-grid {
          padding-top: 44px;
        }

        h1 {
          font-size: clamp(2rem, 3.2vw, 2.5rem);
        }

        .panel {
          border: 1px solid var(--rule);
          background: var(--sheet);
        }

        .panel-bar {
          display: flex;
          align-items: baseline;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--rule);
        }

        .panel-title {
          font-size: 0.9375rem;
          font-weight: 600;
        }

        .panel-state {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
        }

        .panel-body {
          padding: 20px;
        }

        .specs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--rule);
        }

        .spec {
          padding: 16px 20px 18px;
          border-right: 1px solid var(--rule);
        }

        .spec:last-child {
          border-right: 0;
        }

        .spec-v {
          margin-top: 8px;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--ink);
        }

        .spec-n {
          margin-top: 3px;
          font-size: 0.875rem;
          line-height: 1.45;
          color: var(--muted);
        }

        .report {
          border: 1px solid var(--rule);
          background: var(--sheet);
        }

        .report-bar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 20px;
          border-bottom: 1px solid var(--rule);
        }

        .report-name {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 40ch;
        }

        .report-new {
          margin-left: auto;
          padding: 7px 13px;
          background: transparent;
          border: 1px solid var(--rule);
          border-radius: 3px;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--graphite);
          cursor: pointer;
          transition: color var(--transition-fast), border-color var(--transition-fast);
        }

        .report-new:hover {
          color: var(--ink);
          border-color: var(--rule-strong);
        }

        @media (max-width: 900px) {
          .report-grid {
            padding-top: 32px;
          }
        }

        @media (max-width: 700px) {
          .specs {
            grid-template-columns: 1fr;
          }

          .spec {
            border-right: 0;
            border-bottom: 1px solid var(--rule);
          }

          .spec:last-child {
            border-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
