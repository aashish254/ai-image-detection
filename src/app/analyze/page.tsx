'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import AnalysisResults from '@/components/AnalysisResults';
import { AnalysisResult } from '@/lib/types';
import Navbar from '@/components/Navbar';

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

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Main Content */}
      <main className="container">
        {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="hero-title">
            Analyze <span className="text-gradient">Integrity.</span>
          </h1>
          <p className="hero-subtitle">
            Upload an image to detect AI-generated content using our multi-modal detection pipeline
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

        {/* Info Cards */}
        <motion.div
          className="info-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="info-card">
            <h3>Supported Formats</h3>
            <p>JPG, PNG, WebP up to 10MB</p>
          </div>
          <div className="info-card">
            <h3>Analysis Time</h3>
            <p>Results in under 5 seconds</p>
          </div>
          <div className="info-card">
            <h3>Privacy First</h3>
            <p>Images are processed in-memory</p>
          </div>
        </motion.div>

        {/* Team Section */}

      </main>

      <style jsx>{`
        .page-wrapper {
            min-height: 100vh;
            background: #050507;
            color: white;
            padding-top: 120px;
            padding-bottom: 80px;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .page-header {
           text-align: center;
           margin-bottom: 60px;
        }

        .hero-title {
            font-size: clamp(3rem, 6vw, 4.5rem);
            font-weight: 600;
            line-height: 1.1;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
        }

        .text-gradient {
            background: linear-gradient(135deg, #fff 0%, #888 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
            font-size: 1.2rem;
            color: rgba(255, 255, 255, 0.6);
            max-width: 600px;
            margin: 0 auto;
        }

        .glass-panel {
            background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 8px; /* Inner padding for the uploader */
            box-shadow: 0 20px 80px rgba(0,0,0,0.5);
            backdrop-filter: blur(20px);
        }

        .analyzer-section {
            margin-bottom: 80px;
            min-height: 400px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 100px;
        }

        .info-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 32px;
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .info-card:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.05);
        }

        .info-card h3 {
            font-size: 1rem;
            font-weight: 500;
            color: white;
            margin-bottom: 8px;
        }

        .info-card p {
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.6);
        }

        .team-section {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 80px;
        }

        .section-header {
            text-align: center;
            margin-bottom: 60px;
        }

        .section-title {
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 12px;
        }

        .guide-info {
            color: rgba(255, 255, 255, 0.5);
            font-size: 1.1rem;
        }

        .guide-info strong {
            color: white;
            font-weight: 500;
        }

        .team-grid {
            display: flex;
            justify-content: center;
            gap: 40px;
            flex-wrap: wrap;
        }

        .team-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 32px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            min-width: 240px;
        }

        .team-avatar {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #333, #111);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 600;
            color: rgba(255,255,255,0.9);
            margin-bottom: 20px;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .team-card h4 {
            font-size: 1.1rem;
            font-weight: 500;
            margin-bottom: 6px;
            color: white;
        }

        .team-card span {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.5);
        }
        
        @media (max-width: 768px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .hero-title {
                font-size: 2.5rem;
            }
        }
      `}</style>
    </div>
  );
}
