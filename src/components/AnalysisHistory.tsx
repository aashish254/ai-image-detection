'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VERDICT_TONE } from '@/lib/report';
import { getVerdictLabel } from '@/lib/utils';
import { AnalysisResult } from '@/lib/types';

interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  imageName: string;
  result: AnalysisResult;
}

interface AnalysisHistoryProps {
  onSelectItem?: (item: HistoryItem) => void;
  triggerElement?: React.ReactElement; // Optional custom trigger button
}

const STORAGE_KEY = 'ai_forensic_history';
const MAX_HISTORY_ITEMS = 20;  // Reduced from 50 to prevent quota issues
const MAX_IMAGE_SIZE = 50000;  // Max 50KB for thumbnail

// Check if result indicates AI generated
function isAIGenerated(result: AnalysisResult): boolean {
  return result.verdict === 'AI_GENERATED' || result.verdict === 'LIKELY_AI';
}

// Create a small thumbnail from image URL
function createThumbnail(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    // If not a data URL or already small, return a placeholder
    if (!imageUrl.startsWith('data:image')) {
      resolve(imageUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Create tiny thumbnail (64x64)
      const size = 64;
      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        // Draw scaled image
        const scale = Math.min(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;

        ctx.fillStyle = '#8e959d';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, x, y, w, h);

        resolve(canvas.toDataURL('image/jpeg', 0.5));
      } else {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = imageUrl;
  });
}

// Create minimal result for storage
function createMinimalResult(result: AnalysisResult): Partial<AnalysisResult> {
  return {
    verdict: result.verdict,
    confidence: result.confidence,
    explanation: result.explanation.slice(0, 200), // Truncate explanation
  };
}

// Save to history with error handling
export async function saveToHistory(imageUrl: string, imageName: string, result: AnalysisResult) {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();

    // Create thumbnail for storage
    const thumbnail = await createThumbnail(imageUrl);

    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      imageUrl: thumbnail, // Store thumbnail instead of full image
      imageName,
      result: createMinimalResult(result) as AnalysisResult,
    };

    // Keep only last N items
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (quotaError) {
      // If still too large, remove oldest items until it fits
      console.warn('Storage quota exceeded, trimming history...');
      let trimmedHistory = updatedHistory;
      while (trimmedHistory.length > 1) {
        trimmedHistory = trimmedHistory.slice(0, -1);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
          break;
        } catch {
          continue;
        }
      }

      // If still failing, clear entirely
      if (trimmedHistory.length <= 1) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem]));
      }
    }

    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('historyUpdated'));
  } catch (error) {
    console.error('Failed to save to history:', error);
    // Clear corrupted storage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

// Get history with auto-cleanup for corrupted/large data
export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    // Check if data is too large (> 1MB is concerning)
    if (data.length > 1000000) {
      console.warn('History data too large, clearing...');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    const parsed = JSON.parse(data);

    // Validate parsed data is an array
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse history, clearing:', error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    return [];
  }
}

// Clear history
export function clearHistory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('historyUpdated'));
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

// Delete single item
export function deleteHistoryItem(id: string) {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    window.dispatchEvent(new CustomEvent('historyUpdated'));
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
}

