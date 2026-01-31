/**
 * NOVEL CONTRIBUTION #1: Disagreement-Aware Confidence Calibration (DACC)
 * 
 * This module implements a novel approach to confidence calibration that
 * addresses the fundamental flaw in weighted averaging when detectors disagree.
 * 
 * Paper Reference: "Adaptive Confidence Calibration via Detector Disagreement Analysis"
 * 
 * Key Innovation:
 * Traditional multi-modal fusion uses fixed weighted averaging:
 *   score = w1*s1 + w2*s2 + w3*s3
 * 
 * This fails when detectors fundamentally disagree, producing false confidence.
 * Our approach introduces a disagreement-aware calibration:
 *   calibrated_score = base_score * (1 - λ * disagreement)
 *   trust_score = 1 - disagreement
 * 
 * Authors: Rahul Yadav, Aashish Kumar Mahato, Bibek Gami
 */

export interface DetectorScore {
    name: string;
    score: number;
    confidence: number;
    weight: number;
    internalConfidence?: number;
}

export interface DisagreementAnalysis {
    // Core disagreement metric (0 = perfect agreement, 1 = complete disagreement)
    disagreementScore: number;

    // Standard deviation of detector scores
    standardDeviation: number;

    // Range between highest and lowest scores
    scoreRange: number;

    // Type of disagreement detected
    disagreementType: 'agreement' | 'mild' | 'moderate' | 'severe' | 'conflict';

    // Which detectors are in conflict
    conflictingDetectors: string[];

    // Human-readable explanation
    explanation: string;
}

export interface CalibratedResult {
    // Original uncalibrated score
    rawScore: number;

    // Calibrated score accounting for disagreement
    calibratedScore: number;

    // Trust indicator (0-1, how much to trust this result)
    trustScore: number;

    // Disagreement analysis details
    disagreement: DisagreementAnalysis;

    // Recommendation for user
    recommendation: 'high_confidence' | 'moderate_confidence' | 'low_confidence' | 'human_review_recommended';

    // Explanation for the user
    calibrationExplanation: string;
}

// Calibration hyperparameters (can be tuned)
const CALIBRATION_CONFIG = {
    // Lambda: sensitivity to disagreement (0.3 = 30% max reduction)
    lambda: 0.35,

    // Threshold for detecting mild disagreement
    mildDisagreementThreshold: 0.15,

    // Threshold for detecting moderate disagreement
    moderateDisagreementThreshold: 0.25,

    // Threshold for detecting severe disagreement
    severeDisagreementThreshold: 0.35,

    // Threshold for conflict detection (detectors on opposite sides)
    conflictThreshold: 0.4,

    // Midpoint for determining "opposite sides"
    neutralPoint: 0.5,
};

/**
 * Calculate the disagreement score between multiple detectors
 * Uses normalized standard deviation and range analysis
 */
export function calculateDisagreement(detectorScores: DetectorScore[]): DisagreementAnalysis {
    if (detectorScores.length < 2) {
        return {
            disagreementScore: 0,
            standardDeviation: 0,
            scoreRange: 0,
            disagreementType: 'agreement',
            conflictingDetectors: [],
            explanation: 'Insufficient detectors for disagreement analysis',
        };
    }

    const scores = detectorScores.map(d => d.score);

    // Calculate mean
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Calculate standard deviation
    const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate range
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const scoreRange = maxScore - minScore;

    // Normalized disagreement score (0-1)
    // Combines standard deviation and range, weighted by detector confidence
    const weightedStdDev = calculateWeightedStandardDeviation(detectorScores);
    const disagreementScore = Math.min(1, (weightedStdDev * 2 + scoreRange) / 2);

    // Detect conflicting detectors (on opposite sides of neutral point)
    const conflictingDetectors = detectConflicts(detectorScores);

    // Classify disagreement type
    const disagreementType = classifyDisagreement(disagreementScore, conflictingDetectors.length > 0);

    // Generate explanation
    const explanation = generateDisagreementExplanation(
        detectorScores,
        disagreementType,
        conflictingDetectors,
        standardDeviation
    );

    return {
        disagreementScore,
        standardDeviation,
        scoreRange,
        disagreementType,
        conflictingDetectors,
        explanation,
    };
}

/**
 * Calculate weighted standard deviation based on detector confidence
 */
