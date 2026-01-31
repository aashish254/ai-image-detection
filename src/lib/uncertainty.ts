/**
 * NOVEL CONTRIBUTION #3: Ensemble Uncertainty Quantification (EUQ)
 * 
 * This module implements rigorous uncertainty quantification for AI detection,
 * providing confidence intervals and reliability metrics.
 * 
 * Key Innovation:
 * Most AI detectors give a single score without uncertainty bounds.
 * Our EUQ module:
 * 1. Uses ensemble disagreement to estimate uncertainty
 * 2. Provides confidence intervals (e.g., 75% ± 12%)
 * 3. Flags high-uncertainty cases for human review
 * 4. Quantifies both aleatoric and epistemic uncertainty
 * 
 * Types of Uncertainty:
 * - Aleatoric: Inherent noise in the data (irreducible)
 * - Epistemic: Model uncertainty due to limited training (reducible)
 * 
 * Authors: Rahul Yadav, Aashish Kumar Mahato, Bibek Gami
 */

export interface UncertaintyResult {
    // Point estimate
    prediction: number;

    // Uncertainty bounds
    lowerBound: number;
    upperBound: number;
    standardDeviation: number;

    // Confidence interval
    confidenceInterval: {
        lower: number;
        upper: number;
        level: number;  // e.g., 0.95 for 95% CI
    };

    // Uncertainty decomposition
    uncertaintyDecomposition: {
        aleatoric: number;   // Data uncertainty
        epistemic: number;   // Model uncertainty
        total: number;
    };

    // Reliability assessment
    reliability: ReliabilityAssessment;

    // Ensemble details
    ensembleDetails: EnsembleDetails;

    // Recommendations
    recommendation: UncertaintyRecommendation;

    // Processing time
    processingTime: number;
}

export interface ReliabilityAssessment {
    // Overall reliability score (0-1)
    score: number;

    // Level category
    level: 'high' | 'moderate' | 'low' | 'very_low';

    // Factors affecting reliability
    factors: ReliabilityFactor[];

    // Should human review this?
    humanReviewRecommended: boolean;

    // Reason for recommendation
    reason: string;
}

export interface ReliabilityFactor {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
}

export interface EnsembleDetails {
    // Number of ensemble members
    numMembers: number;

    // Individual predictions
    predictions: {
        name: string;
        score: number;
        weight: number;
    }[];

    // Agreement metrics
    agreement: {
        meanPrediction: number;
        variance: number;
        coefficientOfVariation: number;
        maxDisagreement: number;
    };

    // Outlier detection
    outliers: string[];
}

export type UncertaintyRecommendation =
    | 'high_confidence_ai'
    | 'high_confidence_real'
    | 'moderate_confidence'
    | 'low_confidence_needs_review'
    | 'very_uncertain_human_required';

/**
 * Calculate ensemble uncertainty from multiple detector scores
 */
export function calculateEnsembleUncertainty(
    detectorResults: { name: string; score: number; weight: number }[]
): UncertaintyResult {
    const startTime = Date.now();

    // Calculate weighted mean
    const totalWeight = detectorResults.reduce((a, b) => a + b.weight, 0);
    const weightedMean = detectorResults.reduce(
        (a, b) => a + b.score * b.weight, 0
    ) / totalWeight;

    // Calculate variance (uncertainty from disagreement)
    const variance = detectorResults.reduce(
        (a, b) => a + b.weight * Math.pow(b.score - weightedMean, 2), 0
    ) / totalWeight;

    const standardDeviation = Math.sqrt(variance);

    // Calculate bounds
    const lowerBound = Math.max(0, weightedMean - 2 * standardDeviation);
    const upperBound = Math.min(1, weightedMean + 2 * standardDeviation);

    // 95% confidence interval (assuming normal distribution)
    const z95 = 1.96;
    const ci95Lower = Math.max(0, weightedMean - z95 * standardDeviation);
    const ci95Upper = Math.min(1, weightedMean + z95 * standardDeviation);

    // Uncertainty decomposition
    const uncertaintyDecomposition = decomposeUncertainty(
        detectorResults,
        weightedMean,
        variance
    );

    // Agreement metrics
    const agreement = calculateAgreement(detectorResults, weightedMean, variance);

    // Detect outliers
    const outliers = detectOutliers(detectorResults, weightedMean, standardDeviation);

    // Reliability assessment
    const reliability = assessReliability(
        standardDeviation,
        agreement,
        outliers
    );

    // Recommendation
    const recommendation = getRecommendation(
        weightedMean,
        standardDeviation,
        reliability
    );

    const processingTime = Date.now() - startTime;

    return {
        prediction: weightedMean,
        lowerBound,
        upperBound,
        standardDeviation,
        confidenceInterval: {
            lower: ci95Lower,
            upper: ci95Upper,
            level: 0.95,
        },
        uncertaintyDecomposition,
        reliability,
        ensembleDetails: {
            numMembers: detectorResults.length,
            predictions: detectorResults,
            agreement,
            outliers,
        },
        recommendation,
        processingTime,
    };
}

