/**
 * Vision-Language Model Detector (Google Gemini)
 * ================================================
 * Sends the image to Google Gemini Vision API for deep analysis.
 * 
 * This detector asks Gemini to:
 * 1. Determine if the image is AI-generated or real
 * 2. Look for SynthID / Google watermark traces
 * 3. Identify platform-specific AI generation patterns
 * 4. Provide region-by-region analysis with anomaly descriptions
 * 5. Detect artifacts like lighting inconsistencies, texture issues, etc.
 * 
 * Features:
 * - Automatic model fallback: gemini-3-flash-preview → gemini-3.1-flash-lite → gemini-2.5-flash
 * - Retry with exponential backoff for transient rate limits
 * - Graceful degradation when all models are quota-exhausted
 * 
 * Authors: Rahul Yadav, Aashish Kumar Mahato, Bibek Gami
 */

import { VisionLLMResult, RegionAnalysis, ArtifactDescription } from '../types';

export interface ExtendedVisionLLMResult extends VisionLLMResult {
    regionAnalysis: RegionAnalysis;
    internalConfidence: number;
    platformDetection?: {
        detectedPlatform: string | null;
        synthIdTrace: boolean;
        c2paTrace: boolean;
        sdWatermark: boolean;
        metaSignature: boolean;
        platformConfidence: number;
        platformEvidence: string[];
    };
}

// Gemini API configuration
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY ?? '';
// gemini-2.5-flash is retired for keys issued after it was withdrawn, but stays last
// so a pre-existing key still resolves when the current names are quota-exhausted.
const GEMINI_MODELS = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 2000;

