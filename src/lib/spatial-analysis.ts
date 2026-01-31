/**
 * NOVEL CONTRIBUTION #2: Spatial Artifact Mapping (SAM)
 * 
 * This module implements a novel approach to AI-generated image detection
 * that provides spatial localization of artifacts through region-based analysis.
 * 
 * Paper Reference: "Spatial Artifact Mapping for Localized AI-Generated Content Detection"
 * 
 * Key Innovation:
 * Traditional detection analyzes entire images and outputs a single score.
 * Our approach divides images into regions and generates a heatmap showing
 * WHERE AI artifacts are most concentrated, enabling:
 * 1. Detection of composite/partially-edited images
 * 2. Visual explanation of detection results
 * 3. Localized forensic analysis
 * 
 * Authors: Rahul Yadav, Aashish Kumar Mahato, Bibek Gami
 */

import { RegionAnalysis } from './detectors/vision-llm';

export interface SpatialGrid {
    rows: number;
    cols: number;
    cells: SpatialCell[][];
}

export interface SpatialCell {
    row: number;
    col: number;
    aiScore: number;
    anomalies: string[];
    // Normalized coordinates (0-1)
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface HeatmapData {
    // Grid of AI probability scores
    grid: SpatialGrid;

    // Overall spatial analysis results
    summary: {
        hotspots: Hotspot[];
        uniformityScore: number;
        suspiciousRegions: string[];
        isLikelyComposite: boolean;
    };

    // Color-coded data for visualization
    colorMap: ColorMapCell[];

    // Explanation for user
    spatialExplanation: string;
}

export interface Hotspot {
    region: string;
    score: number;
    anomalies: string[];
    severity: 'low' | 'medium' | 'high';
}

export interface ColorMapCell {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
    color: string;
    opacity: number;
}

// Grid configuration
const GRID_CONFIG = {
    defaultRows: 3,
    defaultCols: 3,
    // Threshold for considering a region "suspicious"
    suspiciousThreshold: 0.6,
    // Threshold for detecting likely composite images
    compositeVarianceThreshold: 0.25,
};

/**
 * Convert VLM region analysis to spatial grid format
 */
export function createSpatialGridFromVLM(
    regionAnalysis: RegionAnalysis,
    dctRegionScores?: number[][]
): SpatialGrid {
    // Create a 3x3 grid mapping VLM regions
    const grid: SpatialCell[][] = [];

    // Map VLM regions to grid positions
    // [topLeft, topCenter, topRight]
    // [middleLeft, center, middleRight]
    // [bottomLeft, bottomCenter, bottomRight]

    const regionMapping = [
        [regionAnalysis.topLeft, interpolateRegion(regionAnalysis.topLeft, regionAnalysis.topRight), regionAnalysis.topRight],
        [interpolateRegion(regionAnalysis.topLeft, regionAnalysis.bottomLeft), regionAnalysis.center, interpolateRegion(regionAnalysis.topRight, regionAnalysis.bottomRight)],
        [regionAnalysis.bottomLeft, interpolateRegion(regionAnalysis.bottomLeft, regionAnalysis.bottomRight), regionAnalysis.bottomRight],
    ];

    for (let row = 0; row < 3; row++) {
        grid[row] = [];
        for (let col = 0; col < 3; col++) {
            const region = regionMapping[row][col];
            let aiScore = region.aiScore;

            // Combine with DCT analysis if available
            if (dctRegionScores && dctRegionScores[row] && dctRegionScores[row][col] !== undefined) {
                // Weighted combination: 70% VLM, 30% DCT
                aiScore = aiScore * 0.7 + dctRegionScores[row][col] * 0.3;
            }

            grid[row][col] = {
                row,
                col,
                aiScore,
                anomalies: region.anomalies || [],
                bounds: {
                    x: col / 3,
                    y: row / 3,
                    width: 1 / 3,
                    height: 1 / 3,
                },
            };
        }
    }

    return {
        rows: 3,
        cols: 3,
        cells: grid,
    };
}

/**
 * Interpolate between two regions for grid cells without direct VLM data
 */
function interpolateRegion(
    region1: { aiScore: number; anomalies: string[] },
    region2: { aiScore: number; anomalies: string[] }
): { aiScore: number; anomalies: string[] } {
    return {
        aiScore: (region1.aiScore + region2.aiScore) / 2,
        anomalies: [], // Interpolated regions don't have specific anomalies
    };
}

/**
 * MAIN FUNCTION: Generate comprehensive heatmap data
 */
export function generateHeatmapData(
    regionAnalysis: RegionAnalysis,
    dctRegionScores?: number[][]
): HeatmapData {
    // Create spatial grid
    const grid = createSpatialGridFromVLM(regionAnalysis, dctRegionScores);

    // Identify hotspots (high AI probability regions)
    const hotspots = identifyHotspots(grid);

    // Calculate uniformity score
    const uniformityScore = calculateUniformity(grid);

    // Identify suspicious regions
    const suspiciousRegions = getSuspiciousRegions(grid);

    // Determine if likely composite
    const isLikelyComposite = detectCompositeImage(grid, uniformityScore);

    // Generate color map for visualization
    const colorMap = generateColorMap(grid);

    // Generate explanation
    const spatialExplanation = generateSpatialExplanation(
        hotspots,
        uniformityScore,
        suspiciousRegions,
        isLikelyComposite
    );

    return {
        grid,
        summary: {
            hotspots,
            uniformityScore,
            suspiciousRegions,
            isLikelyComposite,
        },
        colorMap,
        spatialExplanation,
    };
}

/**
 * Identify regions with high AI probability (hotspots)
 */
function identifyHotspots(grid: SpatialGrid): Hotspot[] {
    const hotspots: Hotspot[] = [];
    const regionNames = [
        ['Top-Left', 'Top-Center', 'Top-Right'],
        ['Middle-Left', 'Center', 'Middle-Right'],
        ['Bottom-Left', 'Bottom-Center', 'Bottom-Right'],
    ];

    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            const cell = grid.cells[row][col];
            if (cell.aiScore >= GRID_CONFIG.suspiciousThreshold) {
                hotspots.push({
                    region: regionNames[row][col],
                    score: cell.aiScore,
                    anomalies: cell.anomalies,
                    severity: cell.aiScore >= 0.8 ? 'high' : cell.aiScore >= 0.65 ? 'medium' : 'low',
                });
            }
        }
    }

    // Sort by score (highest first)
    return hotspots.sort((a, b) => b.score - a.score);
}

