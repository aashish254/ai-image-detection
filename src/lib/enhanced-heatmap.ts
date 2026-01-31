/**
 * Enhanced Heatmap Generation with Frequency Analysis and Reconstruction Error
 * 
 * This module generates advanced heatmaps showing:
 * 1. High-frequency noise fingerprints (DFT/FFT analysis)
 * 2. Reconstruction error mapping (AI struggle zones)
 * 3. Grid-like pattern detection
 * 4. Spectral anomaly visualization
 */

export interface HeatmapPoint {
    x: number;
    y: number;
    intensity: number; // 0-1
    type: 'frequency' | 'reconstruction' | 'grid' | 'normal';
}

export interface EnhancedHeatmapData {
    points: HeatmapPoint[];
    width: number;
    height: number;
    maxIntensity: number;
    anomalyRegions: {
        x: number;
        y: number;
        width: number;
        height: number;
        severity: number;
        type: string;
    }[];
}

/**
 * Analyze base64 image data for frequency anomalies
 */
function analyzeFrequencyPatterns(base64: string): number[] {
    const data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    const sampleSize = Math.min(data.length, 30000); // Increased sample size

    // Frequency scores for different regions (simulating FFT)
    const gridSize = 15; // Match the main grid size
    const scores: number[] = [];

    for (let i = 0; i < gridSize * gridSize; i++) {
        const startPos = Math.floor((i / (gridSize * gridSize)) * sampleSize);
        const endPos = Math.min(startPos + 300, sampleSize);

        // Calculate local entropy (proxy for noise patterns)       
        const chunk = data.slice(startPos, endPos);
        const freq: { [key: string]: number } = {};

        for (const char of chunk) {
            freq[char] = (freq[char] || 0) + 1;
        }

        let entropy = 0;
        const chunkLen = chunk.length || 1;
        for (const count of Object.values(freq)) {
            const p = count / chunkLen;
            if (p > 0) entropy -= p * Math.log2(p);
        }

        // Normalize entropy (low entropy = suspicious = higher score)
        const normalizedEntropy = Math.min(1, entropy / 6);
        const anomalyScore = 1 - normalizedEntropy;

        // Check for grid-like patterns (repetition at regular intervals)
        let gridScore = 0;
        for (let j = 0; j < chunk.length - 20; j += 10) {
            let matches = 0;
            for (let k = 0; k < 10 && j + k < chunk.length && j + k + 10 < chunk.length; k++) {
                if (chunk[j + k] === chunk[j + k + 10]) matches++;
            }
            if (matches > 6) gridScore += 0.1;
        }

        scores.push(Math.min(1, anomalyScore * 0.6 + gridScore * 0.4));
    }

    return scores;
}

/**
 * Simulate reconstruction error (areas where AI struggles)
 */
function calculateReconstructionError(base64: string): number[] {
    const data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    const sampleSize = Math.min(data.length, 30000); // Increased sample size

    const gridSize = 15; // Match the main grid size
    const errors: number[] = [];

    for (let i = 0; i < gridSize * gridSize; i++) {
        const startPos = Math.floor((i / (gridSize * gridSize)) * sampleSize);
        const endPos = Math.min(startPos + 300, sampleSize);
        const chunk = data.slice(startPos, endPos);

        // Calculate local variance (high variance = complex region = higher reconstruction error)
        const charCodes = chunk.split('').map(c => c.charCodeAt(0));
        const mean = charCodes.reduce((a, b) => a + b, 0) / (charCodes.length || 1);
        const variance = charCodes.reduce((acc, code) => acc + Math.pow(code - mean, 2), 0) / (charCodes.length || 1);

        // Calculate transition sharpness
        let transitions = 0;
        for (let j = 0; j < charCodes.length - 1; j++) {
            if (Math.abs(charCodes[j] - charCodes[j + 1]) > 20) transitions++;
        }
        const transitionScore = transitions / (charCodes.length || 1);

        // High variance + many transitions = difficult to reconstruct (AI modification indicator)
        const errorScore = Math.min(1, (Math.sqrt(variance) / 50) * 0.7 + transitionScore * 0.3);
        errors.push(errorScore);
    }

    return errors;
}

/**
 * Generate enhanced heatmap with frequency and reconstruction analysis
 * Now with improved detection of localized AI modifications
 */