function getGeminiApiUrl(model: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

/**
 * The detailed prompt that asks Gemini to analyze the image for AI traces.
 */
const ANALYSIS_PROMPT = `You are an expert forensic image analyst specializing in detecting AI-generated images. Your job is to determine whether an image is AI-generated or a real photograph. Be thorough and balanced — do NOT bias toward either "real" or "AI".

Analyze this image carefully and provide your assessment in the following EXACT JSON format (no markdown, no code fences, just raw JSON):

{
  "isAIGenerated": true/false,
  "aiProbability": 0.0 to 1.0,
  "internalConfidence": 0.0 to 1.0,
  "overallAssessment": "Detailed text assessment explaining your reasoning",
  "confidenceExplanation": "Why you are confident or uncertain",
  
  "platformDetection": {
    "detectedPlatform": "Google Gemini/Imagen" or "Stable Diffusion" or "DALL-E" or "Midjourney" or "Adobe Firefly" or "Meta AI" or "Flux" or null,
    "synthIdTrace": true/false,
    "c2paTrace": true/false, 
    "sdWatermark": true/false,
    "metaSignature": true/false,
    "platformConfidence": 0.0 to 1.0,
    "platformEvidence": ["list of specific evidence found"]
  },
  
  "artifactsDetected": [
    {
      "type": "lighting_inconsistency" | "anatomical_anomaly" | "texture_irregularity" | "reflection_error" | "shadow_inconsistency" | "semantic_error" | "edge_artifact" | "frequency_pattern",
      "description": "What you found",
      "confidence": 0.0 to 1.0,
      "region": "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right"
    }
  ],
  
  "semanticIssues": ["Any logical/physical impossibilities"],
  
  "regionAnalysis": {
    "topLeft": { "aiScore": 0.0 to 1.0, "anomalies": ["list of anomalies in this region"] },
    "topRight": { "aiScore": 0.0 to 1.0, "anomalies": ["list of anomalies"] },
    "center": { "aiScore": 0.0 to 1.0, "anomalies": ["list of anomalies"] },
    "bottomLeft": { "aiScore": 0.0 to 1.0, "anomalies": ["list of anomalies"] },
    "bottomRight": { "aiScore": 0.0 to 1.0, "anomalies": ["list of anomalies"] }
  }
}

IMPORTANT analysis instructions:
1. CRITICAL: SynthID watermarks are INVISIBLE to visual inspection. You CANNOT detect SynthID by looking at the image. Only set "synthIdTrace" to true if you have ABSOLUTE CERTAINTY from metadata evidence. Do NOT guess.
2. RULE: If synthIdTrace is true, detectedPlatform MUST be "Google Gemini/Imagen" — no exceptions.
3. For platformDetection — only claim a specific platform if you see strong visual evidence of that platform's specific artifacts.
4. THOROUGHLY check for these modern AI generation artifacts (they are often subtle):
   a. SKIN AND FACES: Unnaturally smooth/perfect skin with no visible pores, blemishes, or natural texture. AI faces often look "too perfect" or have a plastic/rendered quality. Check for inconsistent facial features across multiple people in group photos.
   b. HANDS AND FINGERS: Wrong number of fingers, merged fingers, impossible hand poses, inconsistent finger lengths, extra or missing joints.
   c. TEXT AND WRITING: Garbled, misspelled, or nonsensical text in signs, labels, clothing, or any text visible in the image.
   d. BACKGROUNDS: Unnaturally clean, blurred, or repeating patterns. AI often generates backgrounds that look "too perfect" or have melting/morphing elements.
   e. LIGHTING: Physically impossible lighting — shadows going different directions, light sources that don't match reflections, uniform studio-like lighting in outdoor scenes.
   f. EDGES AND BOUNDARIES: Soft, blurred, or glowing edges around objects, especially where foreground meets background. Hair edges are often a giveaway.
   g. SYMMETRY AND UNIFORMITY: AI images often have unnatural symmetry in faces, buildings, or clothing. Group photos may have people wearing suspiciously similar expressions.
   h. TEXTURE REPETITION: Repeated patterns in fabrics, foliage, bricks, or other detailed surfaces.
   i. REFLECTIONS: Missing, incorrect, or physically impossible reflections in glass, water, eyes, or shiny surfaces.
   j. OVERALL "AI FEEL": An uncanny perfection — the image looks too clean, too well-composed, too evenly lit, like a high-quality stock photo or 3D render rather than a natural photograph.
5. For EACH region (topLeft, topRight, center, bottomLeft, bottomRight), give an independent AI probability score based on what you observe IN THAT specific region.
6. Real photographs typically have: natural sensor noise, slight imperfections, realistic JPEG compression artifacts, natural variations in skin texture, genuine depth of field blur, and slightly imperfect composition.
7. Be very specific about WHERE you found anomalies — give coordinates/regions.
8. Each region's aiScore should reflect what you actually see in that part of the image, not just the overall score repeated.
9. Be balanced and honest. If the image looks suspiciously perfect or "too good to be true", reflect that in a HIGHER aiProbability. If it has genuine camera artifacts and natural imperfections, score it LOW.
10. For group photos: carefully check if all faces look realistic and distinct, if clothing folds naturally, if the spatial arrangement of people makes physical sense, and if background architecture/text is coherent.

Return ONLY the JSON, no other text.`;

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Try calling Gemini API with a specific model, with retry logic
 */
async function callGeminiWithRetry(
    model: string,
    requestBody: object,
    retries: number = MAX_RETRIES
): Promise<{ ok: true; data: any } | { ok: false; status: number; error: string }> {
    const apiUrl = getGeminiApiUrl(model);

    for (let attempt = 0; attempt <= retries; attempt++) {
        if (attempt > 0) {
            const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            console.log(`[VisionLLM] Retry ${attempt}/${retries} for ${model} after ${delay}ms...`);
            await sleep(delay);
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY,
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                return { ok: true, data };
            }

            const errorText = await response.text();

            // If it's a quota/rate limit error (429), check if we should retry or try next model
            if (response.status === 429) {
                // Check if it's a daily quota exhaustion (limit: 0) — no point retrying
                if (errorText.includes('"limit": 0') || errorText.includes('limit: 0')) {
                    console.warn(`[VisionLLM] Daily quota exhausted for ${model}, trying next model...`);
                    return { ok: false, status: 429, error: `Daily quota exhausted for ${model}` };
                }

                // Per-minute rate limit — worth retrying
                if (attempt < retries) {
                    console.warn(`[VisionLLM] Rate limited on ${model}, will retry...`);
                    continue;
                }
            }

            // Other errors — don't retry
            return { ok: false, status: response.status, error: errorText };
        } catch (fetchError) {
            const msg = fetchError instanceof Error ? fetchError.message : 'Network error';
            if (attempt < retries) {
                console.warn(`[VisionLLM] Fetch error for ${model}: ${msg}, will retry...`);
                continue;
            }
            return { ok: false, status: 0, error: msg };
        }
    }

    return { ok: false, status: 0, error: 'Max retries exceeded' };
}

/**
 * Analyze an image using Google Gemini Vision API.
 * Tries multiple models with retry logic and automatic fallback.
 */
