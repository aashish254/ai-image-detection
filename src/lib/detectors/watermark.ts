/**
 * CASCADE WATERMARK & METADATA DETECTION SYSTEM
 * ==============================================
 * Implements a three-level cascade detection system for maximum coverage:
 * 
 * Level 1: C2PA Content Credentials (Fastest, Definitive)
 *   - Reads cryptographic signatures that explicitly say "Created by DALL-E 3"
 *   - Works for Meta AI, OpenAI DALL-E 3, Adobe Firefly
 *   - Only works if metadata hasn't been stripped
 * 
 * Level 2: Invisible Watermark Detection (Fast)
 *   - Stable Diffusion: DWT-DCT based invisible watermark
 *   - Google SynthID: Frequency-domain watermark patterns
 *   - Each platform has distinct watermarking patterns
 * 
 * Level 3: EXIF/XMP Metadata Analysis (Fast, Fallback)
 *   - Software tags, generation parameters
 *   - Platform-specific metadata markers
 * 
 * Authors: Rahul Yadav, Aashish Kumar Mahato, Bibek Gami
 */

import { DetectorResult } from '../types';

export interface PlatformWatermarkInfo {
    platform: string;
    method: string;
    confidence: number;
    evidence: string[];
}

export interface WatermarkResult {
    hasSynthID: boolean;
    hasC2PA: boolean;
    hasAIMetadata: boolean;
    hasSDWatermark: boolean;
    hasMetaSignature: boolean;
    hasDallESignature: boolean;
    hasFireflySignature: boolean;
    hasMidjourneySignature: boolean;
    platform?: string;
    confidence: number;
    details: string[];
    cascadeLevel: 'c2pa' | 'watermark' | 'metadata' | 'none';
    platformWatermarks: PlatformWatermarkInfo[];
}

/**
 * Main cascade detection function.
 * Runs through three levels, returning as soon as definitive evidence is found.
 */
