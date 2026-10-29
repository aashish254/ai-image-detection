/**
 * Frequency-domain read, measured from the file's own pixels.
 */

'use client';

import { useState, useEffect } from 'react';
import { pct } from '@/lib/report';
import MeasureRow from './MeasureRow';
import { performFFTAnalysis, FFTAnalysisResult } from '@/lib/fft-analysis';

interface SpectralVisualizerProps {
    imageBase64: string;
}

const PLOT_WIDTH = 600;
const PLOT_HEIGHT = 140;

export default function SpectralVisualizer({ imageBase64 }: SpectralVisualizerProps) {
    const [fftData, setFFTData] = useState<FFTAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        setIsAnalyzing(true);
        const timer = setTimeout(() => {
            setFFTData(performFFTAnalysis(imageBase64));
            setIsAnalyzing(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [imageBase64]);

    if (isAnalyzing) {
        return <p className="dp-none">Measuring the frequency spectrum of this file…</p>;
    }

    if (!fftData) {
        return (
            <p className="dp-none">
                The frequency read did not complete for this file. Every other tab still shows what
                it measured.
            </p>
        );
    }

    // Bin 0 is average brightness rather than a frequency; leaving it out of the
    // plot keeps it from flattening every other bin.
    const total = fftData.spectrumData.length;
    const bins = fftData.spectrumData.slice(1);
    const maxMagnitude = Math.max(...bins, 0.01);
    const binWidth = PLOT_WIDTH / total;
    const peaks = fftData.peakFrequencies.slice(0, 5);

    return (
        <div className="doc-entry spectral-read">
            <span className="ab">FFT</span>
            <div>
                <h3>Frequency spectrum of the file itself</h3>
                <p>
                    Computed here in your browser from the pixels you uploaded — no model and no
                    network call. Generated pictures tend to lose energy at the high end and to
                    repeat themselves at particular frequencies, which is what the plot below shows.
                </p>

                <figure className="dp-fig">
                    <figcaption>
                        Amplitude by frequency across {total} bins, with the first left off because
                        it is average brightness rather than a frequency. Left is the coarsest
                        detail, right the finest.
                        {peaks.length > 0
                            ? ' Marks sit on bins that peaked outright.'
                            : ' No bin peaked outright, so nothing is marked.'}
                    </figcaption>
                    <svg
                        className="spectrum"
                        viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
                        preserveAspectRatio="none"
                        role="img"
                        aria-label="Frequency spectrum"
                    >
                        <line
                            x1="0"
                            y1={PLOT_HEIGHT - 0.5}
                            x2={PLOT_WIDTH}
                            y2={PLOT_HEIGHT - 0.5}
                            className="baseline"
                        />
                        {bins.map((magnitude, index) => {
                            const height = (magnitude / maxMagnitude) * (PLOT_HEIGHT - 8);
                            return (
                                <rect
                                    key={index}
                                    x={(index + 1) * binWidth}
                                    y={PLOT_HEIGHT - height}
                                    width={Math.max(binWidth - 0.6, 0.6)}
                                    height={height}
                                    className="bin"
                                />
                            );
                        })}
                        {peaks.map((peak, index) => {
                            const x = peak.freq * PLOT_WIDTH;
                            const y =
                                PLOT_HEIGHT - (peak.magnitude / maxMagnitude) * (PLOT_HEIGHT - 8);
                            return (
                                <line
                                    key={`peak-${index}`}
                                    x1={x}
                                    y1={y - 5}
                                    x2={x}
                                    y2={PLOT_HEIGHT}
                                    className="peak-mark"
                                />
                            );
                        })}
                    </svg>
                    <div className="spectrum-scale">
                        <span>coarsest</span>
                        <span>coarse</span>
                        <span>mid</span>
                        <span>fine</span>
                        <span>finest</span>
                    </div>
                </figure>

                <p className="dp-sub">Where the energy sits</p>
                <div className="ro-rows">
                    <MeasureRow name="Low frequencies" value={fftData.frequencyBands.low} tone="neutral" />
                    <MeasureRow name="Mid frequencies" value={fftData.frequencyBands.mid} tone="neutral" />
                    <MeasureRow name="High frequencies" value={fftData.frequencyBands.high} tone="neutral" />
                    <MeasureRow name="Finest detail" value={fftData.frequencyBands.veryHigh} tone="neutral" />
                </div>

                <p className="dp-sub">What the shape of that curve implies</p>
                <div className="ro-rows">
                    <MeasureRow
                        name="Smoothness — thin high end"
                        value={fftData.smoothnessScore}
                        tone="neutral"
                    />
                    <MeasureRow
                        name="Periodicity — repeated bands"
                        value={fftData.periodicityScore}
                        tone="neutral"
                    />
                    <MeasureRow
                        name="Spread across bands"
                        value={fftData.spectralEntropy}
                        tone="neutral"
                    />
                    <MeasureRow
                        lead
                        name="This read alone says synthetic"
                        value={fftData.aiLikelihood}
                    />
                </div>

                {peaks.length > 0 ? (
                    <>
                        <p className="dp-sub">Peaked bins</p>
                        <div className="doc-fields">
                            {peaks.map((peak, index) => (
                                <div key={index}>
                                    <span className="fl">Peak {index + 1}</span>
                                    <span className="fv dim">
                                        at {pct(peak.freq, 1)} of the range · amplitude{' '}
                                        {pct(peak.magnitude, 1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="dp-note">
                            A bright peak means the file repeats something at one rate. Fabricated
                            grids and upscaled textures do that; a photograph usually does not.
                            One peak on its own is not a finding — it is read together with the rest.
                        </p>
                    </>
                ) : (
                    <p className="dp-note">
                        No bin rose clearly above its neighbours, so this curve carries no repeated
                        structure to report.
                    </p>
                )}
            </div>

            <style jsx>{`
                .spectral-read {
                    min-width: 0;
                }

                .spectrum {
                    display: block;
                    width: 100%;
                    height: 140px;
                    border: 1px solid var(--rule);
                    background: var(--sheet-sunk);
                }

                .spectrum .baseline {
                    stroke: var(--rule-strong);
                    stroke-width: 1;
                }

                .spectrum .bin {
                    fill: var(--graphite);
                }

                .spectrum .peak-mark {
                    stroke: var(--ink);
                    stroke-width: 1.5;
                }

                .spectrum-scale {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 7px;
                    font-family: var(--font-mono);
                    font-size: 0.875rem;
                    color: var(--muted);
                }

                @media (max-width: 620px) {
                    .spectrum {
                        height: 108px;
                    }
                }
            `}</style>
        </div>
    );
}
