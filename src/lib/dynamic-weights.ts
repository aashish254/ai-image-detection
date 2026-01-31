/**
 * NOVEL CONTRIBUTION #3: Dynamic Reliability-Weighted Fusion (DRWF)
 * 
 * This module implements a novel approach to multi-modal fusion that
 * dynamically adjusts weights based on each detector's self-reported
 * reliability for the specific image being analyzed.
 * 
 * Paper Reference: "Dynamic Reliability Weighting for Robust Multi-Modal Fusion"
 * 
 * Key Innovation:
 * Traditional fusion uses fixed static weights:
 *   score = 0.6*HF + 0.3*VLM + 0.1*DCT
 * 
 * Our approach dynamically adjusts weights based on:
 * 1. Detector's internal confidence for this specific image
 * 2. Detector's response status (success, error, fallback)
 * 3. Processing time (faster may indicate cached/trivial result)
 * 4. Historical reliability metrics
 * 
 * Authors: Rahul Yadav, Aashish Kumar Mahato, Bibek Gami
 */

import { DetectorResult } from './types';

export interface DetectorWithMetadata {
    name: string;
    score: number;
    baseWeight: number;
    internalConfidence: number;
    status: 'success' | 'error' | 'fallback';
    processingTime: number;
    hasError: boolean;
}

export interface DynamicWeightResult {
    // Final dynamic weights after adjustment
    weights: {
        huggingface: number;
        visionLLM: number;
        dct: number;
    };

    // Reliability scores for each detector
    reliabilityScores: {
        huggingface: number;
        visionLLM: number;
        dct: number;
    };

    // The dynamically weighted fusion score
    fusedScore: number;

    // Adjustment details for transparency
    adjustments: WeightAdjustment[];

    // Explanation for user
    explanation: string;
}

export interface WeightAdjustment {
    detector: string;
    originalWeight: number;
    adjustedWeight: number;
    reason: string;
    reliabilityScore: number;
}

// Base weights (can be adjusted)
// VLM (Gemini) does actual semantic analysis and is most reliable
// HuggingFace provides statistical detection
// DCT provides frequency-based analysis
const BASE_WEIGHTS = {
    huggingface: 0.15,  // Reduced - often uses fallback
    visionLLM: 0.67,    // Increased - most accurate for real images
    dct: 0.18,          // Slightly increased - provides good frequency analysis
};

// Reliability calculation parameters
const RELIABILITY_CONFIG = {
    // Weight for internal confidence in reliability calculation
    confidenceWeight: 0.5,

    // Weight for status in reliability calculation
    statusWeight: 0.3,

    // Weight for processing time in reliability calculation
    timeWeight: 0.2,

    // Maximum expected processing time (ms)
    maxExpectedTime: 15000,

    // Minimum reliability to participate in fusion
    minReliability: 0.05,

    // Status-based reliability multipliers
    // IMPORTANT: Fallback mode should have very low weight
    statusMultipliers: {
        success: 1.0,
        fallback: 0.15,  // Heavily penalized - heuristics are unreliable
        error: 0.05,
    },
};

/**
 * Calculate reliability score for a single detector
 * 
 * Reliability = α*confidence + β*status_score + γ*time_score
 */
export function calculateDetectorReliability(detector: DetectorWithMetadata): number {
    // Confidence component (0-1)
    const confidenceScore = detector.internalConfidence;

    // Status component (0-1)
    const statusScore = RELIABILITY_CONFIG.statusMultipliers[detector.status] || 0.5;

    // Time component: faster is usually more reliable (within reason)
    // Score decreases as processing time approaches max expected time
    const normalizedTime = Math.min(detector.processingTime / RELIABILITY_CONFIG.maxExpectedTime, 1);
    const timeScore = 1 - (normalizedTime * 0.5); // Max 50% penalty for slow responses

    // Handle errors
    if (detector.hasError) {
        return RELIABILITY_CONFIG.minReliability;
    }

    // Weighted combination
    const reliability =
        RELIABILITY_CONFIG.confidenceWeight * confidenceScore +
        RELIABILITY_CONFIG.statusWeight * statusScore +
        RELIABILITY_CONFIG.timeWeight * timeScore;

    // Clamp to valid range
    return Math.max(RELIABILITY_CONFIG.minReliability, Math.min(1, reliability));
}

/**
 * MAIN FUNCTION: Calculate dynamic weights and perform fusion
 */
