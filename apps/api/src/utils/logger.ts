import type { StructuredLog } from '../types';

export function createLogger(requestId?: string, userId?: string) {
  const log = (level: StructuredLog['level'], message: string, data?: Record<string, unknown>) => {
    const entry: StructuredLog = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      userId,
      ...data,
    };
    
    const output = JSON.stringify(entry);
    
    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  };

  return {
    debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
    info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
    warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
    error: (message: string, error?: Error, data?: Record<string, unknown>) =>
      log('error', message, {
        ...data,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      }),
  };
}

export type Logger = ReturnType<typeof createLogger>;
