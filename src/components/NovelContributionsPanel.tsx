'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Waves,
    Eye,
    AlertTriangle,
    Target,
    Grid3X3,
    BarChart3,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    Info,
    Sparkles,
    Crosshair,
    Activity,
    CircleDot,
} from 'lucide-react';

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

export default function NovelContributionsPanel({
    fsfnData,
    xaiData,
    uncertaintyData,
}: NovelContributionsPanelProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('fsfn');

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="novel-contributions-panel">
            <div className="panel-header">
                <div className="header-icon">
                    <Sparkles size={24} />
                </div>
                <div className="header-text">
                    <h3>Novel Research Contributions</h3>
                    <p>Advanced analysis powered by 3 novel detection methods</p>
                </div>
            </div>

            {/* FSFN Section */}
            <motion.div className="contribution-section">
                <button
                    className="section-header"
                    onClick={() => toggleSection('fsfn')}
                >
                    <div className="section-icon fsfn">
                        <Waves size={20} />
                    </div>
                    <div className="section-info">
                        <h4>Frequency-Spatial Fusion Network</h4>
                        <span className="section-badge">NOVEL #1</span>
                    </div>
                    {expandedSection === 'fsfn' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <AnimatePresence>
                    {expandedSection === 'fsfn' && fsfnData && (
                        <motion.div
                            className="section-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="fsfn-content">
                                <div className="dual-domain">
                                    <div className="domain-card frequency">
                                        <div className="domain-header">
                                            <Activity size={16} />
                                            <span>Frequency Domain</span>
                                        </div>
                                        <div className="domain-score">
                                            <div
                                                className="score-bar"
                                                style={{
                                                    width: `${fsfnData.frequencyScore * 100}%`,
                                                    background: getScoreGradient(fsfnData.frequencyScore)
                                                }}
                                            />
                                            <span className="score-value">
                                                {(fsfnData.frequencyScore * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <p className="domain-desc">DCT spectral analysis</p>
                                    </div>

                                    <div className="fusion-indicator">
                                        <div className="fusion-circle">
                                            <Crosshair size={24} />
                                        </div>
                                        <span>Cross-Modal Attention</span>
                                    </div>

                                    <div className="domain-card spatial">
                                        <div className="domain-header">
                                            <Grid3X3 size={16} />
                                            <span>Spatial Domain</span>
                                        </div>
                                        <div className="domain-score">
                                            <div
                                                className="score-bar"
                                                style={{
                                                    width: `${fsfnData.spatialScore * 100}%`,
                                                    background: getScoreGradient(fsfnData.spatialScore)
                                                }}
                                            />
                                            <span className="score-value">
                                                {(fsfnData.spatialScore * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <p className="domain-desc">Edge & texture analysis</p>
                                    </div>
                                </div>

                                <div className="fusion-result">
                                    <div className="metric">
                                        <span className="label">Fused Score</span>
                                        <span className="value highlight">
                                            {(fsfnData.fusionScore * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="metric">
                                        <span className="label">Domain Agreement</span>
                                        <span className="value">
                                            {(fsfnData.domainAgreement * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="spectral-fingerprint">
                                    <span className="fingerprint-label">Spectral Fingerprint</span>
                                    <div className="fingerprint-bars">
                                        {fsfnData.spectralFingerprint.map((val, i) => (
                                            <div
                                                key={i}
                                                className="fingerprint-bar"
                                                style={{
                                                    height: `${val * 100}%`,
                                                    background: `hsl(${240 + i * 15}, 70%, 60%)`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className="explanation">{fsfnData.explanation}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* XAI Section */}
            <motion.div className="contribution-section">
                <button
                    className="section-header"
                    onClick={() => toggleSection('xai')}
                >
                    <div className="section-icon xai">
                        <Eye size={20} />
                    </div>
                    <div className="section-info">
                        <h4>Explainable AI Detection</h4>
                        <span className="section-badge">NOVEL #2</span>
                    </div>
                    {expandedSection === 'xai' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <AnimatePresence>
                    {expandedSection === 'xai' && xaiData && (
                        <motion.div
                            className="section-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="xai-content">
                                <div className="xai-summary">
                                    <Lightbulb size={18} />
                                    <p>{xaiData.summary}</p>
                                </div>

                                <div className="attention-map">
                                    <h5>Attention Map</h5>
                                    <div className="attention-grid">
                                        {xaiData.attentionMap.map((row, i) => (
                                            <div key={i} className="attention-row">
                                                {row.map((cell, j) => (
                                                    <div
                                                        key={j}
                                                        className="attention-cell"
                                                        style={{
                                                            background: `rgba(239, 68, 68, ${cell})`,
                                                            boxShadow: cell > 0.7 ? `0 0 10px rgba(239, 68, 68, ${cell})` : 'none'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="key-factors">
                                    <h5>Key Decision Factors</h5>
                                    {xaiData.keyFactors.map((factor, i) => (
                                        <div key={i} className={`factor-item ${factor.direction}`}>
                                            <div className="factor-bar">
                                                <div
                                                    className="factor-fill"
                                                    style={{ width: `${factor.contribution * 100}%` }}
                                                />
                                            </div>
                                            <span className="factor-name">{factor.name}</span>
                                            <span className="factor-value">
                                                {(factor.contribution * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {xaiData.regions.length > 0 && (
                                    <div className="detected-regions">
                                        <h5>Suspicious Regions</h5>
                                        {xaiData.regions.slice(0, 3).map((region, i) => (
                                            <div key={i} className="region-item">
                                                <Target size={14} />
                                                <span className="region-category">{region.category}</span>
                                                <span className="region-finding">{region.finding}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Uncertainty Section */}
            <motion.div className="contribution-section">
                <button
                    className="section-header"
                    onClick={() => toggleSection('uncertainty')}
                >
                    <div className="section-icon uncertainty">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="section-info">
                        <h4>Uncertainty Quantification</h4>
                        <span className="section-badge">NOVEL #3</span>
                    </div>
                    {expandedSection === 'uncertainty' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <AnimatePresence>
                    {expandedSection === 'uncertainty' && uncertaintyData && (
                        <motion.div
                            className="section-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="uncertainty-content">
                                <div className="confidence-interval">
                                    <h5>95% Confidence Interval</h5>
                                    <div className="interval-visualization">
                                        <div className="interval-track">
                                            <div
                                                className="interval-range"
                                                style={{
                                                    left: `${uncertaintyData.lowerBound * 100}%`,
                                                    width: `${(uncertaintyData.upperBound - uncertaintyData.lowerBound) * 100}%`
                                                }}
                                            />
                                            <div
                                                className="interval-point"
                                                style={{ left: `${uncertaintyData.prediction * 100}%` }}
                                            />
                                        </div>
                                        <div className="interval-labels">
                                            <span>{(uncertaintyData.lowerBound * 100).toFixed(0)}%</span>
                                            <span className="prediction">
                                                {(uncertaintyData.prediction * 100).toFixed(1)}%
                                            </span>
                                            <span>{(uncertaintyData.upperBound * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="uncertainty-decomposition">
                                    <h5>Uncertainty Decomposition</h5>
                                    <div className="decomposition-bars">
                                        <div className="decomp-item">
                                            <span>Aleatoric (Data)</span>
                                            <div className="decomp-bar">
                                                <div
                                                    className="decomp-fill aleatoric"
                                                    style={{ width: `${uncertaintyData.aleatoric * 100}%` }}
                                                />
                                            </div>
                                            <span>{(uncertaintyData.aleatoric * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="decomp-item">
                                            <span>Epistemic (Model)</span>
                                            <div className="decomp-bar">
                                                <div
                                                    className="decomp-fill epistemic"
                                                    style={{ width: `${uncertaintyData.epistemic * 100}%` }}
                                                />
                                            </div>
                                            <span>{(uncertaintyData.epistemic * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="reliability-assessment">
                                    <div className={`reliability-badge ${uncertaintyData.reliabilityLevel}`}>
                                        <CircleDot size={16} />
                                        <span>Reliability: {uncertaintyData.reliabilityLevel.replace('_', ' ').toUpperCase()}</span>
                                    </div>
                                    {uncertaintyData.humanReviewRecommended && (
                                        <div className="human-review-warning">
                                            <AlertTriangle size={16} />
                                            <span>Human review recommended</span>
                                        </div>
                                    )}
                                </div>

                                <p className="recommendation">{uncertaintyData.recommendation}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <style jsx>{`
                .novel-contributions-panel {
                    background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1));
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .header-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 12px;
                    color: white;
                }

                .header-text h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                }

                .header-text p {
                    margin: 0.25rem 0 0;
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .contribution-section {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .contribution-section:last-child {
                    border-bottom: none;
                }

                .section-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: white;
                    transition: background 0.2s;
                }

                .section-header:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .section-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                }

                .section-icon.fsfn {
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                }

                .section-icon.xai {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                }

                .section-icon.uncertainty {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }

                .section-info {
                    flex: 1;
                    text-align: left;
                }

                .section-info h4 {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 500;
                }

                .section-badge {
                    display: inline-block;
                    padding: 0.15rem 0.5rem;
                    background: rgba(99, 102, 241, 0.3);
                    color: #a5b4fc;
                    font-size: 0.65rem;
                    font-weight: 700;
                    border-radius: 20px;
                    margin-top: 0.25rem;
                }

                .section-content {
                    overflow: hidden;
                }

                /* FSFN Styles */
                .fsfn-content {
                    padding: 1rem 1.25rem 1.5rem;
                }

                .dual-domain {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .domain-card {
                    flex: 1;
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .domain-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 0.5rem;
                }

                .domain-score {
                    position: relative;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .score-bar {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .score-value {
                    position: absolute;
                    right: 0;
                    top: -18px;
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .domain-desc {
                    margin: 0.5rem 0 0;
                    font-size: 0.65rem;
                    color: rgba(255, 255, 255, 0.5);
                }

                .fusion-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                }

                .fusion-circle {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 50%;
                    color: white;
                }

                .fusion-indicator span {
                    font-size: 0.6rem;
                    color: rgba(255, 255, 255, 0.6);
                    text-align: center;
                }

                .fusion-result {
                    display: flex;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .metric {
                    flex: 1;
                    text-align: center;
                }

                .metric .label {
                    display: block;
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .metric .value {
                    display: block;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                }

                .metric .value.highlight {
                    color: #a5b4fc;
                }

                .spectral-fingerprint {
                    margin-bottom: 1rem;
                }

                .fingerprint-label {
                    display: block;
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 0.5rem;
                }

                .fingerprint-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    height: 40px;
                }

                .fingerprint-bar {
                    flex: 1;
                    border-radius: 2px;
                }

                .explanation {
                    margin: 0;
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.5;
                }

                /* XAI Styles */
                .xai-content {
                    padding: 1rem 1.25rem 1.5rem;
                }

                .xai-summary {
                    display: flex;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(139, 92, 246, 0.1);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .xai-summary svg {
                    flex-shrink: 0;
                    color: #a78bfa;
                }

                .xai-summary p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.4;
                }

                .attention-map h5,
                .key-factors h5,
                .detected-regions h5,
                .confidence-interval h5,
                .uncertainty-decomposition h5 {
                    margin: 0 0 0.75rem;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.8);
                }

                .attention-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    margin-bottom: 1rem;
                }

                .attention-row {
                    display: flex;
                    gap: 3px;
                }

                .attention-cell {
                    flex: 1;
                    aspect-ratio: 1;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .key-factors {
                    margin-bottom: 1rem;
                }

                .factor-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                .factor-bar {
                    flex: 1;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .factor-fill {
                    height: 100%;
                    border-radius: 3px;
                }

                .factor-item.ai .factor-fill {
                    background: linear-gradient(90deg, #ef4444, #dc2626);
                }

                .factor-item.real .factor-fill {
                    background: linear-gradient(90deg, #22c55e, #16a34a);
                }

                .factor-item.neutral .factor-fill {
                    background: linear-gradient(90deg, #f59e0b, #d97706);
                }

                .factor-name {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                    min-width: 100px;
                }

                .factor-value {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    min-width: 40px;
                    text-align: right;
                }

                .region-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .region-item:last-child {
                    border-bottom: none;
                }

                .region-item svg {
                    color: #f59e0b;
                }

                .region-category {
                    font-size: 0.7rem;
                    padding: 0.15rem 0.4rem;
                    background: rgba(245, 158, 11, 0.2);
                    color: #fbbf24;
                    border-radius: 4px;
                }

                .region-finding {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                /* Uncertainty Styles */
                .uncertainty-content {
                    padding: 1rem 1.25rem 1.5rem;
                }

                .interval-visualization {
                    margin-bottom: 1rem;
                }

                .interval-track {
                    position: relative;
                    height: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                }

                .interval-range {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    background: linear-gradient(90deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.5));
                    border-radius: 6px;
                }

                .interval-point {
                    position: absolute;
                    top: 50%;
                    width: 16px;
                    height: 16px;
                    background: #f59e0b;
                    border: 2px solid white;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.5);
                }

                .interval-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .interval-labels .prediction {
                    font-weight: 600;
                    color: #f59e0b;
                }

                .decomposition-bars {
                    margin-bottom: 1rem;
                }

                .decomp-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                .decomp-item span:first-child {
                    min-width: 110px;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .decomp-bar {
                    flex: 1;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .decomp-fill {
                    height: 100%;
                    border-radius: 3px;
                }

                .decomp-fill.aleatoric {
                    background: linear-gradient(90deg, #06b6d4, #0891b2);
                }

                .decomp-fill.epistemic {
                    background: linear-gradient(90deg, #8b5cf6, #7c3aed);
                }

                .decomp-item span:last-child {
                    min-width: 40px;
                    text-align: right;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                }

                .reliability-assessment {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .reliability-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .reliability-badge.high {
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                }

                .reliability-badge.moderate {
                    background: rgba(245, 158, 11, 0.2);
                    color: #fbbf24;
                }

                .reliability-badge.low {
                    background: rgba(249, 115, 22, 0.2);
                    color: #fb923c;
                }

                .reliability-badge.very_low {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                }

                .human-review-warning {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #f87171;
                    font-size: 0.75rem;
                }

                .recommendation {
                    margin: 0;
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.5;
                }
            `}</style>
        </div>
    );
}

function getScoreGradient(score: number): string {
    if (score < 0.3) return 'linear-gradient(90deg, #22c55e, #16a34a)';
    if (score < 0.5) return 'linear-gradient(90deg, #f59e0b, #d97706)';
    if (score < 0.7) return 'linear-gradient(90deg, #f97316, #ea580c)';
    return 'linear-gradient(90deg, #ef4444, #dc2626)';
}
