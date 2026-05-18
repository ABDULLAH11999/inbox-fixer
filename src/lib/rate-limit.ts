import { getPlans, getGuestScans, writeGuestScans } from './db';

// Memory-based store for free/pro registered users rate limiting
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of inMemoryStore.entries()) {
      if (now > val.resetAt) {
        inMemoryStore.delete(key);
      }
    }
  }, 60000);
}

export async function checkRateLimit(
  identifier: string,
  tier: 'guest' | 'free' | 'pro' = 'guest'
) {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24-hour rolling window

  const plans = getPlans();
  const planObj = plans.find(p => p.id === tier);
  const limit = planObj ? planObj.scans_limit : (tier === 'guest' ? 3 : tier === 'free' ? 10 : 999999);

  // 1. Air-tight persistent file-based rate limiting for GUESTS to prevent incognito/VPN bypasses
  if (tier === 'guest') {
    try {
      const guestScans = getGuestScans();
      const ipKey = identifier.toLowerCase().trim();
      const idx = guestScans.findIndex((g: any) => g.ip === ipKey);

      if (idx === -1) {
        const resetAtTime = now + windowMs;
        const newRecord = {
          ip: ipKey,
          count: 1,
          resetAt: new Date(resetAtTime).toISOString()
        };
        guestScans.push(newRecord);
        writeGuestScans(guestScans);

        return {
          allowed: true,
          remaining: Math.max(0, limit - 1),
          resetAt: new Date(resetAtTime),
        };
      }

      const record = guestScans[idx];
      const resetTime = new Date(record.resetAt).getTime();

      if (now > resetTime) {
        const resetAtTime = now + windowMs;
        record.count = 1;
        record.resetAt = new Date(resetAtTime).toISOString();
        writeGuestScans(guestScans);

        return {
          allowed: true,
          remaining: Math.max(0, limit - 1),
          resetAt: new Date(resetAtTime),
        };
      }

      if (record.count < limit) {
        record.count += 1;
        writeGuestScans(guestScans);

        return {
          allowed: true,
          remaining: Math.max(0, limit - record.count),
          resetAt: new Date(resetTime),
        };
      }

      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(resetTime),
      };
    } catch (err) {
      console.error('Persistent rate limit error, falling back to memory store:', err);
    }
  }

  // 2. Standard memory rate limiter for registered free/pro accounts
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
