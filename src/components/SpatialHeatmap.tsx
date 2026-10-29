'use client';

import { useState } from 'react';
import { SEVERITY_TONE, pct, readable } from '@/lib/report';
import type { ForensicReport, HeatmapCell, SpatialAnalysisResult } from '@/lib/types';
import MeasureRow from './MeasureRow';

interface SpatialHeatmapProps {
    spatialAnalysis: SpatialAnalysisResult;
    imageUrl?: string;
    forensicReport?: ForensicReport;
}

const STEPS = [0, 0.25, 0.5, 0.75, 1];

export default function SpatialHeatmap({
    spatialAnalysis,
    imageUrl,
    forensicReport,
}: SpatialHeatmapProps) {
    const [showOverlay, setShowOverlay] = useState(true);
    const [showPoints, setShowPoints] = useState(true);
    const [selected, setSelected] = useState<HeatmapCell | null>(null);

    if (!spatialAnalysis.spatialDataReliable) {
        return (
            <p className="dp-none">
                No region-by-region measurement came back for this file, so there is no spatial map
                to draw. The verdict and the other tabs are unaffected — none of them depend on this
                read. The map appears here as soon as the region analysis returns real per-region
                numbers.
            </p>
        );
    }

    const cells = spatialAnalysis.heatmapData;
    const distinct = (values: number[]) =>
        values.filter((value, index) => values.indexOf(value) === index).sort((a, b) => a - b);
    const xKeys = distinct(cells.map((cell) => cell.x));
    const yKeys = distinct(cells.map((cell) => cell.y));
    const onRow = (cell: HeatmapCell) =>
        Math.max(yKeys.findIndex((key) => Math.abs(key - cell.y) < 1e-6), 0) + 1;
    const onColumn = (cell: HeatmapCell) =>
        Math.max(xKeys.findIndex((key) => Math.abs(key - cell.x) < 1e-6), 0) + 1;

    const scores = cells.map((cell) => cell.score);
    const mean = scores.reduce((total, score) => total + score, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const variance =
        scores.reduce((total, score) => total + (score - mean) ** 2, 0) / scores.length;

    const artifacts = forensicReport?.detectedArtifacts ?? [];
    const boxes = forensicReport?.vptBoundingBoxes ?? [];
    const hasPoints = artifacts.length > 0 || boxes.length > 0;

    return (
        <div className="spatial-report">
            <p className="dp-intro">
                The frame divided into {yKeys.length} × {xKeys.length} equal regions, each scored on
                its own. In the map, how filled a region looks carries the score — colour is held
                back for the places where a region actually crossed into a finding.
            </p>

            {spatialAnalysis.isLikelyComposite && (
                <p className="flag-line">
                    The regions disagree with each other: part of this file behaves like a photograph
                    and part of it does not.
                </p>
            )}

            <div className="doc-entries">
                <div className="doc-entry">
                    <span className="ab">MAP</span>
                    <div>
                        <h3>The file with the region scores laid over it</h3>
                        <p>
                            Click a region to keep it open. The {cells.length} values in this tab are
                            the same numbers the shading is drawn from — nothing here is a second
                            pass over the image.
                        </p>

                        <div className="opts">
                            <button
                                type="button"
                                className={`opt${showOverlay ? ' on' : ''}`}
                                aria-pressed={showOverlay}
                                onClick={() => setShowOverlay((value) => !value)}
                            >
                                Score overlay
                            </button>
                            {hasPoints && (
                                <button
                                    type="button"
                                    className={`opt${showPoints ? ' on' : ''}`}
                                    aria-pressed={showPoints}
                                    onClick={() => setShowPoints((value) => !value)}
                                >
                                    Marked points ({artifacts.length + boxes.length})
                                </button>
                            )}
                        </div>

                        <figure className="dp-fig">
                            <figcaption>
                                {selected
                                    ? `Row ${onRow(selected)}, column ${onColumn(selected)} — ${pct(
                                          selected.score
                                      )} synthetic, covering ${pct(selected.width)} × ${pct(
                                          selected.height
                                      )} of the frame.`
                                    : 'A more filled region carries a higher synthetic score. Boxes and dots are positions a forensic pass named.'}
                            </figcaption>
                            <div className="frame">
                                {imageUrl ? (
                                    <img
                                        className="source"
                                        src={imageUrl}
                                        alt="The file under analysis"
                                    />
                                ) : (
                                    <div className="no-source" />
                                )}

                                {showOverlay && (
                                    <div className="overlay">
                                        <span className="veil" aria-hidden="true" />
                                        {cells.map((cell, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={`cell${selected === cell ? ' sel' : ''}`}
                                                style={{
                                                    left: `${cell.x * 100}%`,
                                                    top: `${cell.y * 100}%`,
                                                    width: `${cell.width * 100}%`,
                                                    height: `${cell.height * 100}%`,
                                                    opacity: 0.12 + cell.score * 0.68,
                                                }}
                                                aria-label={`Row ${onRow(cell)}, column ${onColumn(
                                                    cell
                                                )}, ${pct(cell.score)} synthetic`}
                                                onClick={() =>
                                                    setSelected(selected === cell ? null : cell)
                                                }
                                            />
                                        ))}
                                    </div>
                                )}

                                {showPoints && (
                                    <div className="points">
                                        {boxes.map((bbox, index) => (
                                            <span
                                                key={`box-${index}`}
                                                className="bbox"
                                                style={{
                                                    left: `${bbox.xmin * 100}%`,
                                                    top: `${bbox.ymin * 100}%`,
                                                    width: `${(bbox.xmax - bbox.xmin) * 100}%`,
                                                    height: `${(bbox.ymax - bbox.ymin) * 100}%`,
                                                }}
                                            >
                                                <em>{bbox.label}</em>
                                            </span>
                                        ))}
                                        {artifacts.map((artifact, index) => (
                                            <span
                                                key={`pt-${index}`}
                                                className={`point bg-${SEVERITY_TONE[artifact.severity]}`}
                                                style={{
                                                    left: `${artifact.regionX * 100}%`,
                                                    top: `${artifact.regionY * 100}%`,
                                                }}
                                                title={`${artifact.description} — ${pct(
                                                    artifact.confidence
                                                )}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="scale">
                                {STEPS.map((step) => (
                                    <span key={step} className="step">
                                        <i
                                            aria-hidden="true"
                                            style={{ opacity: 0.12 + step * 0.68 }}
                                        />
                                        {pct(step)}
                                    </span>
                                ))}
                            </div>
                        </figure>

                        <div className="doc-fields">
                            <div>
                                <span className="fl">Analysis</span>
                                <span className="fv dim">{spatialAnalysis.spatialExplanation}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="doc-entry">
                    <span className="ab">GRID</span>
                    <div>
                        <h3>Every region, in reading order</h3>
                        <div className="ro-rows">
                            {cells.map((cell, index) => (
                                <MeasureRow
                                    key={index}
                                    name={`Row ${onRow(cell)}, column ${onColumn(cell)}`}
                                    value={cell.score}
                                    label={pct(cell.score)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="doc-entry">
                    <span className="ab">SPREAD</span>
                    <div>
                        <h3>How even the readings are</h3>
                        <div className="ro-rows">
                            <MeasureRow
                                name="Mean region score"
                                value={mean}
                                tone="neutral"
                                label={pct(mean, 1)}
                            />
                            <MeasureRow
                                name="Highest region"
                                value={highest}
                                label={pct(highest, 1)}
                            />
                            <MeasureRow
                                name="Lowest region"
                                value={lowest}
                                tone="neutral"
                                label={pct(lowest, 1)}
                            />
                            <MeasureRow
                                name="Uniformity across the frame"
                                value={spatialAnalysis.uniformityScore}
                                tone="neutral"
                                label={pct(spatialAnalysis.uniformityScore, 1)}
                            />
                        </div>
                        <p className="dp-note">
                            σ² = {variance.toFixed(4)} over {cells.length} regions. A wide spread
                            means part of the frame reads differently from the rest, which is what a
                            splice or a partial edit leaves behind; the composite flag is raised on
                            that basis rather than on the average.
                        </p>
                    </div>
                </div>

                {spatialAnalysis.hotspots.length > 0 && (
                    <div className="doc-entry">
                        <span className="ab">SPOT</span>
                        <div>
                            <h3>Regions the analysis singled out</h3>
                            <div className="ro-rows">
                                {spatialAnalysis.hotspots.map((hotspot, index) => (
                                    <MeasureRow
                                        key={index}
                                        name={readable(hotspot.region)}
                                        value={hotspot.score}
                                        tone={SEVERITY_TONE[hotspot.severity]}
                                        label={pct(hotspot.score)}
                                    />
                                ))}
                            </div>
                            <div className="doc-fields">
                                {spatialAnalysis.hotspots.map((hotspot, index) => (
                                    <div key={index}>
                                        <span className="fl">Spot {index + 1}</span>
                                        <span className="fv dim">
                                            {hotspot.anomalies.length > 0
                                                ? hotspot.anomalies.join(' · ')
                                                : 'no specific anomaly named for this region'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="dp-note">
                                These regions come with a name, not a measured position, so they are
                                not placed on the map — only the points below carry coordinates.
                            </p>
                        </div>
                    </div>
                )}

                {hasPoints && (
                    <div className="doc-entry">
                        <span className="ab">POINTS</span>
                        <div>
                            <h3>Positions returned with coordinates</h3>
                            <div className="doc-fields">
                                {artifacts.map((artifact, index) => (
                                    <div key={`a-${index}`}>
                                        <span className="fl">Pt {index + 1}</span>
                                        <span className="fv">
                                            {artifact.description}
                                            <span className="dp-inline">
                                                {' '}
                                                · {readable(artifact.anomalyType)} · at{' '}
                                                {pct(artifact.regionX)}, {pct(artifact.regionY)} of
                                                the frame · {pct(artifact.confidence)}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                                {boxes.map((bbox, index) => (
                                    <div key={`b-${index}`}>
                                        <span className="fl">Box {index + 1}</span>
                                        <span className="fv">
                                            {bbox.description}
                                            <span className="dp-inline">
                                                {' '}
                                                · {pct(bbox.width)} × {pct(bbox.height)} of the
                                                frame, from {pct(bbox.xmin)}, {pct(bbox.ymin)} ·{' '}
                                                {pct(bbox.confidence)}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {forensicReport?.vptServerAvailable !== undefined && (
                                <div className="doc-fields">
                                    <div>
                                        <span className="fl">Source</span>
                                        <span className="fv dim">
                                            {forensicReport.vptModelLoaded
                                                ? 'The region model returned these boxes.'
                                                : 'A heuristic stand-in produced these boxes because the region model did not answer — read them as suggestions.'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .spatial-report {
                    min-width: 0;
                }

                .flag-line {
                    margin: 14px 0 0;
                    padding: 10px 14px;
                    border-left: 3px solid var(--caution);
                    background: var(--caution-wash);
                    font-size: 0.9375rem;
                    line-height: 1.55;
                    color: var(--ink);
                    max-width: 66ch;
                }

                .opts {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 18px;
                }

                .frame {
                    position: relative;
                    width: min(100%, 520px);
                    border: 1px solid var(--rule);
                    background: var(--sheet-sunk);
                }

                .source {
                    display: block;
                    width: 100%;
                    height: auto;
                }

                .no-source {
                    height: 320px;
                }

                .overlay,
                .points {
                    position: absolute;
                    inset: 0;
                }

                .veil {
                    position: absolute;
                    inset: 0;
                    background: var(--sheet);
                    opacity: 0.55;
                }

                .cell {
                    position: absolute;
                    padding: 0;
                    border: 0;
                    border-right: 1px solid var(--sheet);
                    border-bottom: 1px solid var(--sheet);
                    background: var(--ink);
                    cursor: pointer;
                }

                .cell:hover,
                .cell.sel {
                    outline: 2px solid var(--paper);
                    outline-offset: -3px;
                    box-shadow: inset 0 0 0 1px var(--ink);
                }

                .bbox {
                    position: absolute;
                    border: 1.5px solid var(--flagged);
                }

                .bbox em {
                    position: absolute;
                    left: -1.5px;
                    bottom: 100%;
                    padding: 2px 6px;
                    background: var(--flagged);
                    color: var(--paper);
                    font-family: var(--font-mono);
                    font-size: 0.875rem;
                    font-style: normal;
                    white-space: nowrap;
                }

                .point {
                    position: absolute;
                    width: 11px;
                    height: 11px;
                    margin: -5.5px 0 0 -5.5px;
                    border-radius: 50%;
                    border: 1.5px solid var(--paper);
                }

                .bg-flagged {
                    background: var(--flagged);
                }

                .bg-caution {
                    background: var(--caution);
                }

                .bg-verified {
                    background: var(--verified);
                }

                .scale {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 14px;
                    margin-top: 12px;
                    font-family: var(--font-mono);
                    font-size: 0.875rem;
                    color: var(--muted);
                }

                .step {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .step i {
                    display: block;
                    width: 22px;
                    height: 10px;
                    background: var(--ink);
                }

                @media (max-width: 620px) {
                    .bbox em {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
