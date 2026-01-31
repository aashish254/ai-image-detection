'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, Eye, Clock, CheckCircle, XCircle, Grid, List } from 'lucide-react';
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

        ctx.fillStyle = '#1a1a2e';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
        <motion.button
          className="history-toggle"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <History size={20} />
          <span>History</span>
          {history.length > 0 && (
            <span className="history-badge">{history.length}</span>
          )}
        </motion.button>
      )}

      {/* History Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="history-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="history-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="history-header">
                <h3>
                  <History size={24} />
                  Analysis History
                </h3>
                <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
              </div>

              <div className="history-controls">
                <div className="filter-buttons">
                  <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={filter === 'ai' ? 'active' : ''}
                    onClick={() => setFilter('ai')}
                  >
                    AI
                  </button>
                  <button
                    className={filter === 'real' ? 'active' : ''}
                    onClick={() => setFilter('real')}
                  >
                    Real
                  </button>
                </div>

                <div className="view-buttons">
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>

              {history.length > 0 && (
                <button className="clear-all-btn" onClick={clearHistory}>
                  <Trash2 size={16} />
                  Clear All
                </button>
              )}

              <div className={`history-items ${viewMode}`}>
                {filteredHistory.length === 0 ? (
                  <div className="empty-state">
                    <History size={48} />
                    <p>No analysis history yet</p>
                  </div>
                ) : (
                  filteredHistory.map((item, index) => {
                    const itemIsAI = isAIGenerated(item.result);
                    return (
                      <motion.div
                        key={item.id}
                        className="history-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="item-image">
                          <img src={item.imageUrl} alt={item.imageName} />
                          <div className={`item-badge ${itemIsAI ? 'ai' : 'real'}`}>
                            {itemIsAI ? (
                              <XCircle size={14} />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            {itemIsAI ? 'AI' : 'Real'}
                          </div>
                        </div>
                        <div className="item-info">
                          <p className="item-name">{item.imageName}</p>
                          <p className="item-date">
                            <Clock size={12} />
                            {formatDate(item.timestamp)}
                          </p>
                          <p className="item-confidence">
                            Confidence: {(item.result.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="item-actions">
                          <button
                            className="view-btn"
                            onClick={() => onSelectItem?.(item)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => deleteHistoryItem(item.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .history-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .history-toggle:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .history-badge {
          background: var(--gradient-primary);
          color: white;
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 10px;
          font-weight: 600;
        }

        .history-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .history-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 400px;
          max-width: 90vw;
          height: 100vh;
          background: var(--bg-elevated);
          border-left: 1px solid var(--glass-border);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .history-header h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          margin: 0;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .history-controls {
          display: flex;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .filter-buttons, .view-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-buttons button, .view-buttons button {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-buttons button.active, .view-buttons button.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
          color: var(--primary-400);
        }

        .clear-all-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin: 0.75rem 1.5rem;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-all-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .history-items {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.5rem;
        }

        .history-items.grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .history-items.list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-muted);
          text-align: center;
        }

        .empty-state p {
          margin-top: 1rem;
        }

        .history-item {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .history-items.list .history-item {
          display: flex;
          align-items: center;
        }

        .item-image {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .history-items.list .item-image {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .item-badge.ai {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }

        .item-badge.real {
          background: rgba(34, 197, 94, 0.9);
          color: white;
        }

        .item-info {
          padding: 0.75rem;
          flex: 1;
        }

        .item-name {
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0 0 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0 0 0.25rem;
        }

        .item-confidence {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .item-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem;
        }

        .history-items.grid .item-actions {
          justify-content: center;
          border-top: 1px solid var(--glass-border);
        }

        .view-btn, .delete-btn {
          padding: 0.5rem;
          background: transparent;
          border: 1px solid var(--glass-border);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
          color: var(--primary-400);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          color: #ef4444;
        }
      `}</style>
    </>
  );
}
