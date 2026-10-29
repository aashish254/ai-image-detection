'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { fileToBase64 } from '@/lib/utils';
import { AnalysisResult } from '@/lib/types';
import AnalysisLoader from './AnalysisLoader';
import { showToast } from './ToastProvider';
import { saveToHistory } from './AnalysisHistory';

interface ImageUploaderProps {
    onAnalysisStart: () => void;
    onAnalysisComplete: (result: AnalysisResult, imageUrl: string, imageName: string) => void;
    isAnalyzing: boolean;
}

export default function ImageUploader({
    onAnalysisStart,
    onAnalysisComplete,
    isAnalyzing,
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setError(null);

        if (acceptedFiles.length === 0) {
            return;
        }

        const file = acceptedFiles[0];

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, or WebP)');
            showToast.error('Invalid file type. Please upload an image.');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image size must be less than 10MB');
            showToast.error('File too large. Maximum size is 10MB.');
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            setPreview(base64);
            setFileName(file.name);
            showToast.upload(`Image loaded: ${file.name}`);
        } catch (err) {
            setError('Failed to load image. Please try another file.');
            showToast.error('Failed to load image.');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
        },
        maxFiles: 1,
        disabled: isAnalyzing,
    });

    const handleAnalyze = async () => {
        if (!preview) return;

        setError(null);
        onAnalysisStart();
        showToast.info('Starting analysis...');

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: preview }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            // Save to history
            saveToHistory(preview, fileName, data.result);

            // Show completion toast
            const isAI = data.result.verdict === 'AI_GENERATED' || data.result.verdict === 'LIKELY_AI';
            showToast.analysisComplete(isAI, data.result.confidence);

            onAnalysisComplete(data.result, preview, fileName);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
            showToast.error(err instanceof Error ? err.message : 'Analysis failed');
            onAnalysisComplete(null as any, '', '');
        }
    };

    const handleClear = () => {
        setPreview(null);
        setFileName('');
        setError(null);
    };

    return (
        <div className="uploader">
            <AnimatePresence mode="wait">
                {isAnalyzing ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <AnalysisLoader imageUrl={preview || undefined} />
                    </motion.div>
                ) : !preview ? (
                    <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className={`well ${isDragActive ? 'well-active' : ''}`} {...getRootProps()}>
                            <input {...getInputProps()} id="image-upload" />
                            <p className="well-title">Drag an image here</p>
                            <p className="well-hint">or choose a file from this device</p>
                            <span className="well-btn">Choose file</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="loaded">
                            <div className="loaded-plate">
                                <img src={preview} alt={`Specimen preview: ${fileName}`} className="loaded-img" />
                                <button className="loaded-clear" onClick={handleClear} aria-label="Remove this image">
                                    <X size={15} />
                                </button>
                            </div>
                            <div className="loaded-foot">
                                <div className="loaded-id">
                                    <p className="label">specimen</p>
                                    <p className="loaded-name">{fileName}</p>
                                </div>
                                <button className="btn btn-primary run-btn" onClick={handleAnalyze} disabled={isAnalyzing}>
                                    Run examination
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="error" role="alert">
                            <AlertCircle size={15} />
                            <span>{error}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
        .uploader {
          width: 100%;
        }

        .well {
          padding: 64px 24px;
          border: 1px dashed var(--rule-strong);
          border-radius: 3px;
          background: var(--sheet-sunk);
          cursor: pointer;
          text-align: center;
          transition: border-color var(--transition-fast), background var(--transition-fast);
        }

        .well:hover,
        .well-active {
          border-color: var(--ink);
          background: var(--hover-bg);
        }

        .well-title {
          font-size: 1.0625rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--ink);
          max-width: none;
        }

        .well-hint {
          margin-top: 8px;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
          max-width: none;
        }

        .well-btn {
          display: inline-block;
          margin-top: 24px;
          padding: 11px 20px;
          background: var(--btn-bg);
          color: var(--btn-fg);
          border-radius: 3px;
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .loaded {
          border: 1px solid var(--rule);
          background: var(--sheet);
        }

        .loaded-plate {
          position: relative;
          padding: 18px;
          background: var(--sheet-sunk);
          border-bottom: 1px solid var(--rule);
        }

        .loaded-img {
          display: block;
          width: 100%;
          max-height: 420px;
          object-fit: contain;
          background: var(--sheet);
          border: 1px solid var(--rule-soft);
        }

        .loaded-clear {
          position: absolute;
          top: 30px;
          right: 30px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--sheet);
          border: 1px solid var(--rule);
          border-radius: 3px;
          color: var(--graphite);
          cursor: pointer;
          transition: color var(--transition-fast), border-color var(--transition-fast);
        }

        .loaded-clear:hover {
          color: var(--flagged);
          border-color: var(--flagged);
        }

        .loaded-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 18px;
          flex-wrap: wrap;
        }

        .loaded-name {
          margin-top: 3px;
          font-family: var(--font-mono);
          font-size: 0.9375rem;
          color: var(--ink);
          max-width: 46ch;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .run-btn {
          min-width: 180px;
        }

        .error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          padding: 11px 14px;
          background: var(--flagged-wash);
          border: 1px solid var(--flagged);
          border-radius: 3px;
          color: var(--flagged);
          font-size: 0.9375rem;
          max-width: none;
        }

        @media (max-width: 620px) {
          .loaded-foot {
            align-items: stretch;
          }

          .run-btn {
            width: 100%;
          }

          .loaded-clear {
            top: 26px;
            right: 26px;
          }
        }
      `}</style>
        </div>
    );
}
