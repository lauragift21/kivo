import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types';
import { createLogger } from '../utils/logger';

// Logging middleware - logs completed requests
export const errorHandlerMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const startTime = Date.now();
  const requestId = c.get('requestId');
  const logger = createLogger(requestId);

  await next();
  
  const duration = Date.now() - startTime;
  logger.info('Request completed', {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
  });
});
