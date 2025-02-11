import type { CacheOptions } from '../types';

export class MemoryCache {
    private cache: Map<string, { value: any, expiry: number }>;
    private cleanupInterval: number;
    private intervalId: NodeJS.Timeout;

    constructor(cleanupInterval = 60000) { // Default cleanup every minute
        this.cache = new Map();
        this.cleanupInterval = cleanupInterval;
        this.intervalId = setInterval(() => this.cleanup(), this.cleanupInterval);
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }

    async destroyAll() {
        for (const [key, item] of this.cache.entries()) {
            this.cache.delete(key);
        }
    }

    async get(key: string) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    async set(key: string, value: any, options?: CacheOptions) {
        const expiry = Date.now() + ((options?.ex || 0) * 1000);
        this.cache.set(key, { value, expiry });
    }

    async del(key: string) {
        this.cache.delete(key);
    }

    // Clean up the interval when the cache is no longer needed
    destroy() {
        clearInterval(this.intervalId);
    }
}

export const cache = new MemoryCache();