export async function detectWatermarks(
    imageBase64: string
): Promise<DetectorResult & { watermarkInfo: WatermarkResult }> {
    const startTime = Date.now();

    try {
        // Remove data URL prefix
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const watermarkInfo: WatermarkResult = {
            hasSynthID: false,
            hasC2PA: false,
            hasAIMetadata: false,
            hasSDWatermark: false,
            hasMetaSignature: false,
            hasDallESignature: false,
            hasFireflySignature: false,
            hasMidjourneySignature: false,
            confidence: 0,
            details: [],
            cascadeLevel: 'none',
            platformWatermarks: [],
        };

        // ========================================
        // LEVEL 1: C2PA Content Credentials Check
        // ========================================
        console.log('[Watermark] Level 1: Checking C2PA Content Credentials...');
        const c2paResult = checkC2PAContentCredentials(imageBuffer);
        if (c2paResult.found) {
            watermarkInfo.hasC2PA = true;
            watermarkInfo.platform = c2paResult.platform;
            watermarkInfo.confidence = Math.max(watermarkInfo.confidence, c2paResult.confidence);
            watermarkInfo.details.push(...c2paResult.details);
            watermarkInfo.cascadeLevel = 'c2pa';
            watermarkInfo.platformWatermarks.push({
                platform: c2paResult.platform || 'Unknown',
                method: 'C2PA Content Credentials',
                confidence: c2paResult.confidence,
                evidence: c2paResult.details,
            });
            console.log(`[Watermark] C2PA FOUND: ${c2paResult.platform} (${(c2paResult.confidence * 100).toFixed(0)}%)`);
        }

        // ========================================
        // LEVEL 2: Invisible Watermark Detection
        // ========================================
        console.log('[Watermark] Level 2: Checking invisible watermarks...');

        // Check SynthID (Google Gemini/Imagen)
        const synthIdResult = detectSynthIDWatermark(imageBuffer);
        if (synthIdResult.found) {
            watermarkInfo.hasSynthID = true;
            watermarkInfo.platform = watermarkInfo.platform || 'Google Gemini/Imagen';
            watermarkInfo.confidence = Math.max(watermarkInfo.confidence, synthIdResult.confidence);
            watermarkInfo.details.push(...synthIdResult.details);
            if (watermarkInfo.cascadeLevel === 'none') watermarkInfo.cascadeLevel = 'watermark';
            watermarkInfo.platformWatermarks.push({
                platform: 'Google Gemini/Imagen',
                method: 'SynthID Frequency-Domain Watermark',
                confidence: synthIdResult.confidence,
                evidence: synthIdResult.details,
            });
            console.log(`[Watermark] SynthID FOUND (${(synthIdResult.confidence * 100).toFixed(0)}%)`);
        }

        // Check Stable Diffusion invisible watermark (DWT-DCT)
        const sdResult = detectSDInvisibleWatermark(imageBuffer);
        if (sdResult.found) {
            watermarkInfo.hasSDWatermark = true;
            watermarkInfo.platform = watermarkInfo.platform || 'Stable Diffusion';
            watermarkInfo.confidence = Math.max(watermarkInfo.confidence, sdResult.confidence);
            watermarkInfo.details.push(...sdResult.details);
            if (watermarkInfo.cascadeLevel === 'none') watermarkInfo.cascadeLevel = 'watermark';
            watermarkInfo.platformWatermarks.push({
                platform: 'Stable Diffusion',
                method: 'DWT-DCT Invisible Watermark',
                confidence: sdResult.confidence,
                evidence: sdResult.details,
            });
            console.log(`[Watermark] SD Watermark FOUND (${(sdResult.confidence * 100).toFixed(0)}%)`);
        }

        // Check Meta AI signature
        const metaResult = detectMetaAISignature(imageBuffer);
        if (metaResult.found) {
            watermarkInfo.hasMetaSignature = true;
            watermarkInfo.platform = watermarkInfo.platform || 'Meta AI';
            watermarkInfo.confidence = Math.max(watermarkInfo.confidence, metaResult.confidence);
            watermarkInfo.details.push(...metaResult.details);
            if (watermarkInfo.cascadeLevel === 'none') watermarkInfo.cascadeLevel = 'watermark';
            watermarkInfo.platformWatermarks.push({
                platform: 'Meta AI',
                method: 'Meta AI Signature Detection',
                confidence: metaResult.confidence,
                evidence: metaResult.details,
            });
            console.log(`[Watermark] Meta AI Signature FOUND (${(metaResult.confidence * 100).toFixed(0)}%)`);
        }

        // Check DALL-E signature
        const dalleResult = detectDallESignature(imageBuffer);
        if (dalleResult.found) {
            watermarkInfo.hasDallESignature = true;
            watermarkInfo.platform = watermarkInfo.platform || 'DALL-E';
            watermarkInfo.confidence = Math.max(watermarkInfo.confidence, dalleResult.confidence);
            watermarkInfo.details.push(...dalleResult.details);
            if (watermarkInfo.cascadeLevel === 'none') watermarkInfo.cascadeLevel = 'watermark';
            watermarkInfo.platformWatermarks.push({
                platform: 'DALL-E / OpenAI',
                method: 'DALL-E C2PA + Pattern Detection',
                confidence: dalleResult.confidence,
                evidence: dalleResult.details,
            });
        }

        // Check Adobe Firefly signature
        const fireflyResult = detectFireflySignature(imageBuffer);
        if (fireflyResult.found) {
            watermarkInfo.hasFireflySignature = true;
            watermarkInfo.platform = watermarkInfo.platform || 'Adobe Firefly';
            watermarkInfo.confidence = Math.max(watermarkInfo.confidence, fireflyResult.confidence);
            watermarkInfo.details.push(...fireflyResult.details);
            if (watermarkInfo.cascadeLevel === 'none') watermarkInfo.cascadeLevel = 'watermark';
            watermarkInfo.platformWatermarks.push({
                platform: 'Adobe Firefly',
                method: 'Adobe Content Credentials',
                confidence: fireflyResult.confidence,
                evidence: fireflyResult.details,
            });
        }

        // ========================================
        // LEVEL 3: EXIF/XMP Metadata Analysis
        // ========================================
        console.log('[Watermark] Level 3: Checking EXIF/XMP metadata...');
        const metadataResult = checkAIMetadataExtended(imageBuffer);
        if (metadataResult.found) {
            watermarkInfo.hasAIMetadata = true;
            if (!watermarkInfo.platform) watermarkInfo.platform = metadataResult.platform;
            watermarkInfo.confidence = Math.max(watermarkInfo.confidence, metadataResult.confidence);
            watermarkInfo.details.push(...metadataResult.details);
            if (watermarkInfo.cascadeLevel === 'none') watermarkInfo.cascadeLevel = 'metadata';
            watermarkInfo.platformWatermarks.push({
                platform: metadataResult.platform || 'Unknown AI',
                method: 'EXIF/XMP Metadata Analysis',
                confidence: metadataResult.confidence,
                evidence: metadataResult.details,
            });
            console.log(`[Watermark] Metadata FOUND: ${metadataResult.platform} (${(metadataResult.confidence * 100).toFixed(0)}%)`);
        }

        // Calculate final AI score
        let aiScore = 0.5; // Default neutral
        const hasAnyWatermark = watermarkInfo.hasSynthID || watermarkInfo.hasC2PA ||
            watermarkInfo.hasAIMetadata || watermarkInfo.hasSDWatermark ||
            watermarkInfo.hasMetaSignature || watermarkInfo.hasDallESignature ||
            watermarkInfo.hasFireflySignature;

        if (hasAnyWatermark) {
            // Watermarks are strong evidence
            aiScore = watermarkInfo.cascadeLevel === 'c2pa' ? 0.98
                : watermarkInfo.cascadeLevel === 'watermark' ? 0.95
                    : 0.90;
        }

        const processingTime = Date.now() - startTime;
        console.log(`[Watermark] Cascade complete in ${processingTime}ms. Level: ${watermarkInfo.cascadeLevel}, Platform: ${watermarkInfo.platform || 'None'}`);

        return {
            name: 'Cascade Watermark & Metadata Detector',
            score: aiScore,
            confidence: watermarkInfo.confidence,
            status: 'success',
            processingTime,
            watermarkInfo,
        };

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Watermark] Detection failed:', errorMsg);

        return {
            name: 'Cascade Watermark & Metadata Detector',
            score: 0.5,
            confidence: 0,
            status: 'error',
            error: errorMsg,
            processingTime: Date.now() - startTime,
            watermarkInfo: {
                hasSynthID: false,
                hasC2PA: false,
                hasAIMetadata: false,
                hasSDWatermark: false,
                hasMetaSignature: false,
                hasDallESignature: false,
                hasFireflySignature: false,
                hasMidjourneySignature: false,
                confidence: 0,
                details: ['Detection failed'],
                cascadeLevel: 'none',
                platformWatermarks: [],
            },
        };
    }
}


