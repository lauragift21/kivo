import type { Context } from 'hono';
import type { User } from '@kivo/shared';

export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  REMINDER_SCHEDULER: DurableObjectNamespace;
  ASSETS: Fetcher;
  
  // Environment variables
  ENVIRONMENT: string;
  FRONTEND_URL: string;
  API_URL: string;
  FROM_EMAIL: string;
  
  // Secrets (set via wrangler secret)
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

export interface Variables {
  requestId: string;
  user?: User;
  userId?: string;
}

export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

export interface RateLimitState {
  count: number;
  reset_at: number;
}

export interface StructuredLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  [key: string]: unknown;
}