/**
 * Calculate uniformity score (how consistent AI detection is across regions)
 * Low uniformity may indicate composite images
 */
function calculateUniformity(grid: SpatialGrid): number {
    const allScores: number[] = [];

    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            allScores.push(grid.cells[row][col].aiScore);
        }
    }

    // Calculate variance
    const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const variance = allScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / allScores.length;
    const stdDev = Math.sqrt(variance);

    // Uniformity is inverse of normalized standard deviation
    // Higher uniformity = more consistent detection across regions
    return Math.max(0, 1 - (stdDev * 2));
}

/**
 * Get list of suspicious region names
 */
function getSuspiciousRegions(grid: SpatialGrid): string[] {
    const regions: string[] = [];
    const regionNames = [
        ['top-left', 'top-center', 'top-right'],
        ['middle-left', 'center', 'middle-right'],
        ['bottom-left', 'bottom-center', 'bottom-right'],
    ];

    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            if (grid.cells[row][col].aiScore >= GRID_CONFIG.suspiciousThreshold) {
                regions.push(regionNames[row][col]);
            }
        }
    }

    return regions;
}

/**
 * NOVEL FEATURE: Detect likely composite images
 * If some regions are clearly AI while others are clearly real,
 * the image may be a composite (partially AI-edited)
 */
function detectCompositeImage(grid: SpatialGrid, uniformity: number): boolean {
    // Low uniformity suggests different parts have different origins
    if (uniformity < 0.5) {
        const allScores: number[] = [];
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                allScores.push(grid.cells[row][col].aiScore);
            }
        }

        const minScore = Math.min(...allScores);
        const maxScore = Math.max(...allScores);
        const range = maxScore - minScore;

        // If there's both very low and very high scores, likely composite
        if (range > GRID_CONFIG.compositeVarianceThreshold &&
            minScore < 0.35 && maxScore > 0.65) {
            return true;
        }
    }

    return false;
}

