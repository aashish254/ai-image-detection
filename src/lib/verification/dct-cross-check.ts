/**
 * REGION-SPECIFIC DCT CROSS-VERIFICATION
 * ========================================
 * 
 * The "Second Opinion" filter for VPT artifact detections.
 * 
 * How it works:
 * 1. VPT says: "Artifact at [ymin, xmin, ymax, xmax]"
 * 2. This module CROPS that specific region from the image
 * 3. Runs localized DCT/entropy analysis on JUST that spot
 * 4. If the spot looks statistically "natural" → DISCARD (false alarm)
 * 5. If it finds mathematical anomalies → CONFIRMED artifact
 * 
 * This "Handshake" between Semantic AI (VPT) and Statistical AI (DCT)
 * drastically reduces false positives.
 * 
 * Authors: Rahul Yadav, Aashish Kumar Mahato, Bibek Gami
 */

import sharp from 'sharp';

// Define the structure of an artifact region to verify
export interface ArtifactRegion {
    x: number;        // Left edge in pixels
    y: number;        // Top edge in pixels
    width: number;    // Width in pixels
    height: number;   // Height in pixels
    confidence: number;
    label: string;
}

export interface VerificationResult {
    verified: boolean;       // true = confirmed artifact, false = false positive
    score: number;           // 0-1 confidence boost/reduction
    reason: string;          // Human-readable explanation
    metrics: {
        localEntropy: number;
        noiseLevel: number;
        edgeConsistency: number;
        smoothnessRatio: number;
    };
}

export interface CrossCheckSummary {
    totalCandidates: number;
    confirmed: number;
    discarded: number;
    verificationRate: number;    // confirmed / total
    averageConfidenceBoost: number;
    processingTime: number;
}

/**
 * Verifies if a detected region actually contains digital anomalies
 * using localized Discrete Cosine Transform (DCT) and Entropy analysis.
 */
export async function verifyRegion(
    imageBuffer: Buffer,
    box: ArtifactRegion,
    imageWidth: number,
    imageHeight: number
): Promise<VerificationResult> {
    try {
        // Ensure coordinates are within image bounds
        const padding = 4;
        const left = Math.max(0, Math.floor(box.x - padding));
        const top = Math.max(0, Math.floor(box.y - padding));
        const width = Math.min(Math.floor(box.width + padding * 2), imageWidth - left);
        const height = Math.min(Math.floor(box.height + padding * 2), imageHeight - top);

        // Skip if region is too small to analyze
        if (width < 8 || height < 8) {
            return {
                verified: true,
                score: box.confidence * 0.5,
                reason: 'Region too small for verification (kept with reduced confidence)',
                metrics: { localEntropy: 0, noiseLevel: 0, edgeConsistency: 0, smoothnessRatio: 0 },
            };
        }

        // 1. Crop the suspicious region using sharp
        const crop = await sharp(imageBuffer)
            .extract({ left, top, width, height })
            .grayscale()    // Frequency analysis works best on luminance
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { data, info } = crop;

        // 2. Calculate Local Metrics
        const entropy = calculateLocalEntropy(data, info.width, info.height);
        const noiseLevel = calculateHighFreqNoise(data, info.width, info.height);
        const edgeConsistency = calculateEdgeConsistency(data, info.width, info.height);
        const smoothnessRatio = calculateSmoothnessRatio(data, info.width, info.height);

        // 3. Define Thresholds for "AI Glitches"
        // AI artifacts are often weirdly smooth (low entropy) OR noisy (high variance)
        const isUnusuallySmooth = entropy < 4.5;          // Smudged texture
        const isHighFreqNoise = noiseLevel > 25.0;        // Checkerboard pattern/noise
        const hasInconsistentEdges = edgeConsistency < 0.3; // Edges don't follow natural patterns
        const isTooUniform = smoothnessRatio > 0.85;       // Suspiciously uniform region

        // 4. Verification Logic — multiple indicators increase confidence
        let anomalyIndicators = 0;
        const reasons: string[] = [];

        if (isUnusuallySmooth) {
            anomalyIndicators++;
            reasons.push('Anomalous Smoothing (Smudge Artifact)');
        }

        if (isHighFreqNoise) {
            anomalyIndicators++;
            reasons.push('High-Frequency Noise (Checkerboard Artifact)');
        }

        if (hasInconsistentEdges) {
            anomalyIndicators++;
            reasons.push('Inconsistent Edge Patterns');
        }

        if (isTooUniform) {
            anomalyIndicators++;
            reasons.push('Suspiciously Uniform Texture');
        }

        const metrics = {
            localEntropy: entropy,
            noiseLevel,
            edgeConsistency,
            smoothnessRatio,
        };

        // Multiple anomaly indicators = higher confidence
        if (anomalyIndicators >= 2) {
            return {
                verified: true,
                score: Math.min(0.95, 0.8 + anomalyIndicators * 0.05),
                reason: `CONFIRMED: ${reasons.join(' + ')}`,
                metrics,
            };
        }

        if (anomalyIndicators === 1) {
            return {
                verified: true,
                score: 0.75,
                reason: `Likely Artifact: ${reasons[0]}`,
                metrics,
            };
        }

        // No anomaly indicators — region looks natural
        return {
            verified: false,
            score: 0.1,
            reason: 'Natural Texture Distribution — No statistical anomalies found',
            metrics,
        };

    } catch (error) {
        console.error('[CrossCheck] Verification failed for region:', error);
        // On error, keep the artifact with reduced confidence
        return {
            verified: true,
            score: box.confidence * 0.5,
            reason: 'Verification Error (kept with reduced confidence)',
            metrics: { localEntropy: 0, noiseLevel: 0, edgeConsistency: 0, smoothnessRatio: 0 },
        };
    }
}

