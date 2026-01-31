/**
 * ADVANCED FUSION MODULE
 * 
 * Integrates all three novel contributions:
 * 1. Disagreement-Aware Confidence Calibration (DACC)
 * 2. Spatial Artifact Mapping (SAM)
 * 3. Dynamic Reliability-Weighted Fusion (DRWF)
 * 
 * Authors: Rahul Yadav, Aashish Kumar Mahato, Bibek Gami
 */

import {
    AnalysisResult,
    DetectorResult,
    VisionLLMResult,
    DCTResult,
    Artifact,
    EducationalInsight,
    CalibrationResult,
    SpatialAnalysisResult,
    FusionResult,
} from './types';
import { generateId, getVerdictFromScore } from './utils';
import { calibrateConfidence, DetectorScore } from './calibration';
import { generateHeatmapData, HeatmapData } from './spatial-analysis';
import { calculateDynamicWeights, DetectorWithMetadata } from './dynamic-weights';
import { ExtendedVisionLLMResult } from './detectors/vision-llm';

/**
 * Fuse results from multiple detectors using all novel contributions
 */
export function fuseResults(
    huggingfaceResult: DetectorResult,
    visionLLMResult: ExtendedVisionLLMResult,
    dctResult: DCTResult,
    cached: boolean = false
): AnalysisResult {
    // Step 1: Apply Dynamic Reliability-Weighted Fusion (NOVEL #3)
    const hfMetadata: DetectorWithMetadata = {
        name: huggingfaceResult.name,
        score: huggingfaceResult.score,
        baseWeight: 0.6,
        internalConfidence: huggingfaceResult.confidence,
        status: huggingfaceResult.status,
        processingTime: huggingfaceResult.processingTime,
        hasError: huggingfaceResult.status === 'error',
    };

    const vlmMetadata: DetectorWithMetadata = {
        name: visionLLMResult.name,
        score: visionLLMResult.score,
        baseWeight: 0.3,
        internalConfidence: visionLLMResult.internalConfidence || visionLLMResult.confidence,
        status: visionLLMResult.status,
        processingTime: visionLLMResult.processingTime,
        hasError: visionLLMResult.status === 'error',
    };

    const dctMetadata: DetectorWithMetadata = {
        name: dctResult.name,
        score: dctResult.score,
        baseWeight: 0.1,
        internalConfidence: dctResult.confidence,
        status: dctResult.status,
        processingTime: dctResult.processingTime,
        hasError: dctResult.status === 'error',
    };

    const dynamicWeightResult = calculateDynamicWeights(hfMetadata, vlmMetadata, dctMetadata);

    // Step 2: Apply Disagreement-Aware Confidence Calibration (NOVEL #1)
    const detectorScores: DetectorScore[] = [
        {
            name: huggingfaceResult.name,
            score: huggingfaceResult.score,
            confidence: huggingfaceResult.confidence,
            weight: dynamicWeightResult.weights.huggingface,
            internalConfidence: huggingfaceResult.confidence,
        },
        {
            name: visionLLMResult.name,
            score: visionLLMResult.score,
            confidence: visionLLMResult.confidence,
            weight: dynamicWeightResult.weights.visionLLM,
            internalConfidence: visionLLMResult.internalConfidence,
        },
        {
            name: dctResult.name,
            score: dctResult.score,
            confidence: dctResult.confidence,
            weight: dynamicWeightResult.weights.dct,
            internalConfidence: dctResult.confidence,
        },
    ];

    const calibrationResult = calibrateConfidence(dynamicWeightResult.fusedScore, detectorScores);

    // Step 3: Generate Spatial Artifact Heatmap (NOVEL #2)
    const regionAnalysis = visionLLMResult.regionAnalysis || {
        topLeft: { aiScore: visionLLMResult.score, anomalies: [] },
        topRight: { aiScore: visionLLMResult.score, anomalies: [] },
        bottomLeft: { aiScore: visionLLMResult.score, anomalies: [] },
        bottomRight: { aiScore: visionLLMResult.score, anomalies: [] },
        center: { aiScore: visionLLMResult.score, anomalies: [] },
    };

    const heatmapData = generateHeatmapData(regionAnalysis);

    // Use calibrated score for final verdict
    const finalScore = calibrationResult.calibratedScore;
    const verdict = getVerdictFromScore(finalScore) as AnalysisResult['verdict'];

    // Extract artifacts from all detectors
    const artifacts = extractArtifacts(visionLLMResult, dctResult, heatmapData);

    // Generate comprehensive explanation
    const explanation = generateExplanation(
        verdict,
        finalScore,
        calibrationResult,
        dynamicWeightResult,
        heatmapData
    );

    // Generate educational insights including novel features
    const insights = generateInsights(
        verdict,
        visionLLMResult,
        dctResult,
        calibrationResult,
        heatmapData
    );

    // Create calibration result for response
    const calibration: CalibrationResult = {
        rawScore: calibrationResult.rawScore,
        calibratedScore: calibrationResult.calibratedScore,
        trustScore: calibrationResult.trustScore,
        disagreementType: calibrationResult.disagreement.disagreementType,
        disagreementScore: calibrationResult.disagreement.disagreementScore,
        recommendation: calibrationResult.recommendation,
        explanation: calibrationResult.calibrationExplanation,
    };

    // Create spatial analysis result for response
    const spatialAnalysis: SpatialAnalysisResult = {
        heatmapData: heatmapData.colorMap,
        hotspots: heatmapData.summary.hotspots,
        uniformityScore: heatmapData.summary.uniformityScore,
        isLikelyComposite: heatmapData.summary.isLikelyComposite,
        spatialExplanation: heatmapData.spatialExplanation,
    };

    // Create fusion result for response
    const fusion: FusionResult = {
        huggingfaceWeight: dynamicWeightResult.weights.huggingface,
        visionLLMWeight: dynamicWeightResult.weights.visionLLM,
        dctWeight: dynamicWeightResult.weights.dct,
        finalScore: finalScore,
        dynamicWeighting: {
            enabled: true,
            staticScore: huggingfaceResult.score * 0.6 + visionLLMResult.score * 0.3 + dctResult.score * 0.1,
            dynamicScore: dynamicWeightResult.fusedScore,
            weightAdjustments: dynamicWeightResult.explanation,
        },
    };

    return {
        id: generateId(),
        verdict,
        confidence: finalScore,
        timestamp: new Date().toISOString(),
        cached,
        detectors: {
            huggingface: huggingfaceResult,
            visionLLM: visionLLMResult,
            dctAnalysis: dctResult,
        },
        fusion,
        calibration,
        spatialAnalysis,
        artifacts,
        explanation,
        insights,
    };
}