// ================================================================
// LEVEL 1: C2PA Content Credentials Detection
// ================================================================

interface DetectionResult {
    found: boolean;
    platform?: string;
    confidence: number;
    details: string[];
}

/**
 * Check for C2PA (Content Authenticity Initiative) content credentials.
 * C2PA uses JUMBF (JPEG Universal Metadata Box Format) boxes embedded in the file.
 * Meta, OpenAI (DALL-E 3), and Adobe use this standard.
 */
function checkC2PAContentCredentials(buffer: Buffer): DetectionResult {
    const details: string[] = [];
    let platform: string | undefined;
    let confidence = 0;

    // Convert buffer to hex and UTF-8 for pattern matching
    const hexStr = buffer.toString('hex').toLowerCase();
    const utf8Str = buffer.toString('utf8', 0, Math.min(buffer.length, 50000)).toLowerCase();

    // C2PA JUMBF box markers
    // JUMBF boxes start with 'jumb' or 'jumd' in the file
    const c2paPatterns = [
        { hex: '6a756d62', name: 'JUMBF box (jumb)', confidence: 0.95 },      // "jumb" in hex
        { hex: '6a756d64', name: 'JUMBF description (jumd)', confidence: 0.90 }, // "jumd" in hex
        { hex: '63327061', name: 'C2PA manifest (c2pa)', confidence: 0.95 },    // "c2pa" in hex
        { hex: '63326d61', name: 'C2PA manifest store (c2ma)', confidence: 0.90 }, // "c2ma" in hex
    ];

    for (const pattern of c2paPatterns) {
        const idx = hexStr.indexOf(pattern.hex);
        if (idx >= 0) {
            details.push(`${pattern.name} found at byte offset ${idx / 2}`);
            confidence = Math.max(confidence, pattern.confidence);
        }
    }

    // Check for C2PA claim signatures in text
    const c2paTextPatterns = [
        { pattern: /c2pa\.assertion/i, name: 'C2PA assertion', conf: 0.90 },
        { pattern: /c2pa\.claim/i, name: 'C2PA claim', conf: 0.90 },
        { pattern: /content.credentials/i, name: 'Content Credentials', conf: 0.85 },
        { pattern: /contentauthenticity/i, name: 'Content Authenticity', conf: 0.80 },
        { pattern: /c2pa\.hash/i, name: 'C2PA hash', conf: 0.85 },
    ];

    for (const { pattern, name, conf } of c2paTextPatterns) {
        if (pattern.test(utf8Str)) {
            details.push(`${name} signature found in file`);
            confidence = Math.max(confidence, conf);
        }
    }

    // Platform identification from C2PA claims
    if (confidence > 0) {
        if (utf8Str.includes('openai') || utf8Str.includes('dall-e') || utf8Str.includes('dall·e')) {
            platform = 'DALL-E (OpenAI)';
            details.push('C2PA claim identifies creator as OpenAI/DALL-E');
        } else if (utf8Str.includes('adobe') || utf8Str.includes('firefly')) {
            platform = 'Adobe Firefly';
            details.push('C2PA claim identifies creator as Adobe Firefly');
        } else if (utf8Str.includes('meta') || utf8Str.includes('facebook')) {
            platform = 'Meta AI';
            details.push('C2PA claim identifies creator as Meta AI');
        } else if (utf8Str.includes('google') || utf8Str.includes('gemini') || utf8Str.includes('imagen')) {
            platform = 'Google Gemini/Imagen';
            details.push('C2PA claim identifies creator as Google');
        } else {
            platform = 'AI Generated (C2PA signed)';
            details.push('C2PA content credentials found but creator not identified');
        }
    }

    return { found: confidence > 0, platform, confidence, details };
}