export default function AnalysisHistory({ onSelectItem, triggerElement }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'ai' | 'real'>('all');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHistory(getHistory());

    const handleUpdate = () => setHistory(getHistory());
    window.addEventListener('historyUpdated', handleUpdate);
    return () => window.removeEventListener('historyUpdated', handleUpdate);
  }, []);

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    const itemIsAI = isAIGenerated(item.result);
    return filter === 'ai' ? itemIsAI : !itemIsAI;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Toggle Button */}
      {triggerElement ? (
        <div onClick={() => setIsOpen(!isOpen)}>
          {triggerElement}
        </div>
      ) : (
        <button className="drawer-trigger" onClick={() => setIsOpen(!isOpen)}>
          Past reports{history.length > 0 ? ` · ${history.length}` : ''}
        </button>
      )}

      {/* History Panel — portalled to <body>: <main> carries z-index:1, which would
          otherwise trap a fixed overlay in that stacking context, under the navbar. */}
      {isOpen &&
        createPortal(
          <>
            <div className="drawer-veil" onClick={() => setIsOpen(false)} />
            <aside className="drawer" aria-label="Past reports">
              <div className="drawer-head">
                <div>
                  <p className="k">Log</p>
                  <h3>Past reports from this browser</h3>
                  <p className="drawer-note">
                    Only the verdict, the confidence and the thumbnail are kept — the measurements
                    behind a report are not stored, so an earlier entry cannot be reopened.
                  </p>
                </div>
                <button className="drawer-close" onClick={() => setIsOpen(false)}>
                  Close
                </button>
              </div>

              <div className="drawer-filters">
                <button
                  type="button"
                  className={`opt${filter === 'all' ? ' on' : ''}`}
                  aria-pressed={filter === 'all'}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`opt${filter === 'ai' ? ' on' : ''}`}
                  aria-pressed={filter === 'ai'}
                  onClick={() => setFilter('ai')}
                >
                  AI
                </button>
                <button
                  type="button"
                  className={`opt${filter === 'real' ? ' on' : ''}`}
                  aria-pressed={filter === 'real'}
                  onClick={() => setFilter('real')}
                >
                  Real
                </button>
                <span className="drawer-count">
                  {filteredHistory.length} of {history.length}
                </span>
              </div>

              {history.length === 0 ? (
                <p className="dp-none drawer-empty">
                  Nothing kept yet. A report is filed here each time an image finishes.
                </p>
              ) : (
                <div className="drawer-rows">
                  {filteredHistory.length === 0 ? (
                    <p className="dp-none">
                      No {filter === 'ai' ? 'AI' : 'real'} verdicts among the {history.length}{' '}
                      kept.
                    </p>
                  ) : (
                    filteredHistory.map((item) => {
                      const itemIsAI = isAIGenerated(item.result);
                      return (
                        <div className="drawer-row" key={item.id}>
                          {item.imageUrl ? (
                            <img
                              className="thumb"
                              src={item.imageUrl}
                              alt={item.imageName}
                              width={56}
                              height={56}
                            />
                          ) : (
                            <span className="thumb thumb-missing" />
                          )}
                          <span className="row-name">{item.imageName}</span>
                          <span className="row-meta">
                            {formatDate(item.timestamp)} · confidence{' '}
                            {(item.result.confidence * 100).toFixed(0)}%
                          </span>
                          <span className={`row-word tone ${VERDICT_TONE[item.result.verdict] ?? 'caution'}`}>
                            {getVerdictLabel(item.result.verdict).label}
                          </span>
                          <div className="row-acts">
                            {onSelectItem && (
                              <button
                                type="button"
                                className="row-act"
                                onClick={() => onSelectItem(item)}
                              >
                                Open
                              </button>
                            )}
                            <button
                              type="button"
                              className="row-act"
                              onClick={() => deleteHistoryItem(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {history.length > 0 && (
                <div className="drawer-foot">
                  <button type="button" className="row-act danger" onClick={clearHistory}>
                    Clear all {history.length}
                  </button>
                </div>
              )}
            </aside>
          </>,
          document.body
        )}

      <style jsx>{`
        .drawer-trigger {
          padding: 6px 12px;
          border: 1px solid var(--rule);
          background: transparent;
          font: inherit;
          font-size: 0.875rem;
          color: var(--graphite);
          cursor: pointer;
        }

        .drawer-veil {
          position: fixed;
          inset: 0;
          background: rgba(12, 14, 17, 0.45);
          z-index: 1100;
          animation: ol-veil-in 0.18s ease-out;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          width: min(460px, 100vw);
          background: var(--sheet);
          border-left: 1px solid var(--rule);
          z-index: 1101;
          display: flex;
          flex-direction: column;
          animation: ol-drawer-in 0.2s ease-out;
        }

        .drawer-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 22px;
          border-bottom: 1px solid var(--rule);
        }

        .drawer-head h3 {
          margin: 2px 0 0;
          font-size: 1.125rem;
        }

        .drawer-note {
          margin: 8px 0 0;
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--muted);
          max-width: 40ch;
        }

        .drawer-close {
          flex-shrink: 0;
          padding: 2px 0 3px;
          background: none;
          border: 0;
          border-bottom: 1px solid var(--rule-strong);
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--graphite);
          cursor: pointer;
        }

        .drawer-filters {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 14px 22px;
          border-bottom: 1px solid var(--rule-soft);
        }

        .drawer-count {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
        }

        .drawer-rows {
          flex: 1;
          overflow-y: auto;
          padding: 0 22px;
        }

        .drawer-row {
          display: grid;
          grid-template-columns: 56px minmax(0, 1fr) auto;
          grid-template-areas:
            'thumb name word'
            'thumb meta meta'
            'thumb acts acts';
          gap: 2px 12px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--rule-soft);
        }

        .thumb {
          grid-area: thumb;
          width: 56px;
          height: 56px;
          object-fit: cover;
          border: 1px solid var(--rule);
          background: var(--sheet-sunk);
        }

        .thumb-missing {
          display: block;
        }

        .row-name {
          grid-area: name;
          display: block;
          min-width: 0;
          font-size: 0.9375rem;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .row-meta {
          grid-area: meta;
          display: block;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
        }

        .row-word {
          grid-area: word;
          justify-self: end;
          font-family: var(--font-mono);
          font-size: 0.9375rem;
          white-space: nowrap;
        }

        .row-acts {
          grid-area: acts;
          display: flex;
          gap: 14px;
        }

        .row-act {
          padding: 2px 0 3px;
          background: none;
          border: 0;
          border-bottom: 1px solid var(--rule);
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--graphite);
          cursor: pointer;
        }

        .row-act:hover {
          border-bottom-color: var(--ink);
          color: var(--ink);
        }

        .row-act.danger:hover {
          border-bottom-color: var(--flagged);
          color: var(--flagged);
        }

        .drawer-empty {
          padding: 22px;
        }

        .drawer-foot {
          padding: 14px 22px;
          border-top: 1px solid var(--rule);
        }
      `}</style>
    </>
  );
}
