import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types';
import { verifyJWT } from '../utils/crypto';
import { AuthenticationError } from '../utils/errors';
import type { User } from '@kivo/shared';

interface JWTPayload {
  sub: string;
  email: string;
  name: string;
}

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  let token: string | null = null;
  
  // Check Authorization header first
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }
  
  // Fall back to query param token (for direct browser access like PDF viewing)
  if (!token) {
    token = c.req.query('token') || null;
  }
  
  if (!token) {
    throw new AuthenticationError('Missing or invalid authorization');
  }

  const payload = await verifyJWT<JWTPayload>(token, c.env.JWT_SECRET);
  
  if (!payload) {
    throw new AuthenticationError('Invalid or expired token');
  }

  // Fetch user from database to ensure they still exist
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?'
  )
    .bind(payload.sub)
    .first<User>();

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  c.set('user', user);
  c.set('userId', user.id);
  
  await next();
});

// Optional auth - doesn't throw if no token, but sets user if valid token exists
export const optionalAuthMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = await verifyJWT<JWTPayload>(token, c.env.JWT_SECRET);
    
    if (payload) {
      const user = await c.env.DB.prepare(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?'
      )
        .bind(payload.sub)
        .first<User>();

      if (user) {
        c.set('user', user);
        c.set('userId', user.id);
      }
    }
  }
  
  await next();
});