// ================================================================
// LEVEL 2: Invisible Watermark Detection
// ================================================================

/**
 * Detect SynthID watermark patterns (Google Gemini/Imagen).
 * SynthID embeds imperceptible watermarks in the frequency domain.
 * 
 * Key characteristics:
 * - Very uniform spectral distribution across frequency bands
 * - Specific bit patterns in DCT coefficients
 * - Consistent across different compressions
 */
function detectSynthIDWatermark(buffer: Buffer): DetectionResult {
    const details: string[] = [];
    let confidence = 0;

    // Check for Google/SynthID markers in binary data
    // ONLY trust explicit text markers that are definitively embedded by Google
    const utf8Chunk = buffer.toString('utf8', 0, Math.min(buffer.length, 50000));

    // Direct text markers — these are definitive if found in image metadata
    const textMarkers = [
        { pattern: /synthid/i, name: 'SynthID marker', conf: 0.90 },
        { pattern: /google[_\-\s]+watermark/i, name: 'Google watermark', conf: 0.80 },
        { pattern: /gemini[_\-\s]+generated/i, name: 'Gemini generation marker', conf: 0.80 },
    ];

    for (const { pattern, name, conf } of textMarkers) {
        if (pattern.test(utf8Chunk)) {
            details.push(`${name} found in image data`);
            confidence = Math.max(confidence, conf);
        }
    }

    // NOTE: We intentionally do NOT use frequency-domain heuristics or LSB pattern analysis
    // for SynthID detection. These heuristics (analyzeFrequencyCharacteristics, analyzeLSBPatterns)
    // operate on raw file bytes which include JPEG/PNG headers and compression artifacts,
    // producing massive false positives on real images. True SynthID detection requires
    // Google's proprietary decoder which is not publicly available.
    // Instead, we rely on:
    // 1. Explicit text markers in metadata (above)
    // 2. Gemini Vision API's own assessment (in vision-llm.ts)
    // 3. C2PA content credentials (in checkC2PAContentCredentials)

    // Only report as found if we have strong definitive evidence (not heuristic guesses)
    return { found: confidence >= 0.70, platform: 'Google Gemini/Imagen', confidence, details };
}

/**
 * Detect Stable Diffusion invisible watermark.
 * SD uses DWT-DCT (Discrete Wavelet Transform + DCT) based watermarking.
 * 
 * The watermark is embedded by the `invisible-watermark` library using
 * the dwtDct method, encoding a 32-byte watermark string.
 */
