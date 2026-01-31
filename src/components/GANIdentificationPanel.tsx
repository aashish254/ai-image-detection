'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Fingerprint,
    Search,
    CheckCircle,
    XCircle,
    HelpCircle,
    Sparkles,
    Activity,
    Palette,
    Grid3X3,
    Radio,
    ChevronRight,
    AlertTriangle,
} from 'lucide-react';

interface GANIdentificationPanelProps {
    data?: GANIdentificationData;
    isLoading?: boolean;
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

const GENERATOR_INFO: Record<string, { icon: string; color: string; description: string }> = {
    'DALL-E': {
        icon: '🎨',
        color: '#10a37f',
        description: 'OpenAI\'s creative image generator'
    },
    'Midjourney': {
        icon: '🌌',
        color: '#5865F2',
        description: 'Artistic, cinematic quality'
    },
    'Stable Diffusion': {
        icon: '🔧',
        color: '#ff6b35',
        description: 'Open-source community model'
    },
    'Adobe Firefly': {
        icon: '🔥',
        color: '#ff0000',
        description: 'Adobe\'s commercial solution'
    },
    'Google Imagen': {
        icon: '🌈',
        color: '#4285f4',
        description: 'Google\'s photorealistic model'
    },
    'Flux': {
        icon: '⚡',
        color: '#9b59b6',
        description: 'State-of-the-art from Black Forest Labs'
    },
};

export default function GANIdentificationPanel({ data, isLoading }: GANIdentificationPanelProps) {
    if (isLoading) {
        return (
            <div className="gan-panel loading">
                <div className="loading-content">
                    <motion.div
                        className="loading-icon"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Fingerprint size={48} />
                    </motion.div>
                    <p>Analyzing GAN fingerprint...</p>
                </div>
                <style jsx>{styles}</style>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="gan-panel no-data">
                <HelpCircle size={48} />
                <p>No GAN identification data available</p>
                <style jsx>{styles}</style>
            </div>
        );
    }

    const generator = data.identifiedGenerator;
    const generatorInfo = generator ? GENERATOR_INFO[generator.name] : null;

    return (
        <div className="gan-panel">
            {/* Header */}
            <div className="panel-header">
                <div className="header-icon">
                    <Fingerprint size={24} />
                </div>
                <div className="header-text">
                    <h3>GAN Fingerprint Identification</h3>
                    <p>Identifying the AI generator that created this image</p>
                </div>
                <span className="novel-badge">NOVEL #4</span>
            </div>

            {/* Main Result */}
            <motion.div
                className={`main-result ${data.isAIGenerated ? 'ai' : 'real'}`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {data.isAIGenerated && generator ? (
                    <>
                        <div
                            className="generator-icon"
                            style={{ background: generatorInfo?.color || '#6366f1' }}
                        >
                            <span className="emoji">{generatorInfo?.icon || '🤖'}</span>
                        </div>
                        <div className="generator-info">
                            <div className="generator-label">Identified Generator</div>
                            <h2 className="generator-name">{generator.name}</h2>
                            {generator.version && (
                                <span className="generator-version">{generator.version}</span>
                            )}
                            <p className="generator-description">
                                {generatorInfo?.description}
                            </p>
                        </div>
                        <div className="confidence-display">
                            <div className="confidence-circle">
                                <svg viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="8"
                                    />
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={generatorInfo?.color || '#6366f1'}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${generator.confidence * 283} 283`}
                                        initial={{ strokeDasharray: "0 283" }}
                                        animate={{ strokeDasharray: `${generator.confidence * 283} 283` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                                    />
                                </svg>
                                <span className="confidence-value">
                                    {(generator.confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                            <span className="confidence-label">Match Confidence</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="generator-icon real">
                            <span className="emoji">📷</span>
                        </div>
                        <div className="generator-info">
                            <div className="generator-label">Classification</div>
                            <h2 className="generator-name">Real Photograph</h2>
                            <p className="generator-description">
                                This image appears to be an authentic photograph
                            </p>
                        </div>
                        <div className="confidence-display">
                            <CheckCircle size={48} className="real-icon" />
                            <span className="confidence-label">Authentic</span>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Matching Features */}
            {data.isAIGenerated && generator && generator.matchingFeatures.length > 0 && (
                <motion.div
                    className="matching-features"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>Matching Features</h4>
                    <div className="features-list">
                        {generator.matchingFeatures.map((feature, i) => (
                            <div key={i} className="feature-badge">
                                <CheckCircle size={14} />
                                {feature}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* All Generator Matches */}
            <motion.div
                className="all-matches"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h4>Generator Probability Distribution</h4>
                <div className="matches-list">
                    {data.allMatches.slice(0, 5).map((match, i) => {
                        const info = GENERATOR_INFO[match.name];
                        const isTop = i === 0 && data.isAIGenerated;

                        return (
                            <div key={match.name} className={`match-item ${isTop ? 'top' : ''}`}>
                                <span
                                    className="match-icon"
                                    style={{ background: info?.color || '#6366f1' }}
                                >
                                    {info?.icon || '🤖'}
                                </span>
                                <span className="match-name">{match.name}</span>
                                <div className="match-bar-container">
                                    <motion.div
                                        className="match-bar"
                                        style={{ background: info?.color || '#6366f1' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${match.confidence * 100}%` }}
                                        transition={{ duration: 0.5, delay: 0.1 * i }}
                                    />
                                </div>
                                <span className="match-percentage">
                                    {(match.confidence * 100).toFixed(1)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Spectral Fingerprint Visualization */}
            <motion.div
                className="fingerprint-viz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h4>
                    <Activity size={16} />
                    Extracted Spectral Fingerprint
                </h4>
                <div className="spectral-bars">
                    {data.extractedFingerprint.spectralSignature.map((val, i) => (
                        <div key={i} className="spectral-bar-container">
                            <motion.div
                                className="spectral-bar"
                                initial={{ height: 0 }}
                                animate={{ height: `${val * 100}%` }}
                                transition={{ duration: 0.5, delay: 0.05 * i }}
                                style={{
                                    background: `linear-gradient(to top, hsl(${200 + i * 20}, 70%, 45%), hsl(${200 + i * 20}, 70%, 65%))`
                                }}
                            />
                            <span className="spectral-label">F{i + 1}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Analysis Details */}
            <motion.div
                className="analysis-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h4>Analysis Details</h4>
                <div className="detail-grid">
                    <div className="detail-item">
                        <div className="detail-icon spectral">
                            <Activity size={16} />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">Spectral Analysis</span>
                            <span className="detail-value">{data.analysis.spectralMatch}</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-icon color">
                            <Palette size={16} />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">Color Profile</span>
                            <span className="detail-value">{data.analysis.colorMatch}</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-icon texture">
                            <Grid3X3 size={16} />
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">Texture Analysis</span>
                            <span className="detail-value">{data.analysis.textureMatch}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Overall Assessment */}
            <motion.div
                className="overall-assessment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Sparkles size={18} />
                <p>{data.analysis.overallAssessment}</p>
            </motion.div>

            <style jsx>{styles}</style>
        </div>
    );
}

const styles = `
    .gan-panel {
        background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
    }

    .gan-panel.loading,
    .gan-panel.no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        gap: 1rem;
        color: rgba(255, 255, 255, 0.5);
    }

    .loading-icon {
        color: #6366f1;
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

    .novel-badge {
        margin-left: auto;
        padding: 0.25rem 0.75rem;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        font-size: 0.7rem;
        font-weight: 700;
        border-radius: 20px;
    }

    .main-result {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.5rem;
        margin: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .main-result.ai {
        border-color: rgba(239, 68, 68, 0.3);
    }

    .main-result.real {
        border-color: rgba(34, 197, 94, 0.3);
    }

    .generator-icon {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        flex-shrink: 0;
    }

    .generator-icon.real {
        background: linear-gradient(135deg, #22c55e, #16a34a);
    }

    .generator-icon .emoji {
        font-size: 2.5rem;
    }

    .generator-info {
        flex: 1;
    }

    .generator-label {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
    }

    .generator-name {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
    }

    .generator-version {
        display: inline-block;
        padding: 0.15rem 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 0.25rem;
    }

    .generator-description {
        margin: 0.5rem 0 0;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
    }

    .confidence-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .confidence-circle {
        position: relative;
        width: 80px;
        height: 80px;
    }

    .confidence-circle svg {
        width: 100%;
        height: 100%;
    }

    .confidence-value {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
    }

    .confidence-label {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
    }

    .real-icon {
        color: #22c55e;
    }

    .matching-features {
        padding: 0 1.5rem 1rem;
    }

    .matching-features h4 {
        margin: 0 0 0.75rem;
        font-size: 0.85rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
    }

    .features-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .feature-badge {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.75rem;
        background: rgba(34, 197, 94, 0.15);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 20px;
        font-size: 0.75rem;
        color: #4ade80;
    }

    .all-matches {
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .all-matches h4 {
        margin: 0 0 1rem;
        font-size: 0.85rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
    }

    .matches-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .match-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .match-item.top {
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        margin: -0.5rem;
    }

    .match-icon {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        font-size: 0.9rem;
    }

    .match-name {
        width: 120px;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.8);
    }

    .match-bar-container {
        flex: 1;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
    }

    .match-bar {
        height: 100%;
        border-radius: 4px;
    }

    .match-percentage {
        width: 50px;
        text-align: right;
        font-size: 0.8rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
    }

    .fingerprint-viz {
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .fingerprint-viz h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem;
        font-size: 0.85rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
    }

    .spectral-bars {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        height: 80px;
        padding: 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
    }

    .spectral-bar-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
    }

    .spectral-bar {
        width: 100%;
        border-radius: 3px 3px 0 0;
        margin-top: auto;
    }

    .spectral-label {
        font-size: 0.6rem;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 4px;
    }

    .analysis-details {
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .analysis-details h4 {
        margin: 0 0 1rem;
        font-size: 0.85rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
    }

    .detail-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .detail-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .detail-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        flex-shrink: 0;
    }

    .detail-icon.spectral {
        background: rgba(6, 182, 212, 0.15);
        color: #06b6d4;
    }

    .detail-icon.color {
        background: rgba(236, 72, 153, 0.15);
        color: #ec4899;
    }

    .detail-icon.texture {
        background: rgba(139, 92, 246, 0.15);
        color: #8b5cf6;
    }

    .detail-content {
        display: flex;
        flex-direction: column;
    }

    .detail-label {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .detail-value {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.4;
    }

    .overall-assessment {
        display: flex;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        margin: 1rem;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 10px;
    }

    .overall-assessment svg {
        flex-shrink: 0;
        color: #a5b4fc;
    }

    .overall-assessment p {
        margin: 0;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
    }
`;
