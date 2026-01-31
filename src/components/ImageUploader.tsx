'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
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
        <div className="uploader-container">
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
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
                            {...getRootProps()}
                        >
                            <input {...getInputProps()} id="image-upload" />
                            <div className="dropzone-content">
                                <div className="dropzone-icon">
                                    <Upload size={48} />
                                </div>
                                <h3>Upload an Image for Analysis</h3>
                                <p>Drag & drop an image here, or click to browse</p>
                                <span className="dropzone-formats">
                                    Supports: JPG, PNG, WebP • Max size: 10MB
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="preview-container"
                    >
                        <div className="preview-image-wrapper">
                            <img src={preview} alt="Preview" className="preview-image" />
                            <button
                                className="preview-clear"
                                onClick={handleClear}
                                aria-label="Remove image"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="preview-info">
                            <div className="preview-details">
                                <ImageIcon size={20} />
                                <span className="preview-filename">{fileName}</span>
                            </div>
                            <motion.button
                                className="btn btn-primary analyze-btn"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                🔍 Analyze Image
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error State */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="error-message"
                    >
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
        .uploader-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .dropzone {
          padding: var(--space-3xl) var(--space-2xl);
          border: 2px dashed var(--glass-border);
          border-radius: var(--radius-xl);
          background: var(--glass-bg);
          cursor: pointer;
          transition: all var(--transition-normal);
          text-align: center;
        }

        .dropzone:hover,
        .dropzone-active {
          border-color: var(--primary-500);
          background: rgba(99, 102, 241, 0.05);
        }

        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
        }

        .dropzone-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: var(--radius-lg);
          color: white;
          margin-bottom: var(--space-sm);
        }

        .dropzone h3 {
          font-size: 1.25rem;
          margin: 0;
        }

        .dropzone p {
          margin: 0;
          color: var(--text-secondary);
        }

        .dropzone-formats {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .preview-container {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        .preview-image-wrapper {
          position: relative;
          max-height: 400px;
          overflow: hidden;
        }

        .preview-image {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: contain;
          background: var(--bg-tertiary);
        }

        .preview-clear {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: var(--radius-full);
          color: white;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .preview-clear:hover {
          background: rgba(239, 68, 68, 0.8);
          transform: scale(1.1);
        }

        .preview-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          border-top: 1px solid var(--glass-border);
        }

        .preview-details {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
        }

        .preview-filename {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .analyze-btn {
          min-width: 180px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-top: var(--space-lg);
          padding: var(--space-md) var(--space-lg);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: var(--danger-light);
        }

        @media (max-width: 768px) {
          .preview-info {
            flex-direction: column;
            gap: var(--space-md);
          }

          .analyze-btn {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