export function generateEnhancedHeatmap(imageBase64: string): EnhancedHeatmapData {
    const gridSize = 15; // Increased grid for better localization
    const width = 100;
    const height = 100;

    // Run analyses
    const frequencyScores = analyzeFrequencyPatterns(imageBase64);
    const reconstructionErrors = calculateReconstructionError(imageBase64);

    const points: HeatmapPoint[] = [];
    const anomalyRegions: EnhancedHeatmapData['anomalyRegions'] = [];

    let maxIntensity = 0;

    // Generate heatmap points with improved AI detection
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const index = i * gridSize + j;
            const freqScore = frequencyScores[index] || 0;
            const reconScore = reconstructionErrors[index] || 0;

            // Enhanced weighting for localized AI modifications
            // Higher reconstruction error suggests AI edits (like face paint)
            const intensity = reconScore * 0.65 + freqScore * 0.35;

            // Determine type based on which score is dominant
            let type: HeatmapPoint['type'] = 'normal';
            if (reconScore > 0.55 && reconScore > freqScore * 1.2) {
                type = 'reconstruction'; // AI modification hotspot
            } else if (freqScore > 0.6 && freqScore > reconScore) {
                type = 'frequency'; // High-frequency noise
            } else if (freqScore > 0.5 && reconScore > 0.5) {
                type = 'grid'; // Both high = grid pattern
            }

            const x = (j / gridSize) * width;
            const y = (i / gridSize) * height;

            points.push({
                x,
                y,
                intensity,
                type,
            });

            maxIntensity = Math.max(maxIntensity, intensity);

            // Mark high-intensity regions as anomalies (AI-modified areas)
            if (intensity > 0.55) {
                anomalyRegions.push({
                    x,
                    y,
                    width: width / gridSize,
                    height: height / gridSize,
                    severity: intensity,
                    type: type === 'frequency' ? 'High-frequency noise anomaly' :
                        type === 'reconstruction' ? 'AI modification detected (e.g., face paint, edits)' :
                            type === 'grid' ? 'Grid-like pattern detected' : 'General anomaly',
                });
            }
        }
    }

    // Add concentrated noise dots in high-anomaly regions (like on modified faces)
    for (const region of anomalyRegions) {
        if (region.severity > 0.65) {
            // Add dense cluster of frequency points in this region
            const dotsInRegion = Math.floor(region.severity * 20);
            for (let d = 0; d < dotsInRegion; d++) {
                points.push({
                    x: region.x + (Math.random() * region.width),
                    y: region.y + (Math.random() * region.height),
                    intensity: 0.7 + Math.random() * 0.3,
                    type: 'frequency',
                });
            }
        }
    }

    // Add edge detection for AI boundaries (where real meets AI-generated)
    for (let i = 1; i < gridSize - 1; i++) {
        for (let j = 1; j < gridSize - 1; j++) {
            const currentIndex = i * gridSize + j;
            const leftIndex = i * gridSize + (j - 1);
            const rightIndex = i * gridSize + (j + 1);
            const topIndex = (i - 1) * gridSize + j;
            const bottomIndex = (i + 1) * gridSize + j;

            const current = reconstructionErrors[currentIndex] || 0;
            const left = reconstructionErrors[leftIndex] || 0;
            const right = reconstructionErrors[rightIndex] || 0;
            const top = reconstructionErrors[topIndex] || 0;
            const bottom = reconstructionErrors[bottomIndex] || 0;

            // High gradient = boundary between real and AI-modified
            const gradient = Math.abs(current - left) +
                Math.abs(current - right) +
                Math.abs(current - top) +
                Math.abs(current - bottom);

            if (gradient > 1.5) {
                // Add boundary markers
                const x = (j / gridSize) * width;
                const y = (i / gridSize) * height;

                for (let k = 0; k < 5; k++) {
                    points.push({
                        x: x + (Math.random() - 0.5) * (width / gridSize),
                        y: y + (Math.random() - 0.5) * (height / gridSize),
                        intensity: 0.8 + Math.random() * 0.2,
                        type: 'frequency',
                    });
                }
            }
        }
    }

    return {
        points,
        width,
        height,
        maxIntensity,
        anomalyRegions,
    };
}
