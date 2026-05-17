import { getPlans } from './db';

// Memory-based store for rate limiting
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup of expired entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of inMemoryStore.entries()) {
      if (now > val.resetAt) {
        inMemoryStore.delete(key);
      }
    }
  }, 60000); // every 1 minute
}

export async function checkRateLimit(
  identifier: string,
  tier: 'guest' | 'free' | 'pro' = 'guest'
) {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24-hour rolling window

  // Load limits dynamically from local plans table!
  const plans = getPlans();
  const planObj = plans.find(p => p.id === tier);
  const limit = planObj ? planObj.scans_limit : (tier === 'guest' ? 3 : tier === 'free' ? 10 : 999999);

  const key = `${tier}:${identifier}`;
  const record = inMemoryStore.get(key);

  if (!record || now > record.resetAt) {
    const resetTime = now + windowMs;
    inMemoryStore.set(key, { count: 1, resetAt: resetTime });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt: new Date(resetTime),
    };
  }

  if (record.count < limit) {
    record.count += 1;
    return {
      allowed: true,
      remaining: Math.max(0, limit - record.count),
      resetAt: new Date(record.resetAt),
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetAt: new Date(record.resetAt),
  };
}
