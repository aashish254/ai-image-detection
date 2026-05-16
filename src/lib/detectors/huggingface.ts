import { DetectorResult } from '../types';

/**
 * LOCAL AI Image Classifier
 * ==========================
 * Replaces the remote HuggingFace Inference API with a local
 * Organika/sdxl-detector running on the Python backend (port 8100).
 * 
 * Why:
 * - No internet dependency (runs fully offline)
 * - No rate limits or cold starts
 * - Faster inference (no HTTP round-trip to HuggingFace cloud)
 * - Model stays in GPU/CPU memory (loaded once on server start)
 * 
 * Architecture:
 *   Next.js → POST /classify-json → Python FastAPI (port 8100) → Organika Model → Score
 */

// The local classifier runs on the same Python server as VPT
const LOCAL_CLASSIFIER_URL = process.env.VPT_SERVER_URL || 'http://localhost:8100';
const CLASSIFY_TIMEOUT_MS = 30000; // 30 second timeout (allows for remote Colab GPU)

interface LocalClassifierResponse {
    ai_score: number;       // 0-1 probability of AI generation
    confidence: number;     // Model confidence
    label: string;          // Human-readable label (e.g. "artificial", "real")
    all_scores: Record<string, number>;
    model_name: string;
    device: string;
}

/**
 * Detect AI-generated images using the LOCAL Organika/sdxl-detector.
 * Calls the Python server's /classify-json endpoint.
 * Falls back to heuristic analysis if the server is unavailable.
 */
export async function detectWithHuggingFace(
    imageBase64: string
): Promise<DetectorResult> {
    const startTime = Date.now();

    try {
        console.log(`[LocalClassifier] Sending image to local Organika/sdxl-detector...`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CLASSIFY_TIMEOUT_MS);

        const response = await fetch(`${LOCAL_CLASSIFIER_URL}/classify-json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Local classifier returned ${response.status}: ${errorText}`);
        }

        const data: LocalClassifierResponse = await response.json();
        const processingTime = Date.now() - startTime;

        console.log(`✓ Local classifier result: AI=${(data.ai_score * 100).toFixed(1)}%, Label=${data.label}, Device=${data.device} (${processingTime}ms)`);

        return {
            name: 'Local AI Detector (Organika/sdxl-detector)',
            score: data.ai_score,
            confidence: data.confidence,
            status: 'success',
            processingTime,
        };

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`[LocalClassifier] Local classifier unavailable: ${errorMsg}`);
        console.log(`[LocalClassifier] Falling back to heuristic analysis...`);

        // Fall back to heuristic analysis
        return getHeuristicResult(imageBase64, startTime, `local_classifier_error: ${errorMsg}`);
    }
}

/**
 * Heuristic analysis when the local classifier is unavailable.
 * Uses image byte characteristics to estimate AI probability.
 * 
 * NOTE: This is a last-resort fallback. The local classifier should
 * be running for accurate results.
 */
function getHeuristicResult(
    imageBase64: string,
    startTime: number,
    reason: string
): DetectorResult {
    const processingTime = Date.now() - startTime;

    // Analyze base64 image characteristics
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageSize = base64Data.length;

    let aiIndicators = 0;
    let realIndicators = 0;

    // Image size analysis (AI images often have consistent compression)
    if (imageSize > 100000 && imageSize < 500000) {
        aiIndicators += 0.1;
    } else if (imageSize > 1000000) {
        realIndicators += 0.15;
    }

    // Check for common base64 patterns
    const patternDiversity = new Set(base64Data.slice(0, 1000).split('')).size;
    if (patternDiversity < 50) {
        aiIndicators += 0.1;
    } else if (patternDiversity > 60) {
        realIndicators += 0.1;
    }

    // Entropy analysis on byte samples
    const sampleBytes = Buffer.from(base64Data.slice(0, 4096), 'base64');
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < sampleBytes.length; i++) {
        histogram[sampleBytes[i]]++;
    }
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
        if (histogram[i] > 0) {
            const p = histogram[i] / sampleBytes.length;
            entropy -= p * Math.log2(p);
        }
    }
    const normalizedEntropy = entropy / 8;
    // Very low entropy can indicate AI smoothing
    if (normalizedEntropy < 0.75) {
        aiIndicators += 0.15;
    }

    // Calculate final score - bias toward uncertain range
    const baseScore = 0.5 + (aiIndicators - realIndicators);
    const score = Math.max(0.3, Math.min(0.7, baseScore));

    return {
        name: 'Local AI Detector (Organika/sdxl-detector)',
        score,
        confidence: 0.3, // Low confidence when using heuristics
        status: 'fallback',
        error: `Heuristic analysis - ${reason}`,
        processingTime,
    };
}
