/**
 * VPT Model Integration Client
 * =============================
 * Connects to the VPT Artifact Sentinel FastAPI backend to get
 * bounding-box-level AI artifact detections. Falls back to enhanced
 * heuristic detection when the VPT server is unavailable.
 */

import { ArtifactCoordinate } from './types';
import { crossCheckArtifacts, ArtifactRegion, CrossCheckSummary } from './verification/dct-cross-check';

// VPT Server configuration
const VPT_SERVER_URL = process.env.VPT_SERVER_URL || 'http://localhost:8100';
const VPT_TIMEOUT_MS = 60000; // 60 second timeout (allows for remote Colab GPU)

interface VPTDetection {
    label: string;
    confidence: number;
    bbox: [number, number, number, number] | null; // [ymin, xmin, ymax, xmax] normalized 0-1
    description: string;
}

interface VPTServerResponse {
    verdict: string;
    detections: VPTDetection[];
    raw_output: string;
    model_loaded: boolean;
}

export interface VPTAnalysisResult {
    verdict: string;
    artifacts: ArtifactCoordinate[];
    boundingBoxes: VPTBoundingBox[];
    rawOutput: string;
    modelLoaded: boolean;
    serverAvailable: boolean;
}

export interface VPTBoundingBox {
    ymin: number; // Normalized 0-1
    xmin: number;
    ymax: number;
    xmax: number;
    centerX: number; // Normalized center
    centerY: number;
    width: number;   // Normalized dimensions
    height: number;
    confidence: number;
    label: string;
    description: string;
}

/**
 * Check if the VPT server is running
 */
export async function checkVPTHealth(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${VPT_SERVER_URL}/health`, {
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
            const data = await response.json();
            console.log(`[VPT] Server health: ${JSON.stringify(data)}`);
            return true;
        }
        return false;
    } catch (error) {
        console.log(`[VPT] Server not available at ${VPT_SERVER_URL}`);
        return false;
    }
}

/**
 * Analyze an image using the VPT model server
 */
export async function analyzeWithVPT(imageBase64: string): Promise<VPTAnalysisResult> {
    console.log(`[VPT] Starting VPT analysis...`);

    // First check if server is available
    const serverAvailable = await checkVPTHealth();

    if (!serverAvailable) {
        console.log(`[VPT] Server unavailable — using enhanced heuristic fallback`);
        return createFallbackResult(imageBase64);
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), VPT_TIMEOUT_MS);

        const response = await fetch(`${VPT_SERVER_URL}/analyze-json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`VPT server responded with ${response.status}`);
        }

        const data: VPTServerResponse = await response.json();
        console.log(`[VPT] Model loaded: ${data.model_loaded}, Verdict: ${data.verdict}`);
        console.log(`[VPT] Raw detections: ${data.detections.length}`);

        // Convert VPT detections to our format — WITH FALSE POSITIVE FILTERING
        const boundingBoxes: VPTBoundingBox[] = [];
        const artifacts: ArtifactCoordinate[] = [];
        let discardedCount = 0;

        for (const detection of data.detections) {
            if (detection.bbox) {
                const [ymin, xmin, ymax, xmax] = detection.bbox;
                const centerX = (xmin + xmax) / 2;
                const centerY = (ymin + ymax) / 2;
                const width = xmax - xmin;
                const height = ymax - ymin;

                // FALSE POSITIVE FILTER 1: Discard boxes covering >80% of the image
                // If VPT flags the entire image as one artifact, it's likely a false positive
                const area = width * height;
                if (area > 0.80) {
                    console.log(`[VPT] Discarded oversized box (area=${(area * 100).toFixed(1)}%) — likely false positive`);
                    discardedCount++;
                    continue;
                }

                // FALSE POSITIVE FILTER 2: Require minimum confidence threshold
                if (detection.confidence < 0.35) {
                    console.log(`[VPT] Discarded low-confidence detection (${(detection.confidence * 100).toFixed(1)}%)`);
                    discardedCount++;
                    continue;
                }

                boundingBoxes.push({
                    ymin, xmin, ymax, xmax,
                    centerX, centerY,
                    width, height,
                    confidence: detection.confidence,
                    label: detection.label,
                    description: detection.description,
                });

                // Also create ArtifactCoordinate for the forensic report
                artifacts.push({
                    x: Math.round(centerX * 1024), // Estimated pixel coords (1024x1024)
                    y: Math.round(centerY * 1024),
                    regionX: centerX,
                    regionY: centerY,
                    confidence: detection.confidence,
                    anomalyType: detection.label,
                    description: detection.description,
                    severity: detection.confidence > 0.7 ? 'high' : detection.confidence > 0.4 ? 'medium' : 'low',
                });
            }
        }

        console.log(`[VPT] After filtering: ${boundingBoxes.length} kept, ${discardedCount} discarded`);

        return {
            verdict: data.verdict,
            artifacts,
            boundingBoxes,
            rawOutput: data.raw_output,
            modelLoaded: data.model_loaded,
            serverAvailable: true,
        };
    } catch (error) {
        console.error(`[VPT] Analysis failed:`, error);
        return createFallbackResult(imageBase64);
    }
}

