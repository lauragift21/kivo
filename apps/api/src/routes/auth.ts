import { Hono } from 'hono';
import type { Env, Variables } from '../types';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * Single-tenant: no user authentication.
 * These endpoints remain for backward compatibility but always succeed.
 */

auth.post('/signup', async (c) => {
  const requestId = c.get('requestId');
  return c.json({
    data: { message: 'Kivo is running in single-tenant mode. No signup required.' },
    requestId,
  });
});

auth.post('/signin', async (c) => {
  const requestId = c.get('requestId');
  return c.json({
    data: { message: 'Kivo is running in single-tenant mode. No sign-in required.' },
    requestId,
  });
});

auth.post('/verify', async (c) => {
  const requestId = c.get('requestId');
  return c.json({
    data: {
      user: null,
      token: 'single-tenant',
      expires_at: new Date(Date.now() + 86400 * 365 * 1000).toISOString(),
    },
    requestId,
  });
});

auth.get('/me', async (c) => {
  const requestId = c.get('requestId');
  return c.json({
    data: {
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Admin',
        email: 'admin@localhost',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    requestId,
  });
});

auth.post('/signout', async (c) => {
  const requestId = c.get('requestId');
  return c.json({
    data: { message: 'Signed out successfully' },
    requestId,
  });
});

export { auth };