/**
 * Generate color map for heatmap visualization
 */
function generateColorMap(grid: SpatialGrid): ColorMapCell[] {
    const colorMap: ColorMapCell[] = [];

    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            const cell = grid.cells[row][col];
            const color = scoreToColor(cell.aiScore);

            colorMap.push({
                x: cell.bounds.x,
                y: cell.bounds.y,
                width: cell.bounds.width,
                height: cell.bounds.height,
                score: cell.aiScore,
                color,
                opacity: 0.3 + (cell.aiScore * 0.4), // 0.3 to 0.7 opacity
            });
        }
    }

    return colorMap;
}

/**
 * Convert AI probability score to color
 * Green (real) → Yellow (uncertain) → Red (AI)
 */
function scoreToColor(score: number): string {
    if (score < 0.35) {
        // Green - likely real
        const intensity = Math.round(200 - score * 100);
        return `rgb(34, ${intensity}, 94)`;
    } else if (score < 0.65) {
        // Yellow - uncertain
        const redIntensity = Math.round(180 + (score - 0.35) * 200);
        return `rgb(${redIntensity}, 179, 8)`;
    } else {
        // Red - likely AI
        const greenIntensity = Math.round(100 - (score - 0.65) * 200);
        return `rgb(239, ${Math.max(0, greenIntensity)}, 68)`;
    }
}

/**
 * Generate human-readable spatial explanation
 */
function generateSpatialExplanation(
    hotspots: Hotspot[],
    uniformity: number,
    suspiciousRegions: string[],
    isLikelyComposite: boolean
): string {
    let explanation = '';

    if (isLikelyComposite) {
        explanation += 'ATTENTION: This image shows characteristics of a COMPOSITE (partially AI-generated/edited) image. ';
        explanation += 'Different regions have significantly different AI detection scores. ';
    }

    if (hotspots.length === 0) {
        explanation += 'No specific regions show strong indicators of AI generation. ';
        explanation += 'The image appears relatively uniform in its authenticity. ';
    } else if (hotspots.length === 1) {
        const hot = hotspots[0];
        explanation += `The ${hot.region} region shows the strongest AI indicators (${(hot.score * 100).toFixed(0)}%). `;
        if (hot.anomalies.length > 0) {
            explanation += `Detected issues: ${hot.anomalies.join(', ')}. `;
        }
    } else {
        explanation += `${hotspots.length} regions show significant AI indicators: `;
        explanation += hotspots.slice(0, 3).map(h => `${h.region} (${(h.score * 100).toFixed(0)}%)`).join(', ');
        explanation += '. ';
    }

    if (uniformity > 0.8) {
        explanation += 'AI detection is highly uniform across the image. ';
    } else if (uniformity < 0.5) {
        explanation += 'Detection varies significantly across regions, suggesting possible editing or composition. ';
    }

    return explanation;
}

/**
 * Get region scores as simple array for DCT analysis integration
 */
export function getRegionScoresArray(grid: SpatialGrid): number[][] {
    const scores: number[][] = [];
    for (let row = 0; row < grid.rows; row++) {
        scores[row] = [];
        for (let col = 0; col < grid.cols; col++) {
            scores[row][col] = grid.cells[row][col].aiScore;
        }
    }
    return scores;
}

/**
 * Calculate spatial analysis metrics for research
 */
export function getSpatialMetrics(heatmapData: HeatmapData): {
    hotspotCount: number;
    averageHotspotScore: number;
    uniformityScore: number;
    compositeDetected: boolean;
    spatialVariance: number;
} {
    const hotspots = heatmapData.summary.hotspots;
    const avgHotspot = hotspots.length > 0
        ? hotspots.reduce((sum, h) => sum + h.score, 0) / hotspots.length
        : 0;

    // Calculate spatial variance
    const allScores = heatmapData.colorMap.map(c => c.score);
    const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const variance = allScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / allScores.length;

    return {
        hotspotCount: hotspots.length,
        averageHotspotScore: avgHotspot,
        uniformityScore: heatmapData.summary.uniformityScore,
        compositeDetected: heatmapData.summary.isLikelyComposite,
        spatialVariance: variance,
    };
}
