import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types';

/**
 * Single-tenant: auth is a no-op.
 * Any visitor to this deployment has full access.
 */
export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (_c, next) => {
  await next();
});

/**
 * Optional auth - also a no-op in single-tenant mode
 */
export const optionalAuthMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (_c, next) => {
  await next();
});