export async function analyzeWithVisionLLM(
    imageBase64: string
): Promise<ExtendedVisionLLMResult> {
    const startTime = Date.now();

    if (!GEMINI_API_KEY) {
        console.error('[VisionLLM] GOOGLE_GEMINI_API_KEY not set');
        return createFallbackResult(startTime, 'API key not configured');
    }

    try {
        // Extract the base64 data and mime type
        const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const requestBody = {
            contents: [{
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    },
                    {
                        text: ANALYSIS_PROMPT
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 6144,
                topP: 0.85,
            }
        };

        // Try each model in order until one works
        let lastError = '';
        for (const model of GEMINI_MODELS) {
            console.log(`[VisionLLM] Trying model: ${model}...`);

            const result = await callGeminiWithRetry(model, requestBody);

            if (result.ok) {
                console.log(`[VisionLLM] ✓ Success with model: ${model}`);
                return processGeminiResponse(result.data, startTime);
            }

            lastError = result.error;
            console.warn(`[VisionLLM] ✗ ${model} failed: ${lastError}`);
        }

        // All models failed
        console.error(`[VisionLLM] All models exhausted. Last error: ${lastError}`);
        return createFallbackResult(startTime, `All Gemini models failed: ${lastError}`);

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[VisionLLM] Error:', errorMsg);
        return createFallbackResult(startTime, errorMsg);
    }
}

/**
 * Process a successful Gemini API response into our result format
 */
function processGeminiResponse(data: any, startTime: number): ExtendedVisionLLMResult {
    // Extract text content from Gemini response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
        return createFallbackResult(startTime, 'No text content in Gemini response');
    }

    console.log(`[VisionLLM] Raw Gemini response length: ${textContent.length} chars`);

    // Parse the JSON response
    const parsedResult = parseGeminiResponse(textContent);
    const processingTime = Date.now() - startTime;

    console.log(`[VisionLLM] Parsed - AI: ${(parsedResult.aiProbability * 100).toFixed(1)}%, Platform: ${parsedResult.platformDetection?.detectedPlatform || 'None'}`);

    // Build region analysis from actual Gemini response
    const regionAnalysis: RegionAnalysis = parsedResult.regionAnalysis || {
        topLeft: { aiScore: parsedResult.aiProbability, anomalies: [] },
        topRight: { aiScore: parsedResult.aiProbability, anomalies: [] },
        bottomLeft: { aiScore: parsedResult.aiProbability, anomalies: [] },
        bottomRight: { aiScore: parsedResult.aiProbability, anomalies: [] },
        center: { aiScore: parsedResult.aiProbability, anomalies: [] },
    };

    // Log per-region scores
    console.log(`[VisionLLM] Region scores: TL=${regionAnalysis.topLeft.aiScore.toFixed(2)}, TR=${regionAnalysis.topRight.aiScore.toFixed(2)}, C=${regionAnalysis.center.aiScore.toFixed(2)}, BL=${regionAnalysis.bottomLeft.aiScore.toFixed(2)}, BR=${regionAnalysis.bottomRight.aiScore.toFixed(2)}`);

    return {
        name: 'Gemini Vision Analysis',
        score: parsedResult.aiProbability,
        confidence: parsedResult.internalConfidence,
        internalConfidence: parsedResult.internalConfidence,
        status: 'success',
        processingTime,
        analysis: {
            overallAssessment: parsedResult.overallAssessment,
            artifactsDetected: parsedResult.artifactsDetected || [],
            semanticIssues: parsedResult.semanticIssues || [],
            confidenceExplanation: parsedResult.confidenceExplanation,
        },
        regionAnalysis,
        platformDetection: parsedResult.platformDetection ? {
            detectedPlatform: parsedResult.platformDetection.detectedPlatform || null,
            synthIdTrace: parsedResult.platformDetection.synthIdTrace || false,
            c2paTrace: parsedResult.platformDetection.c2paTrace || false,
            sdWatermark: parsedResult.platformDetection.sdWatermark || false,
            metaSignature: parsedResult.platformDetection.metaSignature || false,
            platformConfidence: parsedResult.platformDetection.platformConfidence || 0,
            platformEvidence: parsedResult.platformDetection.platformEvidence || [],
        } : undefined,
    };
}

/**
 * Parse Gemini's JSON response, handling various response formats
 */