export function calculateDynamicWeights(
    huggingface: DetectorWithMetadata,
    visionLLM: DetectorWithMetadata,
    dct: DetectorWithMetadata
): DynamicWeightResult {
    // Calculate reliability scores
    const hfReliability = calculateDetectorReliability(huggingface);
    const vlmReliability = calculateDetectorReliability(visionLLM);
    const dctReliability = calculateDetectorReliability(dct);

    // Apply reliability to base weights
    const hfAdjusted = BASE_WEIGHTS.huggingface * hfReliability;
    const vlmAdjusted = BASE_WEIGHTS.visionLLM * vlmReliability;
    const dctAdjusted = BASE_WEIGHTS.dct * dctReliability;

    // Normalize weights to sum to 1
    const totalAdjusted = hfAdjusted + vlmAdjusted + dctAdjusted;
    const normalizedWeights = {
        huggingface: hfAdjusted / totalAdjusted,
        visionLLM: vlmAdjusted / totalAdjusted,
        dct: dctAdjusted / totalAdjusted,
    };

    // Calculate fused score with dynamic weights
    const fusedScore =
        huggingface.score * normalizedWeights.huggingface +
        visionLLM.score * normalizedWeights.visionLLM +
        dct.score * normalizedWeights.dct;

    // Create adjustment details
    const adjustments: WeightAdjustment[] = [
        {
            detector: 'HuggingFace AI Detector',
            originalWeight: BASE_WEIGHTS.huggingface,
            adjustedWeight: normalizedWeights.huggingface,
            reason: getAdjustmentReason(huggingface, hfReliability),
            reliabilityScore: hfReliability,
        },
        {
            detector: 'Gemini Vision Analysis',
            originalWeight: BASE_WEIGHTS.visionLLM,
            adjustedWeight: normalizedWeights.visionLLM,
            reason: getAdjustmentReason(visionLLM, vlmReliability),
            reliabilityScore: vlmReliability,
        },
        {
            detector: 'DCT Frequency Analysis',
            originalWeight: BASE_WEIGHTS.dct,
            adjustedWeight: normalizedWeights.dct,
            reason: getAdjustmentReason(dct, dctReliability),
            reliabilityScore: dctReliability,
        },
    ];

    // Generate explanation
    const explanation = generateWeightExplanation(adjustments, normalizedWeights);

    return {
        weights: normalizedWeights,
        reliabilityScores: {
            huggingface: hfReliability,
            visionLLM: vlmReliability,
            dct: dctReliability,
        },
        fusedScore,
        adjustments,
        explanation,
    };
}

/**
 * Generate reason for weight adjustment
 */
function getAdjustmentReason(detector: DetectorWithMetadata, reliability: number): string {
    if (detector.hasError || detector.status === 'error') {
        return 'Weight reduced due to detector error';
    }
    if (detector.status === 'fallback') {
        return 'Weight reduced due to fallback mode (demo/no API key)';
    }
    if (reliability > 0.8) {
        return 'High reliability - detector confident in result';
    }
    if (reliability > 0.5) {
        return 'Moderate reliability - standard weight applied';
    }
    return 'Lower reliability - reduced influence on final score';
}

/**
 * Generate human-readable explanation of weight adjustments
 */
function generateWeightExplanation(
    adjustments: WeightAdjustment[],
    finalWeights: DynamicWeightResult['weights']
): string {
    const significantChanges = adjustments.filter(a =>
        Math.abs(a.adjustedWeight - a.originalWeight) > 0.05
    );

    if (significantChanges.length === 0) {
        return 'All detectors showed high reliability. Weights remained close to baseline (15/67/18).';
    }

    let explanation = 'Dynamic weight adjustment applied: ';

    for (const adj of significantChanges) {
        const change = adj.adjustedWeight - adj.originalWeight;
        const direction = change > 0 ? 'increased' : 'decreased';
        const changePercent = Math.abs(change * 100).toFixed(0);

        explanation += `${adj.detector} ${direction} by ${changePercent}% (${adj.reason}). `;
    }

    explanation += `Final weights: HF=${(finalWeights.huggingface * 100).toFixed(0)}%, `;
    explanation += `VLM=${(finalWeights.visionLLM * 100).toFixed(0)}%, `;
    explanation += `DCT=${(finalWeights.dct * 100).toFixed(0)}%.`;

    return explanation;
}

