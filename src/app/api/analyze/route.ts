import { NextRequest, NextResponse } from 'next/server';
import { detectWithHuggingFace } from '@/lib/detectors/huggingface';
import { analyzeWithVisionLLM } from '@/lib/detectors/vision-llm';
import { analyzeDCT } from '@/lib/detectors/dct-analysis';
import { fuseResults } from '@/lib/fusion';
import { getCachedResult, cacheResult } from '@/lib/cache';
import { generateImageHash } from '@/lib/utils';
import { AnalyzeRequest, AnalyzeResponse } from '@/lib/types';
// NOVEL CONTRIBUTIONS
import { analyzeWithFSFN } from '@/lib/frequency-spatial-fusion';
import { generateXAIExplanation } from '@/lib/explainable-ai';
import { calculateEnsembleUncertainty } from '@/lib/uncertainty';
import { identifyGANGenerator } from '@/lib/gan-fingerprint';

export const maxDuration = 60; // 60 second timeout for API route

/**
 * POST /api/analyze
 * Main endpoint for image analysis with three novel contributions:
 * 1. Disagreement-Aware Confidence Calibration (DACC)
 * 2. Spatial Artifact Mapping (SAM)
 * 3. Dynamic Reliability-Weighted Fusion (DRWF)
 */
export async function POST(request: NextRequest) {
    try {
        const body: AnalyzeRequest = await request.json();

        if (!body.image) {
            return NextResponse.json<AnalyzeResponse>({
                success: false,
                error: 'No image provided',
            }, { status: 400 });
        }

        // Validate image format
        if (!body.image.startsWith('data:image/')) {
            return NextResponse.json<AnalyzeResponse>({
                success: false,
                error: 'Invalid image format. Please provide a base64-encoded image with data URL prefix.',
            }, { status: 400 });
        }

        // Generate image hash for caching
        const imageHash = generateImageHash(body.image);

        // Check cache unless explicitly skipped
        if (!body.options?.skipCache) {
            const cachedResult = await getCachedResult(imageHash);
            if (cachedResult) {
                return NextResponse.json<AnalyzeResponse>({
                    success: true,
                    result: { ...cachedResult, cached: true },
                });
            }
        }

        console.log(`[Analysis] Starting analysis for image hash: ${imageHash.substring(0, 8)}...`);
        const startTime = Date.now();

        // Run all detectors in parallel for speed
        const [huggingfaceResult, visionLLMResult, dctResult] = await Promise.all([
            detectWithHuggingFace(body.image).catch(error => {
                console.error('[HuggingFace Error]:', error);
                return {
                    name: 'HuggingFace AI Detector',
                    score: 0.5,
                    confidence: 0,
                    status: 'error' as const,
                    error: error.message,
                    processingTime: 0,
                };
            }),
            analyzeWithVisionLLM(body.image).catch(error => {
                console.error('[Vision LLM Error]:', error);
                return {
                    name: 'Gemini Vision Analysis',
                    score: 0.5,
                    confidence: 0,
                    internalConfidence: 0,
                    status: 'error' as const,
                    error: error.message,
                    processingTime: 0,
                    analysis: {
                        overallAssessment: 'Analysis failed',
                        artifactsDetected: [],
                        semanticIssues: [],
                        confidenceExplanation: 'Error during analysis',
                    },
                    regionAnalysis: {
                        topLeft: { aiScore: 0.5, anomalies: [] },
                        topRight: { aiScore: 0.5, anomalies: [] },
                        bottomLeft: { aiScore: 0.5, anomalies: [] },
                        bottomRight: { aiScore: 0.5, anomalies: [] },
                        center: { aiScore: 0.5, anomalies: [] },
                    },
                };
            }),
            analyzeDCT(body.image).catch(error => {
                console.error('[DCT Error]:', error);
                return {
                    name: 'DCT Frequency Analysis',
                    score: 0.5,
                    confidence: 0,
                    status: 'error' as const,
                    error: error.message,
                    processingTime: 0,
                    frequencyAnalysis: {
                        highFrequencyRatio: 0,
                        spectralAnomalies: 0,
                        blockingArtifacts: 0,
                        compressionPatterns: 'Analysis failed',
                    },
                };
            }),
        ]);

        const totalProcessingTime = Date.now() - startTime;
        console.log(`[Analysis] All detectors completed in ${totalProcessingTime}ms`);

        // Fuse results using novel algorithms
        const result = fuseResults(huggingfaceResult, visionLLMResult, dctResult, false);

        // ============================================
        // NOVEL CONTRIBUTIONS - Additional Analysis
        // ============================================

        // NOVEL #1: Frequency-Spatial Fusion Network
        console.log(`[NOVEL] Running Frequency-Spatial Fusion Network...`);
        const fsfnResult = await analyzeWithFSFN(body.image);
        console.log(`[NOVEL] FSFN completed - Fusion Score: ${(fsfnResult.fusionScore * 100).toFixed(1)}%`);

        // NOVEL #2: Explainable AI
        console.log(`[NOVEL] Generating XAI explanations...`);
        const xaiResult = await generateXAIExplanation(body.image, result.confidence, [
            { name: 'HuggingFace', score: huggingfaceResult.score },
            { name: 'Gemini', score: visionLLMResult.score },
            { name: 'DCT', score: dctResult.score },
        ]);
        console.log(`[NOVEL] XAI completed - ${xaiResult.regions.length} regions identified`);

        // NOVEL #3: Uncertainty Quantification
        console.log(`[NOVEL] Calculating uncertainty...`);
        const uncertaintyResult = calculateEnsembleUncertainty([
            { name: 'HuggingFace', score: huggingfaceResult.score, weight: result.fusion.huggingfaceWeight },
            { name: 'Gemini', score: visionLLMResult.score, weight: result.fusion.visionLLMWeight },
            { name: 'DCT', score: dctResult.score, weight: result.fusion.dctWeight },
            { name: 'FSFN', score: fsfnResult.fusionScore, weight: 0.25 },
        ]);
        console.log(`[NOVEL] Uncertainty: ${(uncertaintyResult.prediction * 100).toFixed(1)}% ± ${(uncertaintyResult.standardDeviation * 100).toFixed(1)}%`);

        // NOVEL #4: GAN Fingerprint Identification
        console.log(`[NOVEL] Identifying GAN fingerprint...`);
        const ganResult = await identifyGANGenerator(body.image);
        if (ganResult.identifiedGenerator) {
            console.log(`[NOVEL] GAN identified as: ${ganResult.identifiedGenerator.name} (${(ganResult.identifiedGenerator.confidence * 100).toFixed(1)}% confidence)`);
        } else {
            console.log(`[NOVEL] Image appears to be a real photograph`);
        }

        // ================================================
        // NOVEL CONTRIBUTIONS: Recalculate Final Verdict
        // ================================================
        // The base fusion may not capture all AI indicators.
        // Use novel contributions to improve accuracy.

        let enhancedConfidence = result.confidence;
        let enhancedVerdict = result.verdict;

        // Factor 1: FSFN Analysis (Frequency + Spatial)
        const fsfnAIScore = fsfnResult.fusionScore;

        // Factor 2: GAN Fingerprint Analysis
        const ganAIScore = ganResult.isAIGenerated ? ganResult.aiConfidence : 0;

        // Factor 3: Uncertainty Analysis Prediction
        const uncertaintyPrediction = uncertaintyResult.prediction;

        // Combined scoring using weighted ensemble of all sources
        // Base detectors: 50%, Novel contributions: 50%
        const baseScore = result.confidence;
        const novelScore = (fsfnAIScore * 0.3 + ganAIScore * 0.4 + uncertaintyPrediction * 0.3);

        // Weighted combination
        enhancedConfidence = baseScore * 0.4 + novelScore * 0.6;

        // Strong AI indicators from novel contributions should increase confidence
        if (ganResult.isAIGenerated && ganResult.aiConfidence > 0.7) {
            enhancedConfidence = Math.max(enhancedConfidence, ganResult.aiConfidence);
            console.log(`[NOVEL] GAN Fingerprint strongly indicates AI generation`);
        }

        if (fsfnResult.fusionScore > 0.6) {
            enhancedConfidence = Math.max(enhancedConfidence, fsfnResult.fusionScore * 0.9);
            console.log(`[NOVEL] FSFN fusion score indicates AI artifacts`);
        }

        // Determine verdict based on enhanced confidence
        if (enhancedConfidence >= 0.65) {
            enhancedVerdict = 'AI_GENERATED';
        } else if (enhancedConfidence >= 0.35) {
            enhancedVerdict = 'LIKELY_AI';
        } else if (enhancedConfidence <= 0.15) {
            enhancedVerdict = 'REAL';
        } else {
            enhancedVerdict = 'UNCERTAIN';
        }

        console.log(`[ANALYSIS] Base confidence: ${(baseScore * 100).toFixed(1)}%, Novel score: ${(novelScore * 100).toFixed(1)}%, Enhanced: ${(enhancedConfidence * 100).toFixed(1)}%`);
        console.log(`[ANALYSIS] Verdict changed from ${result.verdict} to ${enhancedVerdict}`);

        // Extend result with novel contribution data and enhanced verdict
        const extendedResult = {
            ...result,
            // Override verdict and confidence with enhanced values
            confidence: enhancedConfidence,
            verdict: enhancedVerdict,
            explanation: ganResult.isAIGenerated
                ? `${result.explanation} Novel analysis: Image shows characteristics of ${ganResult.identifiedGenerator?.name || 'AI'} generation with ${(ganResult.aiConfidence * 100).toFixed(0)}% confidence.`
                : result.explanation,
            // NOVEL: Frequency-Spatial Fusion
            fsfnAnalysis: {
                frequencyDomain: {
                    lowFrequencyAnomaly: fsfnResult.frequencyAnalysis.lowFrequency.anomalyScore,
                    midFrequencyAnomaly: fsfnResult.frequencyAnalysis.midFrequency.anomalyScore,
                    highFrequencyAnomaly: fsfnResult.frequencyAnalysis.highFrequency.anomalyScore,
                    spectralFingerprint: fsfnResult.frequencyAnalysis.spectralFingerprint,
                    frequencyScore: fsfnResult.frequencyAnalysis.frequencyScore,
                },
                spatialDomain: {
                    edgeAnomaly: fsfnResult.spatialAnalysis.edges.anomalyScore,
                    textureAnomaly: fsfnResult.spatialAnalysis.texture.anomalyScore,
                    colorAnomaly: fsfnResult.spatialAnalysis.color.anomalyScore,
                    spatialScore: fsfnResult.spatialAnalysis.spatialScore,
                },
                fusion: {
                    fusionScore: fsfnResult.fusionScore,
                    fusionConfidence: fsfnResult.fusionConfidence,
                    domainAgreement: fsfnResult.domainAgreement,
                    attentionWeights: {
                        frequencyWeight: fsfnResult.attentionWeights.spatialToFrequency,
                        spatialWeight: fsfnResult.attentionWeights.frequencyToSpatial,
                    },
                },
                explanation: fsfnResult.explanation,
            },
            // NOVEL: Explainable AI
            xaiAnalysis: {
                summary: xaiResult.summary,
                attentionMap: xaiResult.attentionMap,
                regions: xaiResult.regions.map(r => ({
                    id: r.id,
                    x: r.x,
                    y: r.y,
                    width: r.width,
                    height: r.height,
                    importance: r.importance,
                    category: r.category,
                    finding: r.finding,
                    confidence: r.confidence,
                })),
                keyFactors: xaiResult.keyFactors,
                explanationConfidence: xaiResult.explanationConfidence,
            },
            // NOVEL: Uncertainty Quantification
            uncertaintyAnalysis: {
                prediction: uncertaintyResult.prediction,
                confidenceInterval: uncertaintyResult.confidenceInterval,
                standardDeviation: uncertaintyResult.standardDeviation,
                uncertaintyDecomposition: uncertaintyResult.uncertaintyDecomposition,
                reliability: {
                    score: uncertaintyResult.reliability.score,
                    level: uncertaintyResult.reliability.level,
                    humanReviewRecommended: uncertaintyResult.reliability.humanReviewRecommended,
                    reason: uncertaintyResult.reliability.reason,
                },
                recommendation: uncertaintyResult.recommendation,
            },
            // NOVEL #4: GAN Fingerprint Identification
            ganIdentification: {
                isAIGenerated: ganResult.isAIGenerated,
                aiConfidence: ganResult.aiConfidence,
                identifiedGenerator: ganResult.identifiedGenerator,
                allMatches: ganResult.allMatches.map((m: { name: string; confidence: number; matchingFeatures: string[] }) => ({
                    name: m.name,
                    confidence: m.confidence,
                    matchingFeatures: m.matchingFeatures,
                })),
                extractedFingerprint: {
                    spectralSignature: ganResult.extractedFingerprint.spectralSignature,
                    colorProfile: {
                        saturationMean: ganResult.extractedFingerprint.colorProfile.saturationMean,
                        saturationVariance: ganResult.extractedFingerprint.colorProfile.saturationVariance,
                        hueDominant: ganResult.extractedFingerprint.colorProfile.hueDominant,
                        colorTemperature: ganResult.extractedFingerprint.colorProfile.colorTemperature,
                    },
                    textureProfile: ganResult.extractedFingerprint.textureProfile,
                },
                analysis: ganResult.analysis,
            },
        };

        // Cache the result
        await cacheResult(imageHash, extendedResult);

        console.log(`[Analysis] Completed with verdict: ${result.verdict}, calibrated confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`[Analysis] Trust Score: ${(result.calibration.trustScore * 100).toFixed(0)}%, Disagreement: ${result.calibration.disagreementType}`);
        console.log(`[NOVEL] Reliability: ${uncertaintyResult.reliability.level}, Human Review: ${uncertaintyResult.reliability.humanReviewRecommended ? 'Recommended' : 'Not needed'}`);

        if (result.spatialAnalysis.isLikelyComposite) {
            console.log(`[Analysis] WARNING: Image detected as likely COMPOSITE`);
        }

        return NextResponse.json<AnalyzeResponse>({
            success: true,
            result: extendedResult,
        });

    } catch (error) {
        console.error('[API Error]:', error);
        return NextResponse.json<AnalyzeResponse>({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }, { status: 500 });
    }
}

/**
 * GET /api/analyze
 * Health check endpoint
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        version: '3.0.0',
        novelFeatures: [
            // NEW (2026)
            'Frequency-Spatial Fusion Network (FSFN)',
            'Explainable AI Detection (XAI)',
            'Ensemble Uncertainty Quantification (EUQ)',
            'GAN Fingerprint Identification (GFI)',  // NEW - identifies which AI made the image
            // Original
            'Disagreement-Aware Confidence Calibration (DACC)',
            'Spatial Artifact Mapping (SAM)',
            'Dynamic Reliability-Weighted Fusion (DRWF)',
        ],
        detectors: {
            huggingface: {
                model: 'umm-maybe/AI-image-detector',
                weight: '15% (base)',
                status: process.env.HUGGINGFACE_API_TOKEN ? 'configured' : 'demo_mode',
            },
            visionLLM: {
                provider: 'Google Gemini',
                model: 'gemini-2.5-flash',
                weight: '67% (base)',
                status: process.env.GOOGLE_GEMINI_API_KEY ? 'configured' : 'demo_mode',
            },
            dct: {
                method: 'Frequency Domain Analysis',
                weight: '18% (base)',
                status: 'active',
            },
            fsfn: {
                method: 'Frequency-Spatial Fusion Network',
                weight: 'Combined with EUQ',
                status: 'active',
            },
            ganFingerprint: {
                method: 'GAN Fingerprint Identification',
                generators: ['DALL-E', 'Midjourney', 'Stable Diffusion', 'Adobe Firefly', 'Google Imagen', 'Flux'],
                status: 'active',
            },
        },
        team: {
            authors: ['Rahul Yadav', 'Aashish Kumar Mahato', 'Bibek Gami'],
            guide: 'Madhan E S',
        },
    });
}