function calculateWeightedStandardDeviation(detectorScores: DetectorScore[]): number {
    const totalWeight = detectorScores.reduce((sum, d) => sum + d.weight, 0);
    const weightedMean = detectorScores.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight;

    const weightedVariance = detectorScores.reduce((sum, d) => {
        return sum + d.weight * Math.pow(d.score - weightedMean, 2);
    }, 0) / totalWeight;

    return Math.sqrt(weightedVariance);
}

/**
 * Detect which detectors are in conflict (predicting opposite outcomes)
 */
function detectConflicts(detectorScores: DetectorScore[]): string[] {
    const conflicts: string[] = [];
    const neutral = CALIBRATION_CONFIG.neutralPoint;
    const threshold = CALIBRATION_CONFIG.conflictThreshold;

    for (let i = 0; i < detectorScores.length; i++) {
        for (let j = i + 1; j < detectorScores.length; j++) {
            const d1 = detectorScores[i];
            const d2 = detectorScores[j];

            // Check if they're on opposite sides of neutral with significant margin
            const d1Side = d1.score > neutral + threshold ? 'AI' : d1.score < neutral - threshold ? 'Real' : 'Uncertain';
            const d2Side = d2.score > neutral + threshold ? 'AI' : d2.score < neutral - threshold ? 'Real' : 'Uncertain';

            if ((d1Side === 'AI' && d2Side === 'Real') || (d1Side === 'Real' && d2Side === 'AI')) {
                conflicts.push(`${d1.name} vs ${d2.name}`);
            }
        }
    }

    return conflicts;
}

/**
 * Classify the type of disagreement
 */
function classifyDisagreement(
    disagreementScore: number,
    hasConflicts: boolean
): DisagreementAnalysis['disagreementType'] {
    if (hasConflicts && disagreementScore > CALIBRATION_CONFIG.severeDisagreementThreshold) {
        return 'conflict';
    }
    if (disagreementScore > CALIBRATION_CONFIG.severeDisagreementThreshold) {
        return 'severe';
    }
    if (disagreementScore > CALIBRATION_CONFIG.moderateDisagreementThreshold) {
        return 'moderate';
    }
    if (disagreementScore > CALIBRATION_CONFIG.mildDisagreementThreshold) {
        return 'mild';
    }
    return 'agreement';
}

/**
 * Generate human-readable explanation of disagreement
 */
function generateDisagreementExplanation(
    detectorScores: DetectorScore[],
    disagreementType: DisagreementAnalysis['disagreementType'],
    conflictingDetectors: string[],
    stdDev: number
): string {
    const sortedScores = [...detectorScores].sort((a, b) => b.score - a.score);
    const highest = sortedScores[0];
    const lowest = sortedScores[sortedScores.length - 1];

    switch (disagreementType) {
        case 'conflict':
            return `Critical disagreement detected: ${conflictingDetectors.join(', ')}. ` +
                `${highest.name} suggests AI (${(highest.score * 100).toFixed(0)}%) while ` +
                `${lowest.name} suggests real (${(lowest.score * 100).toFixed(0)}%). ` +
                `Human review is strongly recommended.`;

        case 'severe':
            return `Significant disagreement between detectors (σ=${stdDev.toFixed(2)}). ` +
                `Scores range from ${(lowest.score * 100).toFixed(0)}% to ${(highest.score * 100).toFixed(0)}%. ` +
                `Results should be interpreted with caution.`;

        case 'moderate':
            return `Moderate disagreement detected. ${highest.name} is most confident about AI-generation ` +
                `while ${lowest.name} is least certain. Consider the individual detector scores.`;

        case 'mild':
            return `Minor variation between detectors, but general consensus on the classification. ` +
                `Results are reasonably reliable.`;

        case 'agreement':
        default:
            return `All detectors show strong agreement. High confidence in the classification.`;
    }
}

/**
 * MAIN FUNCTION: Apply Disagreement-Aware Confidence Calibration
 * 
 * Novel Formula:
 *   calibrated_score = raw_score × (1 - λ × disagreement)
 *   trust_score = 1 - disagreement
 */