/**
 * Compare static vs dynamic fusion for research
 */
export function compareStaticVsDynamic(
    huggingface: DetectorWithMetadata,
    visionLLM: DetectorWithMetadata,
    dct: DetectorWithMetadata
): {
    staticScore: number;
    dynamicScore: number;
    difference: number;
    percentageChange: number;
    recommendation: string;
} {
    // Static fusion with fixed weights
    const staticScore =
        huggingface.score * BASE_WEIGHTS.huggingface +
        visionLLM.score * BASE_WEIGHTS.visionLLM +
        dct.score * BASE_WEIGHTS.dct;

    // Dynamic fusion
    const dynamicResult = calculateDynamicWeights(huggingface, visionLLM, dct);
    const dynamicScore = dynamicResult.fusedScore;

    const difference = dynamicScore - staticScore;
    const percentageChange = staticScore > 0 ? (difference / staticScore) * 100 : 0;

    let recommendation = '';
    if (Math.abs(difference) < 0.05) {
        recommendation = 'Minimal difference between static and dynamic fusion - all detectors reliable';
    } else if (difference > 0) {
        recommendation = 'Dynamic fusion suggests higher AI probability - unreliable detectors were predicting lower';
    } else {
        recommendation = 'Dynamic fusion suggests lower AI probability - unreliable detectors were predicting higher';
    }

    return {
        staticScore,
        dynamicScore,
        difference,
        percentageChange,
        recommendation,
    };
}

/**
 * Get recommended fusion method based on detector reliability
 */
export function getRecommendedFusionMethod(
    reliabilityScores: DynamicWeightResult['reliabilityScores']
): 'static' | 'dynamic' | 'single_detector' {
    const avgReliability =
        (reliabilityScores.huggingface + reliabilityScores.visionLLM + reliabilityScores.dct) / 3;

    // If all detectors are highly reliable, static is fine
    if (avgReliability > 0.8 &&
        Math.min(reliabilityScores.huggingface, reliabilityScores.visionLLM, reliabilityScores.dct) > 0.7) {
        return 'static';
    }

    // If only one detector is reliable, use just that one
    const reliableCount = [
        reliabilityScores.huggingface,
        reliabilityScores.visionLLM,
        reliabilityScores.dct
    ].filter(r => r > 0.5).length;

    if (reliableCount === 1) {
        return 'single_detector';
    }

    // Otherwise, dynamic weighting is best
    return 'dynamic';
}

/**
 * Get metrics for research evaluation
 */
export function getDynamicWeightingMetrics(results: DynamicWeightResult[]): {
    averageWeightShift: number;
    frequencyOfAdjustment: number;
    averageReliability: {
        huggingface: number;
        visionLLM: number;
        dct: number;
    };
    impactOnScores: number;
} {
    if (results.length === 0) {
        return {
            averageWeightShift: 0,
            frequencyOfAdjustment: 0,
            averageReliability: { huggingface: 0, visionLLM: 0, dct: 0 },
            impactOnScores: 0,
        };
    }

    let totalShift = 0;
    let adjustmentCount = 0;
    let hfReliabilitySum = 0;
    let vlmReliabilitySum = 0;
    let dctReliabilitySum = 0;

    for (const result of results) {
        // Calculate weight shift
        totalShift += Math.abs(result.weights.huggingface - BASE_WEIGHTS.huggingface);
        totalShift += Math.abs(result.weights.visionLLM - BASE_WEIGHTS.visionLLM);
        totalShift += Math.abs(result.weights.dct - BASE_WEIGHTS.dct);

        // Count adjustments
        if (result.adjustments.some(a => Math.abs(a.adjustedWeight - a.originalWeight) > 0.05)) {
            adjustmentCount++;
        }

        // Sum reliability scores
        hfReliabilitySum += result.reliabilityScores.huggingface;
        vlmReliabilitySum += result.reliabilityScores.visionLLM;
        dctReliabilitySum += result.reliabilityScores.dct;
    }

    return {
        averageWeightShift: totalShift / (results.length * 3),
        frequencyOfAdjustment: adjustmentCount / results.length,
        averageReliability: {
            huggingface: hfReliabilitySum / results.length,
            visionLLM: vlmReliabilitySum / results.length,
            dct: dctReliabilitySum / results.length,
        },
        impactOnScores: totalShift / results.length, // Simplified metric
    };
}
