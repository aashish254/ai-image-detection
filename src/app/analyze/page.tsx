'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Lock, FileImage } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import AnalysisResults from '@/components/AnalysisResults';
import { AnalysisResult } from '@/lib/types';

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

  return (
    <div className="page-wrapper">
      <main className="container">
        {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-badge">
            <Shield size={12} />
            <span>Multi-Modal Detection Pipeline</span>
          </div>
          <h1 className="hero-title">
            Analyze <span className="text-gradient">Integrity.</span>
          </h1>
          <p className="hero-subtitle">
            Upload an image to detect AI-generated content using our multi-modal forensic pipeline
          </p>
        </motion.div>

        {/* Upload/Results Section */}
        <motion.div
          className="analyzer-section"
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {!analysisResult ? (
            <div className="glass-panel">
              <ImageUploader
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                isAnalyzing={isAnalyzing}
              />
            </div>
          ) : (
            <div className="results-container">
              <AnalysisResults
                result={analysisResult}
                imageUrl={uploadedImageUrl}
                imageName={uploadedImageName}
              />
            </div>
          )}
        </motion.div>

        {/* Info Cards - only show before analysis */}
        {!analysisResult && !isAnalyzing && (
          <motion.div
            className="info-grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="info-card">
              <div className="info-icon-wrap">
                <FileImage size={20} />
              </div>
              <h3>Supported Formats</h3>
              <p>JPG, PNG, WebP up to 10MB</p>
            </div>
            <div className="info-card">
              <div className="info-icon-wrap">
                <Clock size={20} />
              </div>
              <h3>Fast Analysis</h3>
              <p>Results in under 10 seconds</p>
            </div>
            <div className="info-card">
              <div className="info-icon-wrap">
                <Lock size={20} />
              </div>
              <h3>Privacy First</h3>
              <p>Images processed in-memory only</p>
            </div>
          </motion.div>
        )}
      </main>

      <style jsx>{`
        .page-wrapper {
            min-height: 100vh;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding-top: 64px;
            padding-bottom: 80px;
            transition: background 0.3s ease, color 0.3s ease;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .page-header {
           text-align: center;
           margin-bottom: 48px;
           padding-top: 32px;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 20px;
            font-size: 0.72rem;
            font-weight: 600;
            color: #818cf8;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 20px;
        }

        .hero-title {
            font-size: clamp(2.5rem, 6vw, 4rem);
            font-weight: 650;
            line-height: 1.1;
            margin-bottom: 16px;
            letter-spacing: -0.03em;
        }

        .text-gradient {
            background: linear-gradient(135deg, #a5b4fc, #6366f1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
            font-size: 1.05rem;
            color: var(--text-muted);
            max-width: 520px;
            margin: 0 auto;
            line-height: 1.6;
        }

        .glass-panel {
            background: var(--gradient-card);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 8px;
            box-shadow: var(--shadow-lg);
            backdrop-filter: blur(20px);
        }

        .analyzer-section {
            margin-bottom: 60px;
            min-height: 400px;
        }

        .new-analysis-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            margin-bottom: 20px;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            color: var(--text-secondary);
            font-size: 0.84rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .new-analysis-btn:hover {
            color: var(--text-primary);
            background: var(--hover-bg-strong);
            border-color: rgba(99, 102, 241, 0.2);
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 80px;
        }

        .info-card {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 28px 24px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .info-card:hover {
            transform: translateY(-3px);
            border-color: rgba(99, 102, 241, 0.2);
            box-shadow: var(--shadow-md);
        }

        .info-icon-wrap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(99, 102, 241, 0.1);
            color: #818cf8;
            margin-bottom: 16px;
        }

        .info-card h3 {
            font-size: 0.92rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 6px;
        }

        .info-card p {
            font-size: 0.82rem;
            color: var(--text-muted);
            line-height: 1.5;
        }
        
        @media (max-width: 768px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .hero-title {
                font-size: 2.2rem;
            }
        }
      `}</style>
    </div>
  );
}
