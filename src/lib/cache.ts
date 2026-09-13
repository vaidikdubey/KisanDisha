import { Redis } from "@upstash/redis"

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function withCache<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>
): Promise<T> { 
    const cached = await redis.get<T>(key)

    if (cached !== null) { 
        console.log("Cache hit: ", key)
        return cached
    }

    console.log("Cache miss: ", key)
    const fresh = await fetchFn()
    await redis.set(key, fresh, { ex: ttlSeconds })
    return fresh
}