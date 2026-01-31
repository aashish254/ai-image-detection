// Analysis Result Types
export interface AnalysisResult {
    id: string;
    verdict: 'AI_GENERATED' | 'LIKELY_AI' | 'UNCERTAIN' | 'LIKELY_REAL' | 'REAL';
    confidence: number;
    timestamp: string;
    cached: boolean;

    // Individual detector scores
    detectors: {
        huggingface: DetectorResult;
        visionLLM: VisionLLMResult;
        dctAnalysis: DCTResult;
    };

    // Weighted fusion breakdown
    fusion: FusionResult;

    // NOVEL: Calibration results
    calibration: CalibrationResult;

    // NOVEL: Spatial analysis results
    spatialAnalysis: SpatialAnalysisResult;

    // Detected artifacts
    artifacts: Artifact[];

    // Human-readable explanation
    explanation: string;

    // Educational insights
    insights: EducationalInsight[];
}

export interface FusionResult {
    huggingfaceWeight: number;
    visionLLMWeight: number;
    dctWeight: number;
    finalScore: number;

    // NOVEL: Dynamic weighting info
    dynamicWeighting: {
        enabled: boolean;
        staticScore: number;
        dynamicScore: number;
        weightAdjustments: string;
    };
}

// NOVEL: Calibration Result from DACC algorithm
export interface CalibrationResult {
    rawScore: number;
    calibratedScore: number;
    trustScore: number;
    disagreementType: 'agreement' | 'mild' | 'moderate' | 'severe' | 'conflict';
    disagreementScore: number;
    recommendation: 'high_confidence' | 'moderate_confidence' | 'low_confidence' | 'human_review_recommended';
    explanation: string;
}

// NOVEL: Spatial Analysis Result from SAM algorithm
export interface SpatialAnalysisResult {
    heatmapData: HeatmapCell[];
    hotspots: Hotspot[];
    uniformityScore: number;
    isLikelyComposite: boolean;
    spatialExplanation: string;
}

export interface HeatmapCell {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
    color: string;
    opacity: number;
}

export interface Hotspot {
    region: string;
    score: number;
    anomalies: string[];
    severity: 'low' | 'medium' | 'high';
}

export interface DetectorResult {
    name: string;
    score: number;
    confidence: number;
    status: 'success' | 'error' | 'fallback';
    error?: string;
    processingTime: number;
}

export interface VisionLLMResult extends DetectorResult {
    analysis: {
        overallAssessment: string;
        artifactsDetected: ArtifactDescription[];
        semanticIssues: string[];
        confidenceExplanation: string;
    };
    regionAnalysis?: RegionAnalysis;
    internalConfidence?: number;
}

export interface RegionAnalysis {
    topLeft: { aiScore: number; anomalies: string[] };
    topRight: { aiScore: number; anomalies: string[] };
    bottomLeft: { aiScore: number; anomalies: string[] };
    bottomRight: { aiScore: number; anomalies: string[] };
    center: { aiScore: number; anomalies: string[] };
}

export interface DCTResult extends DetectorResult {
    frequencyAnalysis: {
        highFrequencyRatio: number;
        spectralAnomalies: number;
        blockingArtifacts: number;
        compressionPatterns: string;
    };
}

export interface Artifact {
    id: string;
    type: ArtifactType;
    description: string;
    severity: 'low' | 'medium' | 'high';
    location?: BoundingBox;
    region?: string;
}