function parseGeminiResponse(text: string): any {
    // Try to extract JSON from the response
    let jsonStr = text.trim();

    // Remove markdown code fences if present
    jsonStr = jsonStr.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
    jsonStr = jsonStr.trim();

    try {
        const parsed = JSON.parse(jsonStr);
        return {
            aiProbability: clamp(parsed.aiProbability ?? 0.5, 0, 1),
            internalConfidence: clamp(parsed.internalConfidence ?? 0.5, 0, 1),
            overallAssessment: parsed.overallAssessment || 'Analysis completed',
            confidenceExplanation: parsed.confidenceExplanation || '',
            artifactsDetected: (parsed.artifactsDetected || []).map((a: any) => ({
                type: a.type || 'other',
                description: a.description || '',
                confidence: clamp(a.confidence ?? 0.5, 0, 1),
                region: a.region || 'center',
            })),
            semanticIssues: parsed.semanticIssues || [],
            regionAnalysis: parsed.regionAnalysis ? {
                topLeft: {
                    aiScore: clamp(parsed.regionAnalysis.topLeft?.aiScore ?? 0.5, 0, 1),
                    anomalies: parsed.regionAnalysis.topLeft?.anomalies || [],
                },
                topRight: {
                    aiScore: clamp(parsed.regionAnalysis.topRight?.aiScore ?? 0.5, 0, 1),
                    anomalies: parsed.regionAnalysis.topRight?.anomalies || [],
                },
                center: {
                    aiScore: clamp(parsed.regionAnalysis.center?.aiScore ?? 0.5, 0, 1),
                    anomalies: parsed.regionAnalysis.center?.anomalies || [],
                },
                bottomLeft: {
                    aiScore: clamp(parsed.regionAnalysis.bottomLeft?.aiScore ?? 0.5, 0, 1),
                    anomalies: parsed.regionAnalysis.bottomLeft?.anomalies || [],
                },
                bottomRight: {
                    aiScore: clamp(parsed.regionAnalysis.bottomRight?.aiScore ?? 0.5, 0, 1),
                    anomalies: parsed.regionAnalysis.bottomRight?.anomalies || [],
                },
            } : null,
            platformDetection: parsed.platformDetection || null,
        };
    } catch (e) {
        console.error('[VisionLLM] Failed to parse JSON, attempting fallback extraction');

        // Fallback: try to extract key values using regex
        const aiProbMatch = text.match(/"aiProbability"\s*:\s*([\d.]+)/);
        const confMatch = text.match(/"internalConfidence"\s*:\s*([\d.]+)/);
        const assessMatch = text.match(/"overallAssessment"\s*:\s*"([^"]+)"/);
        const platformMatch = text.match(/"detectedPlatform"\s*:\s*"([^"]+)"/);
        const synthIdMatch = text.match(/"synthIdTrace"\s*:\s*(true|false)/i);

        const aiProb = aiProbMatch ? parseFloat(aiProbMatch[1]) : 0.5;

        return {
            aiProbability: clamp(aiProb, 0, 1),
            internalConfidence: confMatch ? clamp(parseFloat(confMatch[1]), 0, 1) : 0.5,
            overallAssessment: assessMatch ? assessMatch[1] : 'Partial analysis completed',
            confidenceExplanation: 'Response parsing was partial',
            artifactsDetected: [],
            semanticIssues: [],
            regionAnalysis: null,
            platformDetection: platformMatch ? {
                detectedPlatform: platformMatch[1],
                synthIdTrace: synthIdMatch ? synthIdMatch[1].toLowerCase() === 'true' : false,
                c2paTrace: false,
                sdWatermark: false,
                metaSignature: false,
                platformConfidence: aiProb * 0.8,
                platformEvidence: [],
            } : null,
        };
    }
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Create a fallback result when the API is unavailable
 */
function createFallbackResult(startTime: number, error: string): ExtendedVisionLLMResult {
    return {
        name: 'Gemini Vision Analysis',
        score: 0.5,
        confidence: 0,
        internalConfidence: 0,
        status: 'error',
        error,
        processingTime: Date.now() - startTime,
        analysis: {
            overallAssessment: 'Analysis failed - Gemini API unavailable',
            artifactsDetected: [],
            semanticIssues: [],
            confidenceExplanation: `Error: ${error}`,
        },
        regionAnalysis: {
            topLeft: { aiScore: 0.5, anomalies: [] },
            topRight: { aiScore: 0.5, anomalies: [] },
            bottomLeft: { aiScore: 0.5, anomalies: [] },
            bottomRight: { aiScore: 0.5, anomalies: [] },
            center: { aiScore: 0.5, anomalies: [] },
        },
    };
}
