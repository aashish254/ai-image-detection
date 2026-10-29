import CryptoJS from 'crypto-js';
import { AnalysisResult } from './types';

/**
 * Generate a hash from base64 image for caching
 */
export function generateImageHash(base64Image: string): string {
    // Use first 50000 chars to avoid performance issues with large images
    const imageData = base64Image.substring(0, 50000);
    return CryptoJS.SHA256(imageData).toString().substring(0, 32);
}

/**
 * Convert File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

/**
 * Extract MIME type from base64 data URL
 */
export function getMimeType(base64: string): string {
    const match = base64.match(/^data:([^;]+);base64,/);
    return match ? match[1] : 'image/jpeg';
}

/**
 * Format confidence score as percentage
 */
export function formatConfidence(score: number): string {
    return `${(score * 100).toFixed(1)}%`;
}

/**
 * Get verdict label and color
 */
export function getVerdictLabel(verdict: string): { label: string; emoji: string; color: string } {
    switch (verdict) {
        case 'AI_GENERATED':
            return { label: 'AI Generated', emoji: '🤖', color: '#ef4444' };
        case 'LIKELY_AI':
            return { label: 'Likely AI', emoji: '⚠️', color: '#f97316' };
        case 'UNCERTAIN':
            return { label: 'Uncertain', emoji: '🤔', color: '#eab308' };
        case 'LIKELY_REAL':
            return { label: 'Likely Real', emoji: '👍', color: '#22c55e' };
        case 'REAL':
            return { label: 'Real Photo', emoji: '✅', color: '#10b981' };
        default:
            return { label: 'Unknown', emoji: '❓', color: '#6b7280' };
    }
}

/**
 * Get verdict from numeric score
 */
export function getVerdictFromScore(score: number): AnalysisResult['verdict'] {
    if (score >= 0.85) return 'AI_GENERATED';
    if (score >= 0.65) return 'LIKELY_AI';
    if (score >= 0.35) return 'UNCERTAIN';
    if (score >= 0.15) return 'LIKELY_REAL';
    return 'REAL';
}

/**
 * Calculate fusion score with static weights
 */
export function calculateFusionScore(
    huggingfaceScore: number,
    visionLLMScore: number,
    dctScore: number
): { finalScore: number; weights: { hf: number; vlm: number; dct: number } } {
    const weights = { hf: 0.6, vlm: 0.3, dct: 0.1 };
    const finalScore =
        (huggingfaceScore * weights.hf) +
        (visionLLMScore * weights.vlm) +
        (dctScore * weights.dct);

    return { finalScore: clamp(finalScore, 0, 1), weights };
}

/**
 * Format processing time in human-readable format
 */
export function formatProcessingTime(ms: number): string {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Delay for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format date for display
 */
export function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Get color for artifact severity
 */
export function getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
    switch (severity) {
        case 'high':
            return '#ef4444';
        case 'medium':
            return '#f59e0b';
        case 'low':
            return '#22c55e';
        default:
            return '#6b7280';
    }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Check if image is valid base64
 */
export function isValidBase64Image(base64: string): boolean {
    if (!base64) return false;
    const regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
    return regex.test(base64);
}

/**
 * Parse score from 0-1 to percentage with color
 */
export function parseScoreWithColor(score: number): { percent: string; color: string } {
    const percent = `${(score * 100).toFixed(0)}%`;
    let color = '#6b7280';

    if (score >= 0.7) color = '#ef4444';      // Red - high AI
    else if (score >= 0.5) color = '#f97316'; // Orange
    else if (score >= 0.3) color = '#eab308'; // Yellow
    else color = '#22c55e';                   // Green - low AI

    return { percent, color };
}
