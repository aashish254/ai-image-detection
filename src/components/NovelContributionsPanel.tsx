'use client';

import { pct, readable, scoreTone } from '@/lib/report';
import type { Tone } from '@/lib/report';
import MeasureRow from './MeasureRow';
import SpectralStrip from './SpectralStrip';

interface NovelContributionsPanelProps {
    fsfnData?: FSFNData;
    xaiData?: XAIData;
    uncertaintyData?: UncertaintyData;
}

interface FSFNData {
    frequencyScore: number;
    spatialScore: number;
    fusionScore: number;
    domainAgreement: number;
    attentionWeights: { frequency: number; spatial: number };
    spectralFingerprint: number[];
    explanation: string;
}

interface XAIData {
    summary: string;
    attentionMap: number[][];
    regions: {
        id: string;
        x: number;
        y: number;
        importance: number;
        category: string;
        finding: string;
    }[];
    keyFactors: {
        name: string;
        contribution: number;
        direction: 'ai' | 'real' | 'neutral';
    }[];
}

interface UncertaintyData {
    prediction: number;
    lowerBound: number;
    upperBound: number;
    standardDeviation: number;
    aleatoric: number;
    epistemic: number;
    reliabilityScore: number;
    reliabilityLevel: 'high' | 'moderate' | 'low' | 'very_low';
    humanReviewRecommended: boolean;
    recommendation: string;
}

const DIRECTION_TONE: Record<'ai' | 'real' | 'neutral', Tone> = {
    ai: 'flagged',
    real: 'verified',
    neutral: 'caution',
};

const RELIABILITY_TONE: Record<UncertaintyData['reliabilityLevel'], Tone> = {
    high: 'verified',
    moderate: 'caution',
    low: 'flagged',
    very_low: 'flagged',
};

export default function NovelContributionsPanel({
    fsfnData,
    xaiData,
    uncertaintyData,
}: NovelContributionsPanelProps) {
    if (!fsfnData && !xaiData && !uncertaintyData) {
        return (
            <p className="dp-none">
                These three reads did not return for this image, so there is nothing to report here.
                The overview tab carries everything that did run.
            </p>
        );
    }

    return (
        <div>
            <p className="dp-intro">
                Three measurements that sit behind the headline score: how the two visual domains
                were combined, where the model looked, and how wide its own doubt is.
            </p>

            <div className="doc-entries">
                {fsfnData && <FrequencySpatial record={fsfnData} />}
                {xaiData && <Attribution record={xaiData} />}
                {uncertaintyData && <Uncertainty record={uncertaintyData} />}
            </div>
        </div>
    );
}

/* ── Frequency–spatial fusion ─────────────────────────────────── */

