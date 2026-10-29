'use client';

import { pct, readable } from '@/lib/report';
import SpectralStrip from './SpectralStrip';

interface GANIdentificationPanelProps {
    data?: GANIdentificationData;
}

interface GANIdentificationData {
    isAIGenerated: boolean;
    aiConfidence: number;
    identifiedGenerator: {
        name: string;
        confidence: number;
        matchingFeatures: string[];
        version?: string;
    } | null;
    allMatches: {
        name: string;
        confidence: number;
        matchingFeatures: string[];
    }[];
    analysis: {
        spectralMatch: string;
        colorMatch: string;
        textureMatch: string;
        overallAssessment: string;
    };
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
}

/** What each stored profile covers, in one line — no brand colours, no icons. */
const PROFILE_NOTE: Record<string, string> = {
    'DALL-E': 'OpenAI text-to-image models',
    Midjourney: 'the Midjourney v5 and v6 line',
    'Stable Diffusion': 'open-weight models, SD 1.5 through SD 3',
    'Adobe Firefly': "Adobe's commercial generator",
    'Google Imagen': "Google's photoreal generators",
    Flux: 'Black Forest Labs Flux.1 line',
};

export default function GANIdentificationPanel({ data }: GANIdentificationPanelProps) {
    if (!data) {
        return (
            <p className="dp-none">
                The generator fingerprint read did not run for this image, so there is nothing to
                compare against the stored profiles.
            </p>
        );
    }

    const generator = data.identifiedGenerator;
    const matches = data.allMatches.slice(0, 5);
    const { colorProfile, textureProfile, spectralSignature } = data.extractedFingerprint;
    const leadConfidence = generator ? generator.confidence : data.aiConfidence;
    const profileNote = PROFILE_NOTE[generator?.name ?? ''] ?? 'a stored generator profile';
    const versionNote = generator?.version
        ? ` The profile is filed under ${generator.version}; the comparison does not separate versions.`
        : '';

    return (
        <div>
            <p className="dp-intro">
                The image&apos;s fingerprint — its spectrum, colour spread and texture — measured
                from the pixels and compared against {data.allMatches.length} stored generator
                profiles. A close match is evidence about the family of model, not proof of which
                one produced the file.
            </p>

            <div className="doc-entries">
                <div className="doc-entry">
                    <span className="ab">MATCH</span>
                    <div>
                        <h3>
                            {generator
                                ? `Closest profile: ${generator.name}`
                                : 'No generator profile came out ahead'}
                        </h3>
                        <p>
                            {generator
                                ? `${profileNote}.${versionNote}`
                                : 'The measured fingerprint sat closest to what camera output looks like, so no generator is named.'}
                        </p>

                        <div className="ro-rows">
                            <div className="ro-row lead">
                                <span className="ro-name">
                                    {generator ? generator.name : 'Real camera output'}
                                </span>
                                <span className="ro-meter" aria-hidden="true">
                                    <i
                                        className="neutral"
                                        style={{ width: `${Math.round(leadConfidence * 100)}%` }}
                                    />
                                </span>
                                <span className="ro-val">{pct(leadConfidence, 1)}</span>
                            </div>
                            {matches
                                .filter((match) => match.name !== generator?.name)
                                .map((match) => (
                                    <div className="ro-row" key={match.name}>
                                        <span className="ro-name">{match.name}</span>
                                        <span className="ro-meter" aria-hidden="true">
                                            <i
                                                className="neutral"
                                                style={{
                                                    width: `${Math.round(match.confidence * 100)}%`,
                                                }}
                                            />
                                        </span>
                                        <span className="ro-val">
                                            {(match.confidence * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                ))}
                        </div>

                        <p className="dp-note">
                            Every profile was scored against the same fingerprint, so this is one
                            ranking rather than {matches.length} separate detections.
                        </p>

                        {generator && generator.matchingFeatures.length > 0 && (
                            <>
                                <p className="dp-sub">Features that pulled it toward this profile</p>
                                <ul className="doc-ticks">
                                    {generator.matchingFeatures.map((feature) => (
                                        <li key={feature}>{feature}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>

                <div className="doc-entry">
                    <span className="ab">PROOF</span>
                    <div>
                        <h3>What was measured</h3>
                        <p>
                            The signals the comparison is built from, printed as the detector
                            produced them.
                        </p>

                        <SpectralStrip
                            values={spectralSignature}
                            caption="Spectral signature — energy per band, low to high frequency"
                        />

                        <div className="doc-fields">
                            <div>
                                <span className="fl">Colour</span>
                                <span className="fv">
                                    saturation{' '}
                                    <span className="data">
                                        {colorProfile.saturationMean.toFixed(3)} ±{' '}
                                        {colorProfile.saturationVariance.toFixed(3)}
                                    </span>{' '}
                                    · dominant hue{' '}
                                    <span className="data">{colorProfile.hueDominant}°</span> ·{' '}
                                    {readable(colorProfile.colorTemperature).toLowerCase()}
                                </span>
                            </div>
                            <div>
                                <span className="fl">Texture</span>
                                <span className="fv">
                                    smoothness{' '}
                                    <span className="data">
                                        {textureProfile.smoothness.toFixed(3)}
                                    </span>{' '}
                                    · repetitiveness{' '}
                                    <span className="data">
                                        {textureProfile.repetitiveness.toFixed(3)}
                                    </span>{' '}
                                    · detail{' '}
                                    <span className="data">
                                        {textureProfile.detailLevel.toFixed(3)}
                                    </span>
                                </span>
                            </div>
                            <div>
                                <span className="fl">Spectrum</span>
                                <span className="fv">{data.analysis.spectralMatch}</span>
                            </div>
                            <div>
                                <span className="fl">Colour read</span>
                                <span className="fv">{data.analysis.colorMatch}</span>
                            </div>
                            <div>
                                <span className="fl">Texture read</span>
                                <span className="fv">{data.analysis.textureMatch}</span>
                            </div>
                        </div>

                        <p className="dp-body">{data.analysis.overallAssessment}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