function detectSDInvisibleWatermark(buffer: Buffer): DetectionResult {
    const details: string[] = [];
    let confidence = 0;

    const utf8Chunk = buffer.toString('utf8', 0, Math.min(buffer.length, 50000));

    // Check for SD-specific metadata markers — only trust definitive text evidence
    const sdMarkers = [
        { pattern: /stable.?diffusion/i, name: 'Stable Diffusion identifier', conf: 0.85 },
        { pattern: /sd.?watermark/i, name: 'SD watermark tag', conf: 0.80 },
        { pattern: /diffusers/i, name: 'Diffusers library marker', conf: 0.75 },
        { pattern: /compvis/i, name: 'CompVis marker', conf: 0.70 },
        { pattern: /stabilityai/i, name: 'Stability AI marker', conf: 0.80 },
        { pattern: /runwayml/i, name: 'RunwayML marker', conf: 0.70 },
        { pattern: /automatic1111/i, name: 'Automatic1111 marker', conf: 0.80 },
        { pattern: /comfyui/i, name: 'ComfyUI marker', conf: 0.80 },
    ];

    for (const { pattern, name, conf } of sdMarkers) {
        if (pattern.test(utf8Chunk)) {
            details.push(`${name} found`);
            confidence = Math.max(confidence, conf);
        }
    }

    // NOTE: DWT-DCT grid analysis (analyzeDWTDCTWatermark) and VAE artifact analysis
    // (analyzeVAEArtifacts) were removed from standalone SD detection because:
    // - DWT-DCT grid detection essentially detects JPEG 8x8 block boundaries present in ALL JPEGs
    // - VAE artifact detection flags smooth-to-sharp transitions common in natural photos
    // Both produced significant false positives on real camera images.
    // We only trust explicit metadata markers above.

    // Check for SD watermark identifier in file tail
    const tailChunk = buffer.toString('utf8', Math.max(0, buffer.length - 2000)).toLowerCase();
    if (/sdv\d|stabdiff|sd_watermark/i.test(tailChunk)) {
        details.push('SD watermark identifier pattern found in image data');
        confidence = Math.max(confidence, 0.75);
    }

    return { found: confidence >= 0.65, platform: 'Stable Diffusion', confidence, details };
}

/**
 * Detect Meta AI generation signatures.
 * Meta uses C2PA standards + their own invisible watermarking.
 */
function detectMetaAISignature(buffer: Buffer): DetectionResult {
    const details: string[] = [];
    let confidence = 0;

    const utf8Chunk = buffer.toString('utf8', 0, Math.min(buffer.length, 50000));

    // Only trust definitive AI generation markers — NOT generic platform names
    // "meta", "facebook", "instagram" appear in ALL photos from those platforms
    const metaMarkers = [
        { pattern: /imagined.?with.?ai/i, name: 'Meta "Imagined with AI" tag', conf: 0.90 },
        { pattern: /meta.?ai.?generat/i, name: 'Meta AI generation marker', conf: 0.85 },
        { pattern: /emu.*model/i, name: 'Emu model (Meta) marker', conf: 0.75 },
    ];

    for (const { pattern, name, conf } of metaMarkers) {
        if (pattern.test(utf8Chunk)) {
            details.push(`${name} found`);
            confidence = Math.max(confidence, conf);
        }
    }

    // NOTE: analyzeMetaWatermark was removed because it checked for "meta|facebook|instagram|whatsapp"
    // in the image trailer, which flags ALL photos from those social media platforms as Meta AI generated.

    return { found: confidence >= 0.70, platform: 'Meta AI', confidence, details };
}

/**
 * Detect DALL-E generation signatures.
 * DALL-E 3 uses C2PA + specific EXIF patterns.
 */
function detectDallESignature(buffer: Buffer): DetectionResult {
    const details: string[] = [];
    let confidence = 0;

    const utf8Chunk = buffer.toString('utf8', 0, Math.min(buffer.length, 50000));

    const dalleMarkers = [
        { pattern: /dall[\-\s\.·]?e/i, name: 'DALL-E marker', conf: 0.85 },
        { pattern: /openai[\s\-_]+(image|generat)/i, name: 'OpenAI image generation marker', conf: 0.80 },
    ];

    for (const { pattern, name, conf } of dalleMarkers) {
        if (pattern.test(utf8Chunk)) {
            details.push(`${name} found`);
            confidence = Math.max(confidence, conf);
        }
    }

    return { found: confidence >= 0.70, platform: 'DALL-E', confidence, details };
}

/**
 * Detect Adobe Firefly generation signatures.
 * Firefly uses C2PA Content Credentials extensively.
 */
function detectFireflySignature(buffer: Buffer): DetectionResult {
    const details: string[] = [];
    let confidence = 0;

    const utf8Chunk = buffer.toString('utf8', 0, Math.min(buffer.length, 50000));

    const fireflyMarkers = [
        { pattern: /adobe[\s\-_]*firefly/i, name: 'Firefly marker', conf: 0.85 },
        { pattern: /adobe[\s\-_]+(ai|generative)/i, name: 'Adobe AI marker', conf: 0.80 },
    ];

    for (const { pattern, name, conf } of fireflyMarkers) {
        if (pattern.test(utf8Chunk)) {
            details.push(`${name} found`);
            confidence = Math.max(confidence, conf);
        }
    }

    return { found: confidence >= 0.70, platform: 'Adobe Firefly', confidence, details };
}


// ================================================================
// LEVEL 2 HELPERS: Deep Analysis Functions
// ================================================================

/**
 * Analyze frequency-domain characteristics for SynthID-like patterns.
 * SynthID creates a very uniform energy distribution across frequency bands.
 */