export function calibrateConfidence(
    rawScore: number,
    detectorScores: DetectorScore[]
): CalibratedResult {
    // Calculate disagreement analysis
    const disagreement = calculateDisagreement(detectorScores);

    // Apply calibration formula (NOVEL CONTRIBUTION)
    // When disagreement is high, reduce confidence toward neutral
    const lambda = CALIBRATION_CONFIG.lambda;
    const calibrationFactor = 1 - (lambda * disagreement.disagreementScore);

    // Pull score toward 0.5 (uncertain) when there's disagreement
    const neutral = 0.5;
    const deviation = rawScore - neutral;
    const calibratedDeviation = deviation * calibrationFactor;
    const calibratedScore = neutral + calibratedDeviation;

    // Trust score: inverse of disagreement
    const trustScore = 1 - disagreement.disagreementScore;

    // Determine recommendation
    const recommendation = getRecommendation(calibratedScore, trustScore, disagreement.disagreementType);

    // Generate calibration explanation
    const calibrationExplanation = generateCalibrationExplanation(
        rawScore,
        calibratedScore,
        trustScore,
        disagreement,
        recommendation
    );

    return {
        rawScore,
        calibratedScore,
        trustScore,
        disagreement,
        recommendation,
        calibrationExplanation,
    };
}

/**
 * Determine recommendation based on calibrated results
 */
function getRecommendation(
    calibratedScore: number,
    trustScore: number,
    disagreementType: DisagreementAnalysis['disagreementType']
): CalibratedResult['recommendation'] {
    if (disagreementType === 'conflict') {
        return 'human_review_recommended';
    }
    if (trustScore < 0.5 || disagreementType === 'severe') {
        return 'low_confidence';
    }
    if (trustScore < 0.75 || disagreementType === 'moderate') {
        return 'moderate_confidence';
    }
    return 'high_confidence';
}

/**
 * Generate explanation of calibration process
 */
function generateCalibrationExplanation(
    rawScore: number,
    calibratedScore: number,
    trustScore: number,
    disagreement: DisagreementAnalysis,
    recommendation: CalibratedResult['recommendation']
): string {
    const rawPercent = (rawScore * 100).toFixed(1);
    const calibratedPercent = (calibratedScore * 100).toFixed(1);
    const trustPercent = (trustScore * 100).toFixed(0);
    const adjustmentPercent = ((rawScore - calibratedScore) * 100).toFixed(1);

    let explanation = `Original score: ${rawPercent}% → Calibrated: ${calibratedPercent}% `;

    if (Math.abs(rawScore - calibratedScore) > 0.01) {
        explanation += `(${adjustmentPercent}% adjustment due to detector disagreement). `;
    } else {
        explanation += `(minimal adjustment - detectors agree). `;
    }

    explanation += `Trust level: ${trustPercent}%. `;

    switch (recommendation) {
        case 'human_review_recommended':
            explanation += 'IMPORTANT: Detectors fundamentally disagree. Manual verification is strongly recommended.';
            break;
        case 'low_confidence':
            explanation += 'Confidence is low due to detector disagreement. Treat results with caution.';
            break;
        case 'moderate_confidence':
            explanation += 'Results are reasonably reliable but some detector variation exists.';
            break;
        case 'high_confidence':
            explanation += 'High confidence - all detection methods agree on the classification.';
            break;
    }

    return explanation;
}

/**
 * Get calibration metrics for research/evaluation
 */
export function getCalibrationMetrics(results: CalibratedResult[]): {
    averageTrustScore: number;
    conflictRate: number;
    averageAdjustment: number;
    calibrationEffectiveness: number;
} {
    if (results.length === 0) {
        return {
            averageTrustScore: 0,
            conflictRate: 0,
            averageAdjustment: 0,
            calibrationEffectiveness: 0,
        };
    }

    const avgTrust = results.reduce((sum, r) => sum + r.trustScore, 0) / results.length;
    const conflictCount = results.filter(r => r.disagreement.disagreementType === 'conflict').length;
    const avgAdjustment = results.reduce((sum, r) => sum + Math.abs(r.rawScore - r.calibratedScore), 0) / results.length;

    // Effectiveness: how well calibration reduces false confidence
    // Higher when adjustments correlate with disagreement
    const effectiveness = results.reduce((sum, r) => {
        const adjustment = Math.abs(r.rawScore - r.calibratedScore);
        const shouldAdjust = r.disagreement.disagreementScore > 0.15;
        const didAdjust = adjustment > 0.02;
        return sum + (shouldAdjust === didAdjust ? 1 : 0);
    }, 0) / results.length;

    return {
        averageTrustScore: avgTrust,
        conflictRate: conflictCount / results.length,
        averageAdjustment: avgAdjustment,
        calibrationEffectiveness: effectiveness,
    };
}
