/**
 * Rate limiting: 5 submissions per hour per IP (Section 10).
 *
 * Upstash is optional. When its env vars are absent — local dev, preview
 * builds, or a misconfigured deploy — this falls back to an in-process
 * counter. That is genuinely weaker (it resets on cold start and is per
 * instance, not global) but it is strictly better than no limit at all, and it
 * means a missing env var degrades the protection rather than breaking the
 * forms outright.
 */

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

type Bucket = { count: number; resetAt: number };
const memory = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; remaining: number };

async function upstashLimit(key: string): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });
    const redisKey = `ratelimit:lead:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) await redis.pexpire(redisKey, WINDOW_MS);
    return { allowed: count <= LIMIT, remaining: Math.max(0, LIMIT - count) };
  } catch (error) {
    // A Redis outage must not take the contact forms down.
    console.error("[rate-limit] Upstash unavailable, falling back", error);
    return null;
  }
}

function memoryLimit(key: string): RateLimitResult {
  const now = Date.now();
  const bucket = memory.get(key);
  if (!bucket || bucket.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= LIMIT, remaining: Math.max(0, LIMIT - bucket.count) };
}

export async function rateLimit(key: string): Promise<RateLimitResult> {
  return (await upstashLimit(key)) ?? memoryLimit(key);
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