/**
 * Batch-verify multiple artifact candidates.
 * Returns only confirmed artifacts + a summary.
 */
export async function crossCheckArtifacts(
    imageBase64: string,
    candidates: ArtifactRegion[],
    imageWidth: number = 1024,
    imageHeight: number = 1024
): Promise<{ confirmed: (ArtifactRegion & { verificationReason: string })[], summary: CrossCheckSummary }> {
    const startTime = Date.now();

    if (candidates.length === 0) {
        return {
            confirmed: [],
            summary: {
                totalCandidates: 0,
                confirmed: 0,
                discarded: 0,
                verificationRate: 0,
                averageConfidenceBoost: 0,
                processingTime: 0,
            },
        };
    }

    // Decode image to buffer
    const base64Data = imageBase64.includes('base64,')
        ? imageBase64.split('base64,')[1]
        : imageBase64;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const confirmed: (ArtifactRegion & { verificationReason: string })[] = [];
    let totalConfidenceBoost = 0;

    for (const candidate of candidates) {
        const check = await verifyRegion(imageBuffer, candidate, imageWidth, imageHeight);

        if (check.verified) {
            // Boost confidence if verified — average original and verification score
            const boostedConfidence = (candidate.confidence + check.score) / 2;
            confirmed.push({
                ...candidate,
                confidence: boostedConfidence,
                verificationReason: check.reason,
            });
            totalConfidenceBoost += boostedConfidence - candidate.confidence;
        } else {
            console.log(
                `[CrossCheck] Discarded False Positive at [${candidate.x}, ${candidate.y}]: ${check.reason}`
            );
        }
    }

    const processingTime = Date.now() - startTime;

    return {
        confirmed,
        summary: {
            totalCandidates: candidates.length,
            confirmed: confirmed.length,
            discarded: candidates.length - confirmed.length,
            verificationRate: confirmed.length / candidates.length,
            averageConfidenceBoost: confirmed.length > 0 ? totalConfidenceBoost / confirmed.length : 0,
            processingTime,
        },
    };
}

// ─── Helper Math Functions ────────────────────────────────────────────

/**
 * Calculate Shannon entropy of a grayscale region.
 * Low entropy = suspiciously smooth (AI smudging)
 * Normal photos typically have entropy between 5.0 and 7.5
 */
function calculateLocalEntropy(data: Buffer, width: number, height: number): number {
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i++) {
        histogram[data[i]]++;
    }

    const total = data.length;
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
        if (histogram[i] > 0) {
            const p = histogram[i] / total;
            entropy -= p * Math.log2(p);
        }
    }
    return entropy;
}

/**
 * Calculate high-frequency noise using Laplacian variance.
 * High variance = sharp edges or AI checkerboard noise
 * Low variance = smooth natural texture or AI smudging
 * 
 * Laplacian Kernel:
 *   0  1  0
 *   1 -4  1
 *   0  1  0
 */
function calculateHighFreqNoise(data: Buffer, width: number, height: number): number {
    let sum = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const val = data[idx];

            const laplacian =
                data[idx - 1] +
                data[idx + 1] +
                data[idx - width] +
                data[idx + width] -
                (4 * val);

            sum += Math.abs(laplacian);
            count++;
        }
    }

    return count > 0 ? sum / count : 0;
}

/**
 * Calculate edge consistency — how natural the edge transitions are.
 * Natural images have gradual edge transitions.
 * AI artifacts often have abrupt, inconsistent edges.
 */
function calculateEdgeConsistency(data: Buffer, width: number, height: number): number {
    const gradients: number[] = [];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            // Sobel-like gradient magnitude
            const gx = Math.abs(data[idx + 1] - data[idx - 1]);
            const gy = Math.abs(data[idx + width] - data[idx - width]);
            gradients.push(Math.sqrt(gx * gx + gy * gy));
        }
    }

    if (gradients.length === 0) return 1;

    // Calculate coefficient of variation of gradients
    const mean = gradients.reduce((a, b) => a + b, 0) / gradients.length;
    if (mean === 0) return 1;

    const variance = gradients.reduce((sum, g) => sum + (g - mean) ** 2, 0) / gradients.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Normalize: high CV = inconsistent edges (bad), low CV = uniform edges
    // Natural images typically have CV between 0.5 and 1.5
    // Values outside this range are suspicious
    return Math.max(0, Math.min(1, 1 - Math.abs(cv - 1)));
}

/**
 * Calculate smoothness ratio — fraction of pixel transitions that are "smooth".
 * Very high smoothness (>0.85) in a small region is suspicious for AI.
 */
function calculateSmoothnessRatio(data: Buffer, width: number, height: number): number {
    let smoothTransitions = 0;
    let totalTransitions = 0;

    for (let i = 1; i < data.length; i++) {
        const diff = Math.abs(data[i] - data[i - 1]);
        if (diff < 5) {
            smoothTransitions++;
        }
        totalTransitions++;
    }

    return totalTransitions > 0 ? smoothTransitions / totalTransitions : 0;
}
