import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types';
import { RateLimitError } from '../utils/errors';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: any) => string;
}

// In-memory rate limit store (for simplicity - in production, use KV or Durable Objects)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return createMiddleware<{
    Bindings: Env;
    Variables: Variables;
  }>(async (c, next) => {
    const key = config.keyGenerator 
      ? config.keyGenerator(c)
      : c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    
    if (entry && entry.resetAt > now) {
      if (entry.count >= config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        c.header('Retry-After', retryAfter.toString());
        c.header('X-RateLimit-Limit', config.maxRequests.toString());
        c.header('X-RateLimit-Remaining', '0');
        c.header('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());
        throw new RateLimitError(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      }
      entry.count++;
    } else {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
    }
    
    const currentEntry = rateLimitStore.get(key)!;
    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, config.maxRequests - currentEntry.count).toString());
    c.header('X-RateLimit-Reset', Math.ceil(currentEntry.resetAt / 1000).toString());
    
    await next();
  });
}

// Preset rate limiters
export const authRateLimiter = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});

export const publicInvoiceRateLimiter = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
});

export const apiRateLimiter = createRateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});