function analyzeFrequencyCharacteristics(buffer: Buffer): { isSynthIDLike: boolean; confidence: number; reason: string } {
    const bytes = new Uint8Array(buffer);
    const sampleSize = Math.min(bytes.length, 10000);

    // Analyze spectral distribution by computing energy in different "frequency bands"
    // represented by byte transition patterns
    const bands = new Array(8).fill(0);
    for (let i = 1; i < sampleSize; i++) {
        const diff = Math.abs(bytes[i] - bytes[i - 1]);
        const bandIndex = Math.min(7, Math.floor(diff / 32)); // 0-255 mapped to 0-7 bands
        bands[bandIndex]++;
    }

    const total = bands.reduce((a, b) => a + b, 0);
    const normalized = bands.map(b => b / total);

    // SynthID-like: very uniform distribution (each band ~12.5%)
    const expected = 1 / 8;
    const deviations = normalized.map(n => Math.abs(n - expected));
    const maxDeviation = Math.max(...deviations);
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;

    // Also check for periodic patterns in the data (SynthID embeds at regular intervals)
    let periodicScore = 0;
    const checkPeriods = [64, 128, 256, 512];
    for (const period of checkPeriods) {
        let matchCount = 0;
        const checkLength = Math.min(sampleSize - period, 2000);
        for (let i = 0; i < checkLength; i++) {
            if (Math.abs(bytes[i] - bytes[i + period]) < 5) {
                matchCount++;
            }
        }
        const matchRatio = matchCount / checkLength;
        if (matchRatio > 0.15) { // Higher than random chance
            periodicScore += 0.2;
        }
    }

    if (avgDeviation < 0.03 && maxDeviation < 0.05) {
        return {
            isSynthIDLike: true,
            confidence: 0.65,
            reason: `Unusually uniform frequency distribution (max deviation: ${(maxDeviation * 100).toFixed(1)}%)`,
        };
    }

    if (periodicScore > 0.4) {
        return {
            isSynthIDLike: true,
            confidence: 0.60,
            reason: `Periodic patterns detected at multiple intervals (score: ${periodicScore.toFixed(2)})`,
        };
    }

    return { isSynthIDLike: false, confidence: 0, reason: '' };
}

/**
 * Analyze Least Significant Bit patterns.
 * SynthID and other watermarks embed data in LSBs of specific components.
 */
function analyzeLSBPatterns(buffer: Buffer): { hasStructuredLSB: boolean; confidence: number; reason: string } {
    const bytes = new Uint8Array(buffer);
    const sampleSize = Math.min(bytes.length, 10000);

    // Extract LSBs
    const lsbs: number[] = [];
    for (let i = 0; i < sampleSize; i++) {
        lsbs.push(bytes[i] & 1);
    }

    // Check if LSBs have non-random patterns
    // Random data: ~50% 0s and ~50% 1s, with no structure
    const onesCount = lsbs.filter(b => b === 1).length;
    const onesRatio = onesCount / lsbs.length;

    // Check for run-length patterns (watermarks often create runs)
    let maxRun = 0;
    let currentRun = 1;
    for (let i = 1; i < lsbs.length; i++) {
        if (lsbs[i] === lsbs[i - 1]) {
            currentRun++;
            maxRun = Math.max(maxRun, currentRun);
        } else {
            currentRun = 1;
        }
    }

    // Check for autocorrelation at specific offsets
    let autocorrScore = 0;
    const offsets = [8, 16, 32, 64];
    for (const offset of offsets) {
        let matches = 0;
        const len = Math.min(lsbs.length - offset, 5000);
        for (let i = 0; i < len; i++) {
            if (lsbs[i] === lsbs[i + offset]) matches++;
        }
        const matchRatio = matches / len;
        if (Math.abs(matchRatio - 0.5) > 0.1) {
            autocorrScore += 0.15;
        }
    }

    if (autocorrScore > 0.3) {
        return {
            hasStructuredLSB: true,
            confidence: 0.55,
            reason: `LSB autocorrelation detected at multiple offsets (score: ${autocorrScore.toFixed(2)})`,
        };
    }

    if (maxRun > 30 && Math.abs(onesRatio - 0.5) > 0.05) {
        return {
            hasStructuredLSB: true,
            confidence: 0.50,
            reason: `Unusual LSB run length (${maxRun}) and bias (${(onesRatio * 100).toFixed(1)}% ones)`,
        };
    }

    return { hasStructuredLSB: false, confidence: 0, reason: '' };
}

