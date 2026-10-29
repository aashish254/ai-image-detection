'use client';

interface SpectralStripProps {
    /** Normalised energy per band, low frequency first. */
    values: number[];
    caption: string;
}

/**
 * One band strip, drawn the same way everywhere it appears: graphite bars on a
 * ruled baseline, the peak in ink so the eye lands on it without a legend.
 */
export default function SpectralStrip({ values, caption }: SpectralStripProps) {
    if (values.length === 0) return null;

    const peakIndex = values.reduce((best, value, i) => (value > values[best] ? i : best), 0);
    const floorIndex = values.reduce((low, value, i) => (value < values[low] ? i : low), 0);

    return (
        <figure className="dp-fig">
            <figcaption>{caption}</figcaption>
            <div className="spec-bars">
                {values.map((value, i) => (
                    <div
                        className={`spec-bar${i === peakIndex ? ' peak' : ''}`}
                        key={i}
                        style={{ height: `${Math.max(2, Math.round(value * 100))}%` }}
                        title={`F${i + 1} · ${value.toFixed(2)}`}
                    />
                ))}
            </div>
            <div className="spec-scale">
                {values.map((_, i) => (
                    <span key={i}>F{i + 1}</span>
                ))}
            </div>
            <p className="spec-note">
                peak {values[peakIndex].toFixed(2)} at F{peakIndex + 1} · weakest{' '}
                {values[floorIndex].toFixed(2)} at F{floorIndex + 1} · {values.length} bands
            </p>

            <style jsx>{`
                .spec-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 6px;
                    height: 72px;
                    border-bottom: 1px solid var(--rule);
                }

                .spec-bar {
                    flex: 1 1 0;
                    min-width: 0;
                    background: var(--rule-strong);
                }

                .spec-bar.peak {
                    background: var(--ink);
                }

                .spec-scale {
                    display: flex;
                    gap: 6px;
                    margin-top: 7px;
                }

                .spec-scale span {
                    flex: 1 1 0;
                    min-width: 0;
                    text-align: center;
                    font-family: var(--font-mono);
                    font-size: 0.875rem;
                    color: var(--muted);
                }

                .spec-note {
                    margin: 10px 0 0;
                    font-family: var(--font-mono);
                    font-size: 0.875rem;
                    color: var(--graphite);
                }
            `}</style>
        </figure>
    );
}
