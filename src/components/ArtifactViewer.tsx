'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Artifact } from '@/lib/types';
import { getSeverityColor } from '@/lib/utils';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface ArtifactViewerProps {
  imageUrl: string;
  artifacts: Artifact[];
}

export default function ArtifactViewer({ imageUrl, artifacts }: ArtifactViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [showArtifacts, setShowArtifacts] = useState(true);
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  return (
    <div className="viewer-container">
      {/* Image Viewer */}
      <div className="image-viewport">
        <div
          className="image-wrapper"
          style={{ transform: `scale(${zoom})` }}
        >
          <img src={imageUrl} alt="Analyzed image" className="analyzed-image" />

          {/* Artifact Overlays */}
          {showArtifacts && artifacts.filter(a => a.location).map((artifact) => (
            <motion.div
              key={artifact.id}
              className={`artifact-marker ${selectedArtifact === artifact.id ? 'selected' : ''}`}
              style={{
                left: `${artifact.location!.x}%`,
                top: `${artifact.location!.y}%`,
                width: `${artifact.location!.width}%`,
                height: `${artifact.location!.height}%`,
                borderColor: getSeverityColor(artifact.severity),
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedArtifact(
                selectedArtifact === artifact.id ? null : artifact.id
              )}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="viewer-controls">
        <div className="control-group">
          <button
            className="control-btn"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button
            className="control-btn"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            className="control-btn"
            onClick={handleReset}
            aria-label="Reset zoom"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <button
          className={`control-btn toggle-btn ${showArtifacts ? 'active' : ''}`}
          onClick={() => setShowArtifacts(!showArtifacts)}
        >
          {showArtifacts ? <Eye size={18} /> : <EyeOff size={18} />}
          <span>{showArtifacts ? 'Hide' : 'Show'} Artifacts</span>
        </button>
      </div>

      {/* Artifacts List */}
      {artifacts.length > 0 && (
        <div className="artifacts-list">
          <h4>Detected Artifacts ({artifacts.length})</h4>
          <div className="artifacts-grid">
            {artifacts.map((artifact) => (
              <motion.div
                key={artifact.id}
                className={`artifact-item ${selectedArtifact === artifact.id ? 'selected' : ''}`}
                onClick={() => setSelectedArtifact(
                  selectedArtifact === artifact.id ? null : artifact.id
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="artifact-header">
                  <span
                    className="artifact-severity"
                    style={{ backgroundColor: getSeverityColor(artifact.severity) }}
                  />
                  <span className="artifact-type">{formatArtifactType(artifact.type)}</span>
                </div>
                <p className="artifact-description">{artifact.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {artifacts.length === 0 && (
        <div className="no-artifacts">
          <p>No specific visual artifacts detected with spatial coordinates.</p>
        </div>
      )}

      <style jsx>{`
        .viewer-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .image-viewport {
          position: relative;
          max-height: 500px;
          overflow: auto;
          border-radius: var(--radius-md);
          background: var(--bg-tertiary);
        }

        .image-wrapper {
          position: relative;
          transition: transform 0.3s ease;
          transform-origin: center center;
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .analyzed-image {
          max-width: 100%;
          max-height: 500px;
          height: auto;
          width: auto;
          display: block;
          object-fit: contain;
        }

        .artifact-marker {
          position: absolute;
          border: 2px solid;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .artifact-marker:hover,
        .artifact-marker.selected {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 10px currentColor;
        }

        .viewer-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-sm);
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xs);
          padding: var(--space-sm);
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .control-btn:hover:not(:disabled) {
          background: var(--primary-900);
          color: var(--primary-400);
          border-color: var(--primary-700);
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-btn {
          padding: var(--space-sm) var(--space-md);
        }

        .toggle-btn.active {
          background: var(--primary-900);
          color: var(--primary-400);
          border-color: var(--primary-700);
        }

        .zoom-level {
          min-width: 50px;
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .artifacts-list {
          padding-top: var(--space-md);
          border-top: 1px solid var(--glass-border);
        }

        .artifacts-list h4 {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: var(--space-md);
        }

        .artifacts-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          max-height: 200px;
          overflow-y: auto;
        }

        .artifact-item {
          padding: var(--space-sm) var(--space-md);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .artifact-item:hover,
        .artifact-item.selected {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .artifact-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-xs);
        }

        .artifact-severity {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
        }

        .artifact-type {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .artifact-description {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
        }

        .no-artifacts {
          padding: var(--space-md);
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

function formatArtifactType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
