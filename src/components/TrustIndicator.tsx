'use client';

import { DISAGREEMENT, RECOMMENDATION, scoreTone, trustTone } from '@/lib/report';
import type { CalibrationResult } from '@/lib/types';

/**
 * The calibration record: what the reads agreed on, and what that did to the score.
 * Everything here is global-class markup — this component is rendered next to a
 * sibling block that owns its own styles.
 */
export default function TrustIndicator({ calibration }: { calibration: CalibrationResult }) {
    const disagreement = DISAGREEMENT[calibration.disagreementType];
    const recommendation = RECOMMENDATION[calibration.recommendation];
    const adjustment = calibration.calibratedScore - calibration.rawScore;

    return (
        <div className="doc-entries">
            <div className="doc-entry">
                <span className="ab">CAL</span>
                <div>
                    <h3>How much the reads agreed</h3>
                    <p>
                        Three measurements of one image rarely land on the same number. This step
                        looks at how far apart they were and moves the score toward whichever read
                        carried the most evidence — or leaves it alone if they disagreed too much to
                        blend.
                    </p>

                    <div className="ro-rows">
                        <div className="ro-row">
                            <span className="ro-name">Trust in this verdict</span>
                            <span className="ro-meter" aria-hidden="true">
                                <i
                                    className={trustTone(calibration.trustScore)}
                                    style={{ width: `${Math.round(calibration.trustScore * 100)}%` }}
                                />
                            </span>
                            <span className="ro-val">
                                {(calibration.trustScore * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="ro-row">
                            <span className="ro-name">Score before calibration</span>
                            <span className="ro-meter" aria-hidden="true">
                                <i
                                    className="neutral"
                                    style={{ width: `${Math.round(calibration.rawScore * 100)}%` }}
                                />
                            </span>
                            <span className="ro-val">
                                {(calibration.rawScore * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="ro-row">
                            <span className="ro-name">Score after calibration</span>
                            <span className="ro-meter" aria-hidden="true">
                                <i
                                    className={scoreTone(calibration.calibratedScore)}
                                    style={{
                                        width: `${Math.round(calibration.calibratedScore * 100)}%`,
                                    }}
                                />
                            </span>
                            <span className="ro-val">
                                {(calibration.calibratedScore * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="ro-row">
                            <span className="ro-name">Adjustment</span>
                            <span className="ro-meter" aria-hidden="true">
                                <i
                                    className="neutral"
                                    style={{ width: `${Math.min(100, Math.abs(adjustment) * 400)}%` }}
                                />
                            </span>
                            <span className="ro-val">
                                {adjustment >= 0 ? '+' : '−'}
                                {(Math.abs(adjustment) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="ro-row">
                            <span className="ro-name">Spread between the reads</span>
                            <span className="ro-meter" aria-hidden="true">
                                <i
                                    className={disagreement ? disagreement.tone : scoreTone(calibration.disagreementScore)}
                                    style={{
                                        width: `${Math.round(calibration.disagreementScore * 100)}%`,
                                    }}
                                />
                            </span>
                            <span className="ro-val">
                                {calibration.disagreementScore.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <p className="dp-note">{calibration.explanation}</p>

                    <div className="doc-fields">
                        <div>
                            <span className="fl">Agreement</span>
                            <span className={`fv tone ${disagreement?.tone ?? 'caution'}`}>
                                {disagreement?.label ?? calibration.disagreementType}
                            </span>
                        </div>
                        <div>
                            <span className="fl">Advice</span>
                            <span className={`fv tone ${recommendation?.tone ?? 'caution'}`}>
                                {recommendation?.label ?? calibration.recommendation}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
