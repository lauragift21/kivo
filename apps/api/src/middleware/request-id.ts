import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types';
import { generateUUID } from '../utils/crypto';

export const requestIdMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const requestId = c.req.header('X-Request-ID') || generateUUID();
  c.set('requestId', requestId);
  c.header('X-Request-ID', requestId);
  await next();
});
