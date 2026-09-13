import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function withCache<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>,
): Promise<T> {
    const cached = await redis.get<T>(key);

    if (cached !== null) return cached;

    const fresh = await fetchFn();

    if (Array.isArray(fresh) && fresh.length === 0) {
        console.warn("Skipped caching empty result for key: ", key);

        return fresh;
    }

    await redis.set(key, fresh, { ex: ttlSeconds });
    return fresh;
}