/**
 * Extract and consolidate artifacts from detector results
 */
function extractArtifacts(
    visionResult: VisionLLMResult,
    dctResult: DCTResult,
    heatmapData: HeatmapData
): Artifact[] {
    const artifacts: Artifact[] = [];

    // Extract artifacts from vision analysis
    if (visionResult.analysis?.artifactsDetected) {
        visionResult.analysis.artifactsDetected.forEach((artifact, index) => {
            artifacts.push({
                id: `vlm-${index}`,
                type: mapArtifactType(artifact.type),
                description: artifact.description,
                severity: getSeverityFromConfidence(artifact.confidence),
                region: artifact.region,
            });
        });
    }

    // Add frequency analysis artifacts
    if (dctResult.frequencyAnalysis) {
        const freq = dctResult.frequencyAnalysis;

        if (freq.spectralAnomalies > 0.3) {
            artifacts.push({
                id: 'dct-spectral',
                type: 'frequency_anomaly',
                description: 'Unusual frequency spectrum detected that may indicate AI generation',
                severity: freq.spectralAnomalies > 0.6 ? 'high' : 'medium',
            });
        }

        if (freq.blockingArtifacts > 0.25) {
            artifacts.push({
                id: 'dct-blocking',
                type: 'compression_artifact',
                description: freq.compressionPatterns,
                severity: freq.blockingArtifacts > 0.5 ? 'high' : 'medium',
            });
        }
    }

    // Add artifacts from spatial hotspots
    for (const hotspot of heatmapData.summary.hotspots) {
        if (hotspot.severity === 'high') {
            artifacts.push({
                id: `spatial-${hotspot.region.toLowerCase().replace(/\s+/g, '-')}`,
                type: 'other',
                description: `High AI probability in ${hotspot.region} region (${(hotspot.score * 100).toFixed(0)}%)`,
                severity: hotspot.severity,
                region: hotspot.region,
            });
        }
    }

    return artifacts;
}

/**
 * Map artifact type string to enum
 */
function mapArtifactType(type: string): Artifact['type'] {
    const typeMap: Record<string, Artifact['type']> = {
        'lighting': 'lighting_inconsistency',
        'lighting_inconsistency': 'lighting_inconsistency',
        'anatomical': 'anatomical_anomaly',
        'anatomical_anomaly': 'anatomical_anomaly',
        'texture': 'texture_irregularity',
        'texture_irregularity': 'texture_irregularity',
        'reflection': 'reflection_error',
        'reflection_error': 'reflection_error',
        'shadow': 'shadow_inconsistency',
        'shadow_inconsistency': 'shadow_inconsistency',
        'semantic': 'semantic_error',
        'semantic_error': 'semantic_error',
        'compression': 'compression_artifact',
        'frequency': 'frequency_anomaly',
        'edge': 'edge_artifact',
    };

    const lowerType = type.toLowerCase();
    for (const [key, value] of Object.entries(typeMap)) {
        if (lowerType.includes(key)) {
            return value;
        }
    }
    return 'other';
}

/**
 * Get severity level from confidence score
 */
function getSeverityFromConfidence(confidence: number): Artifact['severity'] {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
}

/**
 * Generate comprehensive explanation including novel features
 */