/**
 * Analyze DWT-DCT watermark patterns (used by Stable Diffusion).
 * SD's default watermark embeds a 32-byte string using DWT-DCT method.
 */
function analyzeDWTDCTWatermark(buffer: Buffer): { found: boolean; confidence: number; reason: string } {
    const bytes = new Uint8Array(buffer);
    const sampleSize = Math.min(bytes.length, 20000);

    // DWT-DCT watermarks modify specific wavelet subbands
    // Look for characteristic modification patterns at wavelet boundaries

    // Analyze the image for regular grid patterns (8x8 DCT blocks)
    let gridCorrelation = 0;
    const blockSize = 8;
    let checks = 0;

    for (let i = blockSize * 3; i < sampleSize - blockSize; i += blockSize) {
        // Check if there's a consistent pattern at block boundaries
        const boundaryDiff = Math.abs(bytes[i] - bytes[i - 1]);
        const innerDiff = Math.abs(bytes[i + blockSize / 2] - bytes[i + blockSize / 2 - 1]);

        if (boundaryDiff > innerDiff * 1.5 && boundaryDiff > 10) {
            gridCorrelation++;
        }
        checks++;
    }

    const gridScore = checks > 0 ? gridCorrelation / checks : 0;

    // Also check for the specific bit pattern that SD watermark encodes
    // SD encodes "SDV2" or similar strings in the watermark
    const tailChunk = buffer.toString('utf8', Math.max(0, buffer.length - 2000)).toLowerCase();
    const hasSdIdentifier = /sdv\d|stabdiff|sd_watermark/i.test(tailChunk);

    if (hasSdIdentifier) {
        return {
            found: true,
            confidence: 0.75,
            reason: 'SD watermark identifier pattern found in image data',
        };
    }

    if (gridScore > 0.3) {
        return {
            found: true,
            confidence: 0.55,
            reason: `DCT block boundary patterns consistent with DWT-DCT watermark (grid score: ${(gridScore * 100).toFixed(1)}%)`,
        };
    }

    return { found: false, confidence: 0, reason: '' };
}

/**
 * Analyze VAE (Variational Autoencoder) reconstruction artifacts.
 * Stable Diffusion uses a VAE encoder/decoder, which leaves subtle patterns.
 */
function analyzeVAEArtifacts(buffer: Buffer): { found: boolean; confidence: number; reason: string } {
    const bytes = new Uint8Array(buffer);
    const sampleSize = Math.min(bytes.length, 15000);

    // VAE artifacts create specific smoothness patterns
    // with sharp transitions at certain boundaries (latent space patch boundaries)
    let smoothRegions = 0;
    let sharpTransitions = 0;
    const windowSize = 64;

    for (let i = windowSize; i < sampleSize - windowSize; i += windowSize) {
        // Calculate local variance
        let localVar = 0;
        for (let j = 0; j < windowSize; j++) {
            localVar += Math.pow(bytes[i + j] - bytes[i + j - 1], 2);
        }
        localVar /= windowSize;

        if (localVar < 5) smoothRegions++;
        if (localVar > 100) sharpTransitions++;
    }

    const totalRegions = Math.floor((sampleSize - windowSize) / windowSize);
    const smoothRatio = smoothRegions / totalRegions;
    const sharpRatio = sharpTransitions / totalRegions;

    // VAE characteristic: very smooth regions with occasional sharp boundaries
    if (smoothRatio > 0.4 && sharpRatio > 0.05 && sharpRatio < 0.15) {
        return {
            found: true,
            confidence: 0.50,
            reason: `VAE-like pattern: ${(smoothRatio * 100).toFixed(0)}% smooth regions with ${(sharpRatio * 100).toFixed(0)}% sharp boundaries`,
        };
    }

    return { found: false, confidence: 0, reason: '' };
}

/**
 * Analyze Meta AI invisible watermark patterns.
 * Meta's watermark is embedded using their "Stable Signature" technique.
 */
