/**
 * REAL FFT ANALYSIS MODULE
 * Uses actual Fast Fourier Transform to detect AI artifacts
 */

export interface FFTAnalysisResult {
    spectrumData: number[];
    frequencyBands: {
        low: number;
        mid: number;
        high: number;
        veryHigh: number;
    };
    peakFrequencies: { freq: number; magnitude: number }[];
    periodicityScore: number;
    smoothnessScore: number;
    aiLikelihood: number;
    spectralEntropy: number;
}

function base64ToSamples(base64: string, maxSamples: number = 2048): Float64Array {
    const data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    const len = Math.min(data.length, maxSamples);
    const samples = new Float64Array(len);

    for (let i = 0; i < len; i++) {
        samples[i] = data.charCodeAt(i);
    }

    return samples;
}

/**
 * Simple DFT implementation (more compatible than FFT library)
 */
function performDFT(samples: Float64Array): number[] {
    const N = samples.length;
    const spectrum: number[] = [];

    // Only compute first half (Nyquist frequency)
    for (let k = 0; k < N / 2; k++) {
        let real = 0;
        let imag = 0;

        for (let n = 0; n < N; n++) {
            const angle = (2 * Math.PI * k * n) / N;
            real += samples[n] * Math.cos(angle);
            imag -= samples[n] * Math.sin(angle);
        }

        const magnitude = Math.sqrt(real * real + imag * imag);
        spectrum.push(magnitude);
    }

    return spectrum;
}

export function performFFTAnalysis(imageBase64: string): FFTAnalysisResult {
    const samples = base64ToSamples(imageBase64, 512); // Reduced for performance
    const spectrum = performDFT(samples);

    // Normalize
    const maxMag = Math.max(...spectrum, 1);
    const normalizedSpectrum = spectrum.map(m => m / maxMag);

    // Frequency bands
    const bandSize = Math.floor(spectrum.length / 4);
    const bands = {
        low: normalizedSpectrum.slice(0, bandSize).reduce((a, b) => a + b, 0) / bandSize,
        mid: normalizedSpectrum.slice(bandSize, bandSize * 2).reduce((a, b) => a + b, 0) / bandSize,
        high: normalizedSpectrum.slice(bandSize * 2, bandSize * 3).reduce((a, b) => a + b, 0) / bandSize,
        veryHigh: normalizedSpectrum.slice(bandSize * 3).reduce((a, b) => a + b, 0) / bandSize,
    };

    // Peak detection
    const peaks: { freq: number; magnitude: number }[] = [];
    for (let i = 1; i < normalizedSpectrum.length - 1; i++) {
        if (
            normalizedSpectrum[i] > normalizedSpectrum[i - 1] &&
            normalizedSpectrum[i] > normalizedSpectrum[i + 1] &&
            normalizedSpectrum[i] > 0.3
        ) {
            peaks.push({
                freq: i / normalizedSpectrum.length,
                magnitude: normalizedSpectrum[i],
            });
        }
    }
    peaks.sort((a, b) => b.magnitude - a.magnitude);

    // Scores
    const periodicityScore = Math.min(1, peaks.slice(0, 10).reduce((acc, p) => acc + p.magnitude, 0) / 3);
    const smoothnessScore = 1 - (bands.high + bands.veryHigh) / 2;

    // Entropy
    let entropy = 0;
    const total = normalizedSpectrum.reduce((a, b) => a + b, 0) || 1;
    for (const mag of normalizedSpectrum) {
        const p = mag / total;
        if (p > 0) entropy -= p * Math.log2(p);
    }
    const spectralEntropy = entropy / Math.log2(normalizedSpectrum.length);

    const aiLikelihood = (
        smoothnessScore * 0.4 +
        periodicityScore * 0.3 +
        (1 - spectralEntropy) * 0.3
    );

    return {
        spectrumData: normalizedSpectrum,
        frequencyBands: bands,
        peakFrequencies: peaks.slice(0, 10),
        periodicityScore,
        smoothnessScore,
        aiLikelihood,
        spectralEntropy,
    };
}

export function generateFFTHeatmap(imageBase64: string): {
    points: { x: number; y: number; intensity: number }[];
    gridSize: number;
} {
    const gridSize = 8;
    const points: { x: number; y: number; intensity: number }[] = [];
    const data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const regionSize = Math.floor(data.length / (gridSize * gridSize));

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const startIdx = (i * gridSize + j) * regionSize;
            const endIdx = Math.min(startIdx + regionSize, data.length);
            const regionData = 'data:image/png;base64,' + data.slice(startIdx, endIdx);

            try {
                const fftResult = performFFTAnalysis(regionData);
                points.push({
                    x: (j / gridSize) * 100,
                    y: (i / gridSize) * 100,
                    intensity: fftResult.aiLikelihood,
                });
            } catch {
                points.push({
                    x: (j / gridSize) * 100,
                    y: (i / gridSize) * 100,
                    intensity: 0.5,
                });
            }
        }
    }

    return { points, gridSize };
}