export interface ArtifactDescription {
    type: string;
    description: string;
    confidence: number;
    region?: string;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type ArtifactType =
    | 'lighting_inconsistency'
    | 'anatomical_anomaly'
    | 'texture_irregularity'
    | 'reflection_error'
    | 'shadow_inconsistency'
    | 'semantic_error'
    | 'compression_artifact'
    | 'frequency_anomaly'
    | 'edge_artifact'
    | 'other';

export interface EducationalInsight {
    title: string;
    description: string;
    category: 'technical' | 'visual' | 'semantic' | 'general' | 'novel';
}

// API Request/Response Types
export interface AnalyzeRequest {
    image: string; // Base64 encoded image
    options?: AnalyzeOptions;
}

export interface AnalyzeOptions {
    skipCache?: boolean;
    detailLevel?: 'basic' | 'detailed' | 'comprehensive';
    enabledDetectors?: ('huggingface' | 'visionLLM' | 'dct')[];
    // NOVEL: Enable/disable novel features
    enableCalibration?: boolean;
    enableSpatialAnalysis?: boolean;
    enableDynamicWeights?: boolean;
}

export interface AnalyzeResponse {
    success: boolean;
    result?: AnalysisResult;
    error?: string;
}

// Detector Configuration
export interface DetectorConfig {
    huggingface: {
        model: string;
        weight: number;
    };
    visionLLM: {
        provider: 'gemini' | 'openai' | 'anthropic';
        model: string;
        weight: number;
    };
    dct: {
        blockSize: number;
        threshold: number;
        weight: number;
    };
}

// Cache Types
export interface CacheEntry {
    hash: string;
    result: AnalysisResult;
    timestamp: number;
    expiresAt: number;
}

// History Types
export interface AnalysisHistoryItem {
    id: string;
    imageHash: string;
    thumbnailUrl?: string;
    verdict: AnalysisResult['verdict'];
    confidence: number;
    timestamp: string;
}

// Research Metrics Types (for paper)
export interface ResearchMetrics {
    calibrationMetrics: {
        averageTrustScore: number;
        conflictRate: number;
        averageAdjustment: number;
        calibrationEffectiveness: number;
    };
    spatialMetrics: {
        hotspotCount: number;
        averageHotspotScore: number;
        uniformityScore: number;
        compositeDetected: boolean;
    };
    dynamicWeightingMetrics: {
        averageWeightShift: number;
        frequencyOfAdjustment: number;
        impactOnScores: number;
    };
}

// =================================================================
// NOVEL CONTRIBUTION TYPES (2026)
// =================================================================

// NOVEL #1: Frequency-Spatial Fusion Network Result
export interface FSFNAnalysisResult {
    frequencyDomain: {
        lowFrequencyAnomaly: number;
        midFrequencyAnomaly: number;
        highFrequencyAnomaly: number;
        spectralFingerprint: number[];
        frequencyScore: number;
    };
    spatialDomain: {
        edgeAnomaly: number;
        textureAnomaly: number;
        colorAnomaly: number;
        spatialScore: number;
    };
    fusion: {
        fusionScore: number;
        fusionConfidence: number;
        domainAgreement: number;
        attentionWeights: {
            frequencyWeight: number;
            spatialWeight: number;
        };
    };
    explanation: string;
}

// NOVEL #2: Explainable AI Result
export interface XAIAnalysisResult {
    summary: string;
    attentionMap: {
        grid: number[][];
        hotspots: { x: number; y: number; value: number }[];
        distribution: 'concentrated' | 'distributed' | 'uniform';
    };
    regions: XAIRegionResult[];
    keyFactors: {
        name: string;
        contribution: number;
        direction: 'ai' | 'real' | 'neutral';
        explanation: string;
    }[];
    explanationConfidence: number;
}

export interface XAIRegionResult {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    importance: number;
    category: string;
    finding: string;
    confidence: number;
}

// NOVEL #3: Uncertainty Quantification Result
export interface UncertaintyAnalysisResult {
    prediction: number;
    confidenceInterval: {
        lower: number;
        upper: number;
        level: number;
    };
    standardDeviation: number;
    uncertaintyDecomposition: {
        aleatoric: number;
        epistemic: number;
        total: number;
    };
    reliability: {
        score: number;
        level: 'high' | 'moderate' | 'low' | 'very_low';
        humanReviewRecommended: boolean;
        reason: string;
    };
    recommendation: string;
}

// Extended Analysis Result with all novel contributions
export interface ExtendedAnalysisResult extends AnalysisResult {
    // NOVEL: Frequency-Spatial Fusion
    fsfnAnalysis?: FSFNAnalysisResult;

    // NOVEL: Explainable AI
    xaiAnalysis?: XAIAnalysisResult;

    // NOVEL: Uncertainty Quantification
    uncertaintyAnalysis?: UncertaintyAnalysisResult;

    // NOVEL #4: GAN Fingerprint Identification
    ganIdentification?: GANIdentificationResult;
}

// NOVEL #4: GAN Fingerprint Identification Result
export interface GANIdentificationResult {
    isAIGenerated: boolean;
    aiConfidence: number;
    identifiedGenerator: {
        name: string;
        confidence: number;
        matchScore: number;
        matchingFeatures: string[];
        version?: string;
    } | null;
    allMatches: {
        name: string;
        confidence: number;
        matchingFeatures: string[];
    }[];
    extractedFingerprint: {
        spectralSignature: number[];
        colorProfile: {
            saturationMean: number;
            saturationVariance: number;
            hueDominant: number;
            colorTemperature: string;
        };
        textureProfile: {
            smoothness: number;
            repetitiveness: number;
            detailLevel: number;
        };
    };
    analysis: {
        spectralMatch: string;
        colorMatch: string;
        textureMatch: string;
        overallAssessment: string;
    };
}
