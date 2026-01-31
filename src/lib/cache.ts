import { AnalysisResult, CacheEntry } from './types';

// In-memory cache as fallback when Redis is not available
const memoryCache = new Map<string, CacheEntry>();

// Cache TTL: 24 hours
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Maximum cache size for memory cache
const MAX_CACHE_SIZE = 100;

/**
 * Get cached result by image hash
 */
export async function getCachedResult(imageHash: string): Promise<AnalysisResult | null> {
    try {
        // Try Redis first if configured
        const redisResult = await getFromRedis(imageHash);
        if (redisResult) {
            return redisResult;
        }
    } catch (error) {
        console.log('Redis not available, using memory cache');
    }

    // Fallback to memory cache
    return getFromMemory(imageHash);
}

/**
 * Cache analysis result
 */
export async function cacheResult(imageHash: string, result: AnalysisResult): Promise<void> {
    const entry: CacheEntry = {
        hash: imageHash,
        result,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_TTL,
    };

    try {
        // Try Redis first if configured
        await saveToRedis(imageHash, entry);
    } catch (error) {
        console.log('Redis not available, using memory cache');
    }

    // Always save to memory cache as backup
    saveToMemory(imageHash, entry);
}

/**
 * Check if result is cached
 */
export async function isCached(imageHash: string): Promise<boolean> {
    const result = await getCachedResult(imageHash);
    return result !== null;
}

/**
 * Clear cache (for testing/admin purposes)
 */
export async function clearCache(): Promise<void> {
    memoryCache.clear();

    try {
        await clearRedis();
    } catch (error) {
        console.log('Redis not available for clearing');
    }
}

// =============================================================================
// Redis Operations
// =============================================================================

let redisClient: any = null;

async function getRedisClient() {
    if (redisClient) return redisClient;

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        throw new Error('REDIS_URL not configured');
    }

    // Dynamic import to avoid issues when Redis is not installed
    try {
        const Redis = (await import('ioredis')).default;
        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            connectTimeout: 5000,
        });
        return redisClient;
    } catch (error) {
        throw new Error('Redis client not available');
    }
}

async function getFromRedis(imageHash: string): Promise<AnalysisResult | null> {
    const redis = await getRedisClient();
    const key = `ai-forensic:${imageHash}`;
    const data = await redis.get(key);

    if (!data) return null;

    const entry: CacheEntry = JSON.parse(data);

    // Check if expired
    if (entry.expiresAt < Date.now()) {
        await redis.del(key);
        return null;
    }

    return entry.result;
}

async function saveToRedis(imageHash: string, entry: CacheEntry): Promise<void> {
    const redis = await getRedisClient();
    const key = `ai-forensic:${imageHash}`;
    const ttlSeconds = Math.floor((entry.expiresAt - Date.now()) / 1000);

    await redis.setex(key, ttlSeconds, JSON.stringify(entry));
}

async function clearRedis(): Promise<void> {
    const redis = await getRedisClient();
    const keys = await redis.keys('ai-forensic:*');
    if (keys.length > 0) {
        await redis.del(...keys);
    }
}

// =============================================================================
// Memory Cache Operations
// =============================================================================

function getFromMemory(imageHash: string): AnalysisResult | null {
    const entry = memoryCache.get(imageHash);

    if (!entry) return null;

    // Check if expired
    if (entry.expiresAt < Date.now()) {
        memoryCache.delete(imageHash);
        return null;
    }

    return entry.result;
}

function saveToMemory(imageHash: string, entry: CacheEntry): void {
    // Enforce max cache size by removing oldest entries
    if (memoryCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = memoryCache.keys().next().value;
        if (oldestKey) {
            memoryCache.delete(oldestKey);
        }
    }

    memoryCache.set(imageHash, entry);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { memorySize: number; oldestEntry: number | null } {
    let oldestTimestamp: number | null = null;

    memoryCache.forEach((entry) => {
        if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
            oldestTimestamp = entry.timestamp;
        }
    });

    return {
        memorySize: memoryCache.size,
        oldestEntry: oldestTimestamp,
    };
}