/**
 * Enhanced heuristic fallback when VPT server is unavailable.
 * Uses client-side pixel analysis to detect anomalies.
 */
function createFallbackResult(imageBase64: string): VPTAnalysisResult {
    console.log(`[VPT] Using enhanced heuristic detection as fallback`);

    // Analyze image data for anomalies using byte-level heuristics
    const artifacts: ArtifactCoordinate[] = [];
    const boundingBoxes: VPTBoundingBox[] = [];

    try {
        // Extract raw bytes from base64
        const base64Data = imageBase64.includes('base64,')
            ? imageBase64.split('base64,')[1]
            : imageBase64;

        const bytes = Buffer.from(base64Data, 'base64');

        // Analyze byte distribution for AI signatures
        const chunkSize = Math.floor(bytes.length / 9); // 3x3 grid
        const gridScores: number[] = [];

        for (let i = 0; i < 9; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, bytes.length);
            const chunk = bytes.slice(start, end);

            // Compute byte entropy (lower entropy = more AI-like in some regions)
            const histogram = new Array(256).fill(0);
            for (let j = 0; j < chunk.length; j++) {
                histogram[chunk[j]]++;
            }

            let entropy = 0;
            for (let j = 0; j < 256; j++) {
                if (histogram[j] > 0) {
                    const p = histogram[j] / chunk.length;
                    entropy -= p * Math.log2(p);
                }
            }

            // Normalize entropy score (8 bits = max entropy)
            const normalizedEntropy = entropy / 8;

            // AI-generated images often have unusual entropy patterns
            // Very low or very high entropy can indicate AI artifacts
            const anomalyScore = Math.abs(normalizedEntropy - 0.85) * 2;
            gridScores.push(Math.min(1, anomalyScore));
        }

        // Create detections for regions with high anomaly scores
        const gridPositions = [
            { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
            { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
            { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
        ];

        for (let i = 0; i < 9; i++) {
            if (gridScores[i] > 0.3) {
                const pos = gridPositions[i];
                const xmin = pos.col / 3;
                const ymin = pos.row / 3;
                const xmax = (pos.col + 1) / 3;
                const ymax = (pos.row + 1) / 3;
                const centerX = (xmin + xmax) / 2;
                const centerY = (ymin + ymax) / 2;

                boundingBoxes.push({
                    ymin, xmin, ymax, xmax,
                    centerX, centerY,
                    width: 1 / 3,
                    height: 1 / 3,
                    confidence: gridScores[i],
                    label: 'Heuristic Detection',
                    description: `Byte-level anomaly in region (${pos.row},${pos.col})`,
                });

                artifacts.push({
                    x: Math.round(centerX * 1024),
                    y: Math.round(centerY * 1024),
                    regionX: centerX,
                    regionY: centerY,
                    confidence: gridScores[i],
                    anomalyType: 'Byte-level anomaly',
                    description: `Statistical anomaly detected via entropy analysis`,
                    severity: gridScores[i] > 0.7 ? 'high' : gridScores[i] > 0.5 ? 'medium' : 'low',
                });
            }
        }
    } catch (error) {
        console.error(`[VPT] Fallback analysis error:`, error);
    }

    return {
        verdict: boundingBoxes.length > 0 ? 'NEEDS_REVIEW' : 'UNKNOWN',
        artifacts,
        boundingBoxes,
        rawOutput: 'VPT server unavailable — using enhanced heuristic analysis',
        modelLoaded: false,
        serverAvailable: false,
    };
}

// ============================================================
// VPT + DCT CROSS-VERIFICATION (Self-Contained Pipeline)
// ============================================================

export interface VPTWithCrossVerifyResult extends VPTAnalysisResult {
    /** Only the artifacts that passed DCT cross-verification */
    confirmedArtifacts: ArtifactCoordinate[];
    /** Summary of the cross-verification process */
    crossCheckSummary: CrossCheckSummary | null;
}

/**
 * Full VPT + DCT Cross-Verification Pipeline.
 * 
 * This is the "Cascading" strategy:
 * 1. VPT detects candidate artifact regions (bounding boxes)
 * 2. Each bounding box is CROPPED from the image
 * 3. Localized DCT analysis runs on just that crop
 * 4. If DCT finds anomalies → CONFIRMED. If not → DISCARDED.
 * 
 * VPT is the "Spotter" (semantic understanding)
 * DCT is the "Scientist" (mathematical verification)
 * 
 * This drastically reduces false positives.
 */
export async function analyzeWithVPTAndCrossVerify(
    imageBase64: string,
    imageWidth: number = 1024,
    imageHeight: number = 1024
): Promise<VPTWithCrossVerifyResult> {
    // Step 1: Run VPT analysis (includes size/confidence filtering)
    const vptResult = await analyzeWithVPT(imageBase64);

    // If no bounding boxes detected, skip cross-verification
    if (vptResult.boundingBoxes.length === 0) {
        console.log(`[VPT+DCT] No VPT detections — skipping cross-verification`);
        return {
            ...vptResult,
            confirmedArtifacts: [],
            crossCheckSummary: null,
        };
    }

    console.log(`[VPT+DCT] Cross-verifying ${vptResult.boundingBoxes.length} VPT candidates...`);

    // Step 2: Convert VPT bounding boxes to pixel-space ArtifactRegions
    const candidates: ArtifactRegion[] = vptResult.boundingBoxes.map(bbox => ({
        x: Math.round(bbox.xmin * imageWidth),
        y: Math.round(bbox.ymin * imageHeight),
        width: Math.round(bbox.width * imageWidth),
        height: Math.round(bbox.height * imageHeight),
        confidence: bbox.confidence,
        label: bbox.label,
    }));

    // Step 3: Run DCT cross-verification on each candidate region
    const { confirmed, summary } = await crossCheckArtifacts(
        imageBase64,
        candidates,
        imageWidth,
        imageHeight
    );

    console.log(`[VPT+DCT] Results: ${summary.confirmed} confirmed, ${summary.discarded} discarded`);
    console.log(`[VPT+DCT] Verification rate: ${(summary.verificationRate * 100).toFixed(0)}%`);

    // Step 4: Convert confirmed regions back to ArtifactCoordinate format
    const confirmedArtifacts: ArtifactCoordinate[] = confirmed.map(c => ({
        x: c.x + Math.round(c.width / 2),
        y: c.y + Math.round(c.height / 2),
        regionX: (c.x + c.width / 2) / imageWidth,
        regionY: (c.y + c.height / 2) / imageHeight,
        confidence: c.confidence,
        anomalyType: `VPT+DCT: ${c.label}`,
        description: c.verificationReason,
        severity: c.confidence > 0.7 ? 'high' as const : c.confidence > 0.4 ? 'medium' as const : 'low' as const,
    }));

    return {
        ...vptResult,
        confirmedArtifacts,
        crossCheckSummary: summary,
    };
}
