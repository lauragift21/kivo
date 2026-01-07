import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types';
import { AppError, formatErrorResponse } from '../utils/errors';
import { createLogger } from '../utils/logger';

export const errorHandlerMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const startTime = Date.now();
  const requestId = c.get('requestId');
  const logger = createLogger(requestId);

  try {
    await next();
    
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof AppError) {
      logger.warn('Request failed with application error', {
        method: c.req.method,
        path: c.req.path,
        status: error.statusCode,
        errorCode: error.code,
        duration,
      });

      return c.json(formatErrorResponse(error, requestId), error.statusCode as any);
    }

    logger.error('Request failed with unexpected error', error as Error, {
      method: c.req.method,
      path: c.req.path,
      duration,
    });

    const isDevelopment = c.env.ENVIRONMENT === 'development';
    return c.json(formatErrorResponse(error as Error, requestId, isDevelopment), 500);
  }
});