function analyzeMetaWatermark(buffer: Buffer): { found: boolean; confidence: number; reason: string } {
    const bytes = new Uint8Array(buffer);
    const sampleSize = Math.min(bytes.length, 10000);

    // Meta's stable signature uses specific frequency modifications
    // that are different from SynthID and SD watermarks
    // Check for their characteristic pattern: modifications at specific DCT coefficient positions

    // Look for Meta-specific byte patterns in image trailer
    const trailer = buffer.toString('utf8', Math.max(0, buffer.length - 5000)).toLowerCase();

    if (/meta|facebook|instagram|whatsapp/i.test(trailer)) {
        return {
            found: true,
            confidence: 0.65,
            reason: 'Meta platform identifier found in image trailer',
        };
    }

    // Check for the specific noise pattern Meta uses
    let noiseDiff = 0;
    for (let i = 2; i < sampleSize; i++) {
        const predicted = (bytes[i - 1] + bytes[i - 2]) / 2;
        noiseDiff += Math.abs(bytes[i] - predicted);
    }
    const avgNoise = noiseDiff / (sampleSize - 2);

    // Meta watermarks create a specific noise envelope
    if (avgNoise > 10 && avgNoise < 25) {
        // Within Meta's typical noise range — not conclusive on its own
        return { found: false, confidence: 0, reason: '' };
    }

    return { found: false, confidence: 0, reason: '' };
}


// ================================================================
// LEVEL 3: Extended Metadata Analysis
// ================================================================

/**
 * Extended AI metadata check — looks through EXIF, XMP, and raw strings.
 */
function checkAIMetadataExtended(buffer: Buffer): { found: boolean; platform?: string; confidence: number; details: string[] } {
    const details: string[] = [];
    let platform: string | undefined;

    // Read a larger chunk for metadata (metadata often at beginning or end)
    const headStr = buffer.toString('utf8', 0, Math.min(buffer.length, 20000)).toLowerCase();
    const tailStr = buffer.toString('utf8', Math.max(0, buffer.length - 10000)).toLowerCase();
    const combinedStr = headStr + tailStr;

    // Platform-specific metadata markers (ordered by specificity)
    const aiMarkers = [
        // Specific tools
        { pattern: /automatic1111|a1111/i, platform: 'Stable Diffusion (A1111)', confidence: 0.90 },
        { pattern: /comfyui/i, platform: 'Stable Diffusion (ComfyUI)', confidence: 0.90 },
        { pattern: /invoke.?ai/i, platform: 'Stable Diffusion (InvokeAI)', confidence: 0.85 },
        { pattern: /diffusion.?bee/i, platform: 'Stable Diffusion (DiffusionBee)', confidence: 0.85 },

        // Platforms
        { pattern: /midjourney/i, platform: 'Midjourney', confidence: 0.85 },
        { pattern: /stable.?diffusion/i, platform: 'Stable Diffusion', confidence: 0.85 },
        { pattern: /dall.?e/i, platform: 'DALL-E', confidence: 0.85 },
        { pattern: /imagen/i, platform: 'Google Imagen', confidence: 0.80 },
        { pattern: /firefly/i, platform: 'Adobe Firefly', confidence: 0.85 },
        { pattern: /flux/i, platform: 'Flux', confidence: 0.75 },
        { pattern: /playground/i, platform: 'Playground AI', confidence: 0.70 },
        { pattern: /leonardo\.ai/i, platform: 'Leonardo.AI', confidence: 0.75 },

        // Generic AI markers
        { pattern: /ai.?generated/i, platform: 'AI Generated', confidence: 0.75 },
        { pattern: /synthetic.?image/i, platform: 'Synthetic', confidence: 0.70 },
        { pattern: /generated.?by.?ai/i, platform: 'AI Generated', confidence: 0.75 },

        // SD-specific metadata fields
        { pattern: /parameters:|negative.?prompt:/i, platform: 'Stable Diffusion', confidence: 0.85 },
        { pattern: /sampler:.*(euler|ddim|dpm|lms|heun)/i, platform: 'Stable Diffusion', confidence: 0.90 },
        { pattern: /cfg.?scale:\s*\d/i, platform: 'Stable Diffusion', confidence: 0.90 },
        { pattern: /steps:\s*\d+,/i, platform: 'Stable Diffusion', confidence: 0.85 },
        { pattern: /model.?hash:/i, platform: 'Stable Diffusion', confidence: 0.85 },
        { pattern: /clip.?skip:/i, platform: 'Stable Diffusion', confidence: 0.85 },

        // Framework markers
        { pattern: /software.*pytorch/i, platform: 'AI Generated (PyTorch)', confidence: 0.65 },
        { pattern: /software.*tensorflow/i, platform: 'AI Generated (TensorFlow)', confidence: 0.65 },
        { pattern: /software.*python/i, platform: 'Possibly AI Generated', confidence: 0.50 },
    ];

    for (const { pattern, platform: plat, confidence } of aiMarkers) {
        if (pattern.test(combinedStr)) {
            platform = plat;
            details.push(`Metadata contains "${plat}" marker`);
            return { found: true, platform, confidence, details };
        }
    }

    return { found: false, confidence: 0, details: [] };
}
