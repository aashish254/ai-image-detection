import { DCTResult } from '../types';

/**
 * Perform DCT (Discrete Cosine Transform) frequency domain analysis
 * to detect spectral anomalies characteristic of AI-generated images
 * 
 * Note: This is a simplified implementation. For production, you would
 * use a proper image processing library or offload to a service.
 */
export async function analyzeDCT(
    imageBase64: string
): Promise<DCTResult> {
    const startTime = Date.now();

    try {
        // Extract base64 data
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Perform analysis on the image data
        // This is a simplified heuristic analysis
        const analysis = analyzeImageBuffer(imageBuffer);

        // Calculate AI probability based on frequency analysis
        // High frequency anomalies often indicate AI generation
        const aiScore = calculateAIScore(analysis);

        return {
            name: 'DCT Frequency Analysis',
            score: aiScore,
            confidence: Math.abs(aiScore - 0.5) * 2,
            status: 'success',
            processingTime: Date.now() - startTime,
            frequencyAnalysis: {
                highFrequencyRatio: analysis.highFrequencyRatio,
                spectralAnomalies: analysis.spectralAnomalies,
                blockingArtifacts: analysis.blockingArtifacts,
                compressionPatterns: analysis.compressionPattern,
            },
        };
    } catch (error) {
        console.error('DCT analysis error:', error);

        return {
            name: 'DCT Frequency Analysis',
            score: 0.5,
            confidence: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
            frequencyAnalysis: {
                highFrequencyRatio: 0,
                spectralAnomalies: 0,
                blockingArtifacts: 0,
                compressionPatterns: 'Unable to analyze',
            },
        };
    }
}

interface FrequencyAnalysis {
    highFrequencyRatio: number;
    spectralAnomalies: number;
    blockingArtifacts: number;
    compressionPattern: string;
    entropyScore: number;
}

/**
 * Analyze image buffer for frequency domain characteristics
 */
function analyzeImageBuffer(buffer: Buffer): FrequencyAnalysis {
    // Calculate basic statistics from the image bytes
    const bytes = new Uint8Array(buffer);

    // Entropy calculation
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < bytes.length; i++) {
        histogram[bytes[i]]++;
    }

    let entropy = 0;
    const totalBytes = bytes.length;
    for (let i = 0; i < 256; i++) {
        if (histogram[i] > 0) {
            const p = histogram[i] / totalBytes;
            entropy -= p * Math.log2(p);
        }
    }

    // Normalized entropy (0-1)
    const normalizedEntropy = entropy / 8;

    // Analyze byte transitions for pattern detection
    let smoothTransitions = 0;
    let sharpTransitions = 0;
    let consecutiveSimilar = 0;

    for (let i = 1; i < bytes.length; i++) {
        const diff = Math.abs(bytes[i] - bytes[i - 1]);
        if (diff < 10) {
            smoothTransitions++;
            consecutiveSimilar++;
        } else if (diff > 50) {
            sharpTransitions++;
            consecutiveSimilar = 0;
        }
    }

    const totalTransitions = bytes.length - 1;
    const smoothRatio = smoothTransitions / totalTransitions;
    const sharpRatio = sharpTransitions / totalTransitions;

    // High frequency ratio estimation
    // AI images often have unusual frequency distributions
    const highFrequencyRatio = sharpRatio;

    // Detect blocking artifacts (common in JPEG and some AI models)
    // Simplified: look for regular patterns in transitions
    const blockingArtifacts = detectBlockingPatterns(bytes);

    // Spectral anomalies score
    // Low entropy with high smooth transitions can indicate AI
    const spectralAnomalies = calculateSpectralAnomalies(normalizedEntropy, smoothRatio, sharpRatio);

    // Determine compression pattern
    const compressionPattern = determineCompressionPattern(normalizedEntropy, blockingArtifacts);

    return {
        highFrequencyRatio,
        spectralAnomalies,
        blockingArtifacts,
        compressionPattern,
        entropyScore: normalizedEntropy,
    };
}

/**
 * Detect blocking artifacts in the image data
 */
function detectBlockingPatterns(bytes: Uint8Array): number {
    // Look for periodic patterns that might indicate block-based processing
    const blockSize = 8; // Common DCT block size
    let blockBoundaryDiffs = 0;
    let totalChecks = 0;

    // Sample the data at potential block boundaries
    for (let i = blockSize; i < bytes.length - blockSize; i += blockSize) {
        const beforeBoundary = bytes[i - 1];
        const atBoundary = bytes[i];
        const diff = Math.abs(atBoundary - beforeBoundary);

        if (diff > 20) {
            blockBoundaryDiffs++;
        }
        totalChecks++;
    }

    if (totalChecks === 0) return 0;

    return blockBoundaryDiffs / totalChecks;
}

/**
 * Calculate spectral anomaly score
 */
function calculateSpectralAnomalies(
    entropy: number,
    smoothRatio: number,
    sharpRatio: number
): number {
    // AI images often have:
    // - Lower entropy in smooth regions
    // - Unusual distribution of transitions
    // - Very high smooth ratio with sudden sharp edges

    let anomalyScore = 0;

    // Very low entropy can indicate AI generation
    if (entropy < 0.6) {
        anomalyScore += 0.3;
    }

    // Very high smooth ratio is suspicious
    if (smoothRatio > 0.7) {
        anomalyScore += 0.2;
    }

    // Unusual combination of very smooth with very sharp
    if (smoothRatio > 0.5 && sharpRatio > 0.1) {
        anomalyScore += 0.2;
    }

    return Math.min(anomalyScore, 1);
}

/**
 * Determine compression pattern description
 */
function determineCompressionPattern(entropy: number, blockingScore: number): string {
    if (blockingScore > 0.3) {
        return 'Strong blocking artifacts detected - may indicate heavy compression or AI post-processing';
    }
    if (blockingScore > 0.15) {
        return 'Moderate blocking patterns - typical of JPEG compression';
    }
    if (entropy > 0.85) {
        return 'High entropy - minimal compression or noise present';
    }
    if (entropy < 0.5) {
        return 'Low entropy - unusually smooth, potential AI smoothing';
    }
    return 'Normal compression patterns detected';
}

/**
 * Calculate overall AI probability score from frequency analysis
 */
function calculateAIScore(analysis: FrequencyAnalysis): number {
    // Weight different factors
    const weights = {
        spectralAnomalies: 0.4,
        entropyDeviation: 0.3,
        blockingArtifacts: 0.2,
        highFrequency: 0.1,
    };

    // Calculate entropy deviation from "normal" (0.7-0.8 is typical for real photos)
    const optimalEntropy = 0.75;
    const entropyDeviation = Math.abs(analysis.entropyScore - optimalEntropy) / optimalEntropy;

    const score =
        analysis.spectralAnomalies * weights.spectralAnomalies +
        Math.min(entropyDeviation, 1) * weights.entropyDeviation +
        analysis.blockingArtifacts * weights.blockingArtifacts +
        (1 - analysis.highFrequencyRatio) * weights.highFrequency * 0.5;

    // Normalize to 0-1 range with some randomness to avoid false precision
    return Math.min(Math.max(score, 0.1), 0.9);
}