function generateExplanation(
    verdict: AnalysisResult['verdict'],
    finalScore: number,
    calibration: ReturnType<typeof calibrateConfidence>,
    dynamicWeights: ReturnType<typeof calculateDynamicWeights>,
    heatmapData: HeatmapData
): string {
    const percentScore = (finalScore * 100).toFixed(1);
    let explanation = '';

    // Verdict explanation
    switch (verdict) {
        case 'AI_GENERATED':
            explanation = `This image shows strong indicators of AI generation with a ${percentScore}% calibrated confidence score. `;
            break;
        case 'LIKELY_AI':
            explanation = `This image shows significant indicators suggesting it may be AI-generated (${percentScore}% calibrated confidence). `;
            break;
        case 'UNCERTAIN':
            explanation = `The analysis is inconclusive with a ${percentScore}% AI likelihood score. `;
            break;
        case 'LIKELY_REAL':
            explanation = `This image appears to be authentic with only minor concerns (${percentScore}% AI likelihood). `;
            break;
        case 'REAL':
            explanation = `This image shows strong indicators of being a real photograph (${percentScore}% AI likelihood). `;
            break;
    }

    // Add calibration insight
    if (calibration.disagreement.disagreementType !== 'agreement') {
        explanation += `Note: ${calibration.disagreement.explanation} `;
    }

    // Add spatial insight
    if (heatmapData.summary.isLikelyComposite) {
        explanation += `IMPORTANT: Spatial analysis suggests this may be a COMPOSITE image with mixed real and AI-generated content. `;
    } else if (heatmapData.summary.hotspots.length > 0) {
        explanation += `Spatial analysis identified ${heatmapData.summary.hotspots.length} suspicious region(s). `;
    }

    // Add trust recommendation
    switch (calibration.recommendation) {
        case 'human_review_recommended':
            explanation += 'Due to significant detector disagreement, human review is recommended.';
            break;
        case 'low_confidence':
            explanation += 'Results should be interpreted with caution due to detector uncertainty.';
            break;
        case 'moderate_confidence':
            explanation += 'Results are reasonably reliable.';
            break;
        case 'high_confidence':
            explanation += 'High confidence in this classification.';
            break;
    }

    return explanation;
}

/**
 * Generate educational insights including novel features
 */
function generateInsights(
    verdict: AnalysisResult['verdict'],
    vlmResult: VisionLLMResult,
    dctResult: DCTResult,
    calibration: ReturnType<typeof calibrateConfidence>,
    heatmapData: HeatmapData
): EducationalInsight[] {
    const insights: EducationalInsight[] = [];

    // Novel contribution insight
    insights.push({
        title: 'Advanced Multi-Modal Analysis',
        description: 'This analysis uses three novel techniques: (1) Disagreement-Aware Confidence Calibration to detect when detectors conflict, (2) Spatial Artifact Mapping to show WHERE AI artifacts are located, and (3) Dynamic Reliability Weighting to adapt fusion based on detector reliability.',
        category: 'novel',
    });

    // Trust score insight
    insights.push({
        title: 'Trust Score Explained',
        description: `The Trust Score (${(calibration.trustScore * 100).toFixed(0)}%) indicates how much you can rely on this result. A higher score means all detection methods agree. Score below 50% suggests detector disagreement - interpret results with caution.`,
        category: 'novel',
    });

    // Spatial analysis insight
    if (heatmapData.summary.isLikelyComposite) {
        insights.push({
            title: 'Composite Image Detection',
            description: 'Our Spatial Artifact Mapping detected significant variation in AI probability across different regions. This suggests parts of the image may be real while others are AI-generated or heavily edited.',
            category: 'novel',
        });
    }

    // Verdict-specific insights
    if (verdict === 'AI_GENERATED' || verdict === 'LIKELY_AI') {
        insights.push({
            title: 'Common AI Artifacts',
            description: 'AI-generated images often exhibit telltale signs such as incorrect finger counts, asymmetric jewelry, inconsistent reflections, and unusual texture patterns.',
            category: 'visual',
        });
    } else if (verdict === 'REAL' || verdict === 'LIKELY_REAL') {
        insights.push({
            title: 'Authentic Image Characteristics',
            description: 'Real photographs typically exhibit natural noise patterns, consistent lighting physics, and organic texture variations that are difficult for AI to replicate perfectly.',
            category: 'visual',
        });
    }

    // Semantic issues insight
    if (vlmResult.analysis?.semanticIssues?.length > 0) {
        insights.push({
            title: 'Semantic Analysis',
            description: `The vision model identified potential logical issues: ${vlmResult.analysis.semanticIssues.join('; ')}`,
            category: 'semantic',
        });
    }

    // Frequency analysis insight
    insights.push({
        title: 'Frequency Domain Analysis',
        description: 'DCT (Discrete Cosine Transform) analysis examines image frequencies. AI generators often leave unique "fingerprints" in high-frequency components that are invisible to the human eye but detectable through mathematical analysis.',
        category: 'technical',
    });

    return insights;
}