/**
 * Decompose uncertainty into aleatoric and epistemic components
 */
function decomposeUncertainty(
    results: { name: string; score: number; weight: number }[],
    mean: number,
    totalVariance: number
): UncertaintyResult['uncertaintyDecomposition'] {
    // Epistemic uncertainty: model disagreement
    // Higher when detectors strongly disagree
    const maxScore = Math.max(...results.map(r => r.score));
    const minScore = Math.min(...results.map(r => r.score));
    const range = maxScore - minScore;

    const epistemic = range * 0.7 + Math.sqrt(totalVariance) * 0.3;

    // Aleatoric uncertainty: inherent data ambiguity
    // Higher when predictions are near 0.5 (uncertain boundary)
    const distanceFromBoundary = Math.abs(mean - 0.5);
    const aleatoric = (0.5 - distanceFromBoundary) * 0.5;

    // Total uncertainty
    const total = Math.sqrt(
        Math.pow(epistemic, 2) + Math.pow(aleatoric, 2)
    );

    return {
        aleatoric: Math.min(1, aleatoric),
        epistemic: Math.min(1, epistemic),
        total: Math.min(1, total),
    };
}

/**
 * Calculate agreement metrics
 */
function calculateAgreement(
    results: { name: string; score: number; weight: number }[],
    mean: number,
    variance: number
): EnsembleDetails['agreement'] {
    const maxScore = Math.max(...results.map(r => r.score));
    const minScore = Math.min(...results.map(r => r.score));

    return {
        meanPrediction: mean,
        variance,
        coefficientOfVariation: mean > 0 ? Math.sqrt(variance) / mean : 0,
        maxDisagreement: maxScore - minScore,
    };
}

/**
 * Detect outlier predictions
 */
function detectOutliers(
    results: { name: string; score: number; weight: number }[],
    mean: number,
    stdDev: number
): string[] {
    const threshold = 2; // 2 standard deviations

    return results
        .filter(r => Math.abs(r.score - mean) > threshold * stdDev)
        .map(r => r.name);
}

/**
 * Assess reliability of the prediction
 */
function assessReliability(
    stdDev: number,
    agreement: EnsembleDetails['agreement'],
    outliers: string[]
): ReliabilityAssessment {
    const factors: ReliabilityFactor[] = [];

    // Low variance = high reliability
    if (agreement.variance < 0.02) {
        factors.push({
            name: 'Detector Agreement',
            impact: 'positive',
            description: 'All detectors show strong agreement',
        });
    } else if (agreement.variance > 0.1) {
        factors.push({
            name: 'Detector Disagreement',
            impact: 'negative',
            description: 'Significant disagreement between detection methods',
        });
    }

    // Outliers
    if (outliers.length > 0) {
        factors.push({
            name: 'Outlier Detectors',
            impact: 'negative',
            description: `${outliers.length} detector(s) gave outlier predictions`,
        });
    }

    // Prediction near boundary
    if (agreement.meanPrediction > 0.4 && agreement.meanPrediction < 0.6) {
        factors.push({
            name: 'Boundary Case',
            impact: 'negative',
            description: 'Prediction near decision boundary (uncertain)',
        });
    } else {
        factors.push({
            name: 'Clear Prediction',
            impact: 'positive',
            description: 'Prediction far from decision boundary',
        });
    }

    // Calculate overall reliability score
    let reliabilityScore = 1;

    // Penalize for variance
    reliabilityScore -= Math.min(0.4, agreement.variance * 4);

    // Penalize for outliers
    reliabilityScore -= outliers.length * 0.1;

    // Penalize for boundary predictions
    const boundaryDistance = Math.abs(agreement.meanPrediction - 0.5);
    reliabilityScore -= (0.5 - boundaryDistance) * 0.3;

    reliabilityScore = Math.max(0, Math.min(1, reliabilityScore));

    // Determine level
    let level: ReliabilityAssessment['level'];
    if (reliabilityScore >= 0.8) level = 'high';
    else if (reliabilityScore >= 0.6) level = 'moderate';
    else if (reliabilityScore >= 0.4) level = 'low';
    else level = 'very_low';

    // Determine if human review needed
    const humanReviewRecommended = level === 'low' || level === 'very_low';

    // Generate reason
    let reason = '';
    if (humanReviewRecommended) {
        const negativeFactors = factors.filter(f => f.impact === 'negative');
        reason = negativeFactors.length > 0
            ? negativeFactors.map(f => f.description).join('; ')
            : 'Multiple uncertainty factors present';
    } else {
        reason = 'Prediction meets confidence threshold';
    }

    return {
        score: reliabilityScore,
        level,
        factors,
        humanReviewRecommended,
        reason,
    };
}

