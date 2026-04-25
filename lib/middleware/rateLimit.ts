// Simple in-memory rate limiter for API routes
// For production: use Upstash Redis rate limiter

import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private requests: Map<string, RateLimitRecord>;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map<string, RateLimitRecord>();
  }

  check(ip: string): RateLimitResult {
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.requests.set(ip, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (record.count >= this.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return { allowed: false, remaining: 0, resetTime: record.resetTime, retryAfter };
    }

    record.count++;
    return { allowed: true, remaining: this.maxRequests - record.count, resetTime: record.resetTime };
  }
}

const rateLimiter = new RateLimiter(60 * 1000, 100); // 1 minute window, 100 requests per IP

export function getClientIP(request: NextRequest): string {
  const headers = request.headers;
  if (!headers) {
    return "127.0.0.1";
  }

  const forwarded = headers.get("x-forwarded-for");
  const realIP = headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "127.0.0.1";
}

export function checkRateLimit(request: NextRequest): RateLimitResult {
  const ip = getClientIP(request);
  return rateLimiter.check(ip);
}

export type { RateLimitResult };