function FrequencySpatial({ record }: { record: FSFNData }) {
    return (
        <div className="doc-entry">
            <span className="ab">FSFN</span>
            <div>
                <h3>Frequency and spatial fused</h3>
                <p>
                    The same image measured twice — once by its frequency spectrum, once by its
                    edges and texture — then combined with weights chosen per image rather than a
                    fixed split.
                </p>

                <div className="ro-rows">
                    <MeterRow name="Frequency domain" value={record.frequencyScore} />
                    <MeterRow name="Spatial domain" value={record.spatialScore} />
                    <MeterRow name="Fused score" value={record.fusionScore} />
                    <MeterRow name="Domain agreement" value={record.domainAgreement} />
                </div>

                <SpectralStrip
                    values={record.spectralFingerprint}
                    caption="Spectral fingerprint — energy per band, low to high frequency"
                />

                <div className="doc-fields">
                    <div>
                        <span className="fl">Weights</span>
                        <span className="fv dim">
                            frequency {pct(record.attentionWeights.frequency)} · spatial{' '}
                            {pct(record.attentionWeights.spatial)}
                        </span>
                    </div>
                    <div>
                        <span className="fl">Reading</span>
                        <span className="fv">{record.explanation}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Explainable attribution ──────────────────────────────────── */

function Attribution({ record }: { record: XAIData }) {
    const columns = record.attentionMap[0]?.length ?? 0;

    return (
        <div className="doc-entry">
            <span className="ab">XAI</span>
            <div>
                <h3>Where the evidence sits</h3>
                <p>
                    Attribution over the frame: which regions the read leaned on, and how much each
                    measurement moved the verdict.
                </p>

                <p className="dp-body">{record.summary}</p>

                {record.attentionMap.length > 0 && columns > 0 && (
                    <figure className="dp-fig">
                        <figcaption>
                            Attention across {record.attentionMap.length}×{columns} cells — darker
                            means the read leaned on it more
                        </figcaption>
                        <div
                            className="am-grid"
                            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                        >
                            {record.attentionMap.flatMap((row, i) =>
                                row.map((cell, j) => (
                                    <span
                                        className="am-cell"
                                        key={`${i}-${j}`}
                                        style={{ opacity: 0.04 + cell * 0.92 }}
                                        title={`row ${i + 1}, column ${j + 1} · ${cell.toFixed(2)}`}
                                    />
                                ))
                            )}
                        </div>
                    </figure>
                )}

                {record.keyFactors.length > 0 && (
                    <>
                        <p className="dp-sub">What moved the verdict</p>
                        <div className="ro-rows">
                            {record.keyFactors.map((factor) => (
                                <div className="ro-row" key={factor.name}>
                                    <span className="ro-name">{factor.name}</span>
                                    <span className="ro-meter" aria-hidden="true">
                                        <i
                                            className={DIRECTION_TONE[factor.direction]}
                                            style={{
                                                width: `${Math.round(factor.contribution * 100)}%`,
                                            }}
                                        />
                                    </span>
                                    <span className="ro-val">
                                        {factor.direction === 'real' ? '−' : ''}
                                        {pct(factor.contribution)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {record.regions.length > 0 && (
                    <>
                        <p className="dp-sub">Regions cited</p>
                        <div className="doc-fields">
                            {record.regions.map((region) => (
                                <div key={region.id}>
                                    <span className="fl">{readable(region.category)}</span>
                                    <span className="fv">
                                        {region.finding}
                                        <span className="dp-inline">
                                            {' '}
                                            · at {pct(region.x)}, {pct(region.y)} of the frame ·
                                            importance {pct(region.importance)}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ── Uncertainty ──────────────────────────────────────────────── */

function Uncertainty({ record }: { record: UncertaintyData }) {
    const width = Math.max(0.5, (record.upperBound - record.lowerBound) * 100);

    return (
        <div className="doc-entry">
            <span className="ab">UQ</span>
            <div>
                <h3>How wide the doubt is</h3>
                <p>
                    The verdict is reported with the model&apos;s own uncertainty: the band it would
                    accept, split into noise in the image and gaps in the model.
                </p>

                <figure className="dp-fig">
                    <figcaption>Confidence interval on the synthetic likelihood</figcaption>
                    <div className="ci-track">
                        <span
                            className="ci-range"
                            style={{ left: `${record.lowerBound * 100}%`, width: `${width}%` }}
                        />
                        <span
                            className="ci-point"
                            style={{ left: `${record.prediction * 100}%` }}
                        />
                    </div>
                    <div className="ci-scale">
                        <span>0</span>
                        <span>synthetic likelihood</span>
                        <span>1</span>
                    </div>
                    <div className="doc-fields">
                        <div>
                            <span className="fl">Read</span>
                            <span className="fv data">{record.prediction.toFixed(3)}</span>
                        </div>
                        <div>
                            <span className="fl">Band</span>
                            <span className="fv data">
                                {record.lowerBound.toFixed(3)} to {record.upperBound.toFixed(3)}
                            </span>
                        </div>
                        <div>
                            <span className="fl">Std dev</span>
                            <span className="fv data">{record.standardDeviation.toFixed(3)}</span>
                        </div>
                    </div>
                </figure>

                <div className="ro-rows">
                    <MeterRow
                        name="Uncertainty from the image (aleatoric)"
                        value={record.aleatoric}
                        neutral
                    />
                    <MeterRow
                        name="Uncertainty from the model (epistemic)"
                        value={record.epistemic}
                        neutral
                    />
                    <MeterRow name="Reliability" value={record.reliabilityScore} />
                </div>

                <div className="doc-fields">
                    <div>
                        <span className="fl">Level</span>
                        <span className={`fv tone ${RELIABILITY_TONE[record.reliabilityLevel]}`}>
                            {readable(record.reliabilityLevel)}
                        </span>
                    </div>
                    <div>
                        <span className="fl">Review</span>
                        <span className="fv">
                            {record.humanReviewRecommended
                                ? 'A person should look at this one.'
                                : 'No human review flagged.'}
                        </span>
                    </div>
                    <div>
                        <span className="fl">Why</span>
                        <span className="fv">{record.recommendation}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MeterRow({ name, value, neutral }: { name: string; value: number; neutral?: boolean }) {
    return (
        <MeasureRow
            name={name}
            value={value}
            tone={neutral ? 'neutral' : scoreTone(value)}
            label={value.toFixed(2)}
        />
    );
}