/**
 * Get final recommendation
 */
function getRecommendation(
    prediction: number,
    stdDev: number,
    reliability: ReliabilityAssessment
): UncertaintyRecommendation {
    // Very uncertain
    if (reliability.level === 'very_low') {
        return 'very_uncertain_human_required';
    }

    // Low confidence
    if (reliability.level === 'low') {
        return 'low_confidence_needs_review';
    }

    // Moderate confidence
    if (reliability.level === 'moderate') {
        return 'moderate_confidence';
    }

    // High confidence - determine direction
    if (prediction >= 0.7) {
        return 'high_confidence_ai';
    } else if (prediction <= 0.3) {
        return 'high_confidence_real';
    }

    return 'moderate_confidence';
}

/**
 * Get recommendation text for UI
 */
export function getRecommendationText(recommendation: UncertaintyRecommendation): {
    title: string;
    description: string;
    color: string;
    icon: string;
} {
    const texts: Record<UncertaintyRecommendation, {
        title: string;
        description: string;
        color: string;
        icon: string;
    }> = {
        high_confidence_ai: {
            title: 'High Confidence: AI Generated',
            description: 'Strong agreement across all detection methods. High certainty this is AI-generated.',
            color: '#ef4444',
            icon: '🤖',
        },
        high_confidence_real: {
            title: 'High Confidence: Authentic',
            description: 'Strong agreement across all detection methods. High certainty this is a real photograph.',
            color: '#22c55e',
            icon: '📷',
        },
        moderate_confidence: {
            title: 'Moderate Confidence',
            description: 'Detection methods show reasonable agreement. Result is likely accurate but not certain.',
            color: '#f59e0b',
            icon: '⚖️',
        },
        low_confidence_needs_review: {
            title: 'Low Confidence - Review Recommended',
            description: 'Significant uncertainty in detection. Human review is recommended for verification.',
            color: '#f97316',
            icon: '👁️',
        },
        very_uncertain_human_required: {
            title: 'Very Uncertain - Human Review Required',
            description: 'Detection methods strongly disagree. Result should not be relied upon without human verification.',
            color: '#dc2626',
            icon: '⚠️',
        },
    };

    return texts[recommendation];
}

/**
 * Format uncertainty for display
 */
export function formatUncertainty(result: UncertaintyResult): string {
    const percentage = (result.prediction * 100).toFixed(1);
    const margin = (result.standardDeviation * 100).toFixed(1);
    return `${percentage}% ± ${margin}%`;
}

/**
 * Get uncertainty level description
 */
export function getUncertaintyLevel(stdDev: number): {
    level: 'low' | 'moderate' | 'high' | 'very_high';
    description: string;
} {
    if (stdDev < 0.05) {
        return {
            level: 'low',
            description: 'Very low uncertainty - detectors strongly agree',
        };
    } else if (stdDev < 0.1) {
        return {
            level: 'moderate',
            description: 'Moderate uncertainty - some detector disagreement',
        };
    } else if (stdDev < 0.2) {
        return {
            level: 'high',
            description: 'High uncertainty - significant detector disagreement',
        };
    } else {
        return {
            level: 'very_high',
            description: 'Very high uncertainty - detectors strongly disagree',
        };
    }
}

/**
 * Monte Carlo Dropout simulation for additional uncertainty
 * (Simulated - in production would use actual model dropout)
 */
export function monteCarloUncertainty(
    baseScore: number,
    numSamples: number = 10
): number[] {
    const samples: number[] = [];

    for (let i = 0; i < numSamples; i++) {
        // Simulate dropout variation
        const noise = (Math.random() - 0.5) * 0.15;
        samples.push(Math.max(0, Math.min(1, baseScore + noise)));
    }

    return samples;
}
