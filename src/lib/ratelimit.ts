import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const chatRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s") // 5 RPM/client
})

export const apiRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s")
})