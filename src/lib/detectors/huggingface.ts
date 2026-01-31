import { DetectorResult } from '../types';

// AI Detection models - specifically designed for AI image detection
const HUGGINGFACE_MODELS = [
    'umm-maybe/AI-image-detector',              // Primary AI detector
    'Organika/sdxl-detector',                   // SDXL detector
    'saltacc/ai-image-detector',                // Alternative AI detector
];

const getModelUrl = (model: string) => `https://api-inference.huggingface.co/models/${model}`;

interface HuggingFaceResponse {
    label: string;
    score: number;
}

/**
 * Detect AI-generated images using HuggingFace's AI image detection models
 * Tries multiple specialized AI detection models
 */
export async function detectWithHuggingFace(
    imageBase64: string
): Promise<DetectorResult> {
    const startTime = Date.now();
    const apiToken = process.env.HUGGINGFACE_API_TOKEN;

    if (!apiToken || apiToken === 'your_huggingface_token_here') {
        return getHeuristicResult(imageBase64, startTime, 'demo_mode');
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Try each model until one works
    let lastError = '';
    for (const model of HUGGINGFACE_MODELS) {
        try {
            console.log(`Trying HuggingFace AI detector: ${model}`);

            const response = await fetch(getModelUrl(model), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/octet-stream',
                },
                body: imageBuffer,
            });

            if (!response.ok) {
                // Check if model is loading
                if (response.status === 503) {
                    const errorData = await response.json();
                    if (errorData.estimated_time && errorData.estimated_time < 30) {
                        console.log(`Model ${model} loading, waiting ${errorData.estimated_time}s...`);
                        await new Promise(resolve => setTimeout(resolve, Math.min(errorData.estimated_time * 1000, 20000)));

                        const retryResponse = await fetch(getModelUrl(model), {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${apiToken}`,
                                'Content-Type': 'application/octet-stream',
                            },
                            body: imageBuffer,
                        });

                        if (retryResponse.ok) {
                            const results = await retryResponse.json();
                            console.log(`✓ AI detector ${model} succeeded after loading`);
                            return processAIDetectorResults(results, startTime, model);
                        }
                    }
                }

                lastError = `${response.status}`;
                console.warn(`AI detector ${model} returned ${response.status}, trying next...`);
                continue;
            }

            const results: HuggingFaceResponse[] = await response.json();
            console.log(`✓ AI detector ${model} succeeded`);
            return processAIDetectorResults(results, startTime, model);

        } catch (error) {
            lastError = error instanceof Error ? error.message : 'Unknown error';
            console.warn(`AI detector ${model} error: ${lastError}`);
            continue;
        }
    }

    // All models failed, use heuristic fallback
    console.warn('All AI detectors failed, using heuristic analysis');
    return getHeuristicResult(imageBase64, startTime, `fallback: ${lastError}`);
}

/**
 * Process AI detection results from specialized models
 */
function processAIDetectorResults(
    results: HuggingFaceResponse[],
    startTime: number,
    modelUsed: string
): DetectorResult {
    const processingTime = Date.now() - startTime;

    // Find AI-related labels
    let aiScore = 0.5; // Default neutral score

    for (const result of results) {
        const label = result.label.toLowerCase();

        // Check for explicit AI labels
        if (label.includes('ai') || label.includes('artificial') || label.includes('generated') ||
            label.includes('fake') || label.includes('synthetic') || label === 'ai_generated' ||
            label === 'sdxl' || label === 'midjourney' || label === 'stable diffusion' ||
            label === 'dall-e' || label === 'dalle') {
            aiScore = result.score;
            break;
        }

        // Check for real/human labels
        if (label.includes('real') || label.includes('human') || label.includes('authentic') ||
            label.includes('natural') || label === 'real_image' || label === 'photograph') {
            aiScore = 1 - result.score;
            break;
        }
    }

    // If no explicit labels found, estimate from confidence patterns
    if (aiScore === 0.5 && results.length > 0) {
        const topConfidence = results[0].score;
        // High confidence in any label often indicates processing artifacts in AI images
        if (topConfidence > 0.95) {
            aiScore = 0.3; // Likely real - very high confidence on specific object
        } else if (topConfidence < 0.4) {
            aiScore = 0.6; // Possibly AI - classifier is confused
        }
    }

    return {
        name: 'HuggingFace AI Detector',
        score: aiScore,
        confidence: Math.abs(aiScore - 0.5) * 2, // How confident (0.5 = uncertain, 0 or 1 = certain)
        status: 'success',
        processingTime,
    };
}

/**
 * Heuristic analysis when API is unavailable
 * Uses image characteristics to estimate AI probability
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

    // Heuristic factors (these are rough estimates, not reliable detection)
    let aiIndicators = 0;
    let realIndicators = 0;

    // Image size analysis (AI images often have consistent compression)
    if (imageSize > 100000 && imageSize < 500000) {
        // Common range for AI-generated images
        aiIndicators += 0.1;
    } else if (imageSize > 1000000) {
        // Very large images are often real photographs
        realIndicators += 0.15;
    }

    // Check for common base64 patterns
    const patternDiversity = new Set(base64Data.slice(0, 1000).split('')).size;
    if (patternDiversity < 50) {
        // Low diversity might indicate synthetic patterns
        aiIndicators += 0.1;
    } else if (patternDiversity > 60) {
        realIndicators += 0.1;
    }

    // Calculate final score - bias toward uncertain (0.4-0.6) when using heuristics
    const baseScore = 0.5 + (aiIndicators - realIndicators);
    const score = Math.max(0.3, Math.min(0.7, baseScore)); // Clamp to avoid extreme scores

    return {
        name: 'HuggingFace AI Detector',
        score,
        confidence: 0.3, // Low confidence when using heuristics
        status: 'fallback',
        error: `Heuristic analysis - ${reason}`,
        processingTime,
    };
}
