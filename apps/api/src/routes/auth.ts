import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { signUpSchema, signInSchema, verifyMagicLinkSchema } from '@kivo/shared';
import { ValidationError, AuthenticationError, NotFoundError } from '../utils/errors';
import { generateUUID, generateToken, createJWT } from '../utils/crypto';
import { EmailService } from '../services/email';
import { authRateLimiter } from '../middleware/rate-limit';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// Apply rate limiting to all auth routes
auth.use('/*', authRateLimiter);

/**
 * Sign up - Create a new user and send magic link
 */
auth.post('/signup', async (c) => {
  const requestId = c.get('requestId');
  
  try {
    const body = await c.req.json();
    const result = signUpSchema.safeParse(body);
    
    if (!result.success) {
      throw new ValidationError('Invalid input', result.error.flatten());
    }

    const { email, name } = result.data;

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      throw new ValidationError('An account with this email already exists');
    }

    // Create user
    const userId = generateUUID();
    const now = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(userId, email, name, now, now).run();

    // Create default settings for user
    const settingsId = generateUUID();
    await c.env.DB.prepare(
      `INSERT INTO settings (id, user_id, default_currency, default_payment_terms, timezone, invoice_prefix, next_invoice_number, created_at, updated_at)
       VALUES (?, ?, 'USD', 'net_30', 'Europe/Amsterdam', 'INV', 1, ?, ?)`
    ).bind(settingsId, userId, now, now).run();

    // Create magic link token
    const token = generateToken(32);
    const tokenId = generateUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    await c.env.DB.prepare(
      `INSERT INTO magic_link_tokens (id, user_id, email, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(tokenId, userId, email, token, expiresAt, now).run();

    // In development mode, skip email and return the magic link directly
    const isDevelopment = c.env.ENVIRONMENT === 'development';
    
    if (isDevelopment) {
      const magicLink = `${c.env.FRONTEND_URL}/auth/verify?token=${token}`;
      console.log(`[DEV] Magic link for ${email}: ${magicLink}`);
      
      return c.json({
        data: {
          message: 'Check your email for a sign-in link',
          // Only include in dev mode for testing
          _dev: {
            magicLink,
            note: 'This is only shown in development mode',
          },
        },
        requestId,
      });
    }

    // Send magic link email in production
    const emailService = new EmailService(c.env.RESEND_API_KEY, c.env.FROM_EMAIL);
    await emailService.sendMagicLink(email, token, c.env.FRONTEND_URL);

    return c.json({
      data: {
        message: 'Check your email for a sign-in link',
      },
      requestId,
    });
  } catch (error) {
    // Log the actual error for debugging
    console.error('Signup error:', error);
    throw error;
  }
});

/**
 * Sign in - Send magic link to existing user
 */
auth.post('/signin', async (c) => {
  const body = await c.req.json();
  const result = signInSchema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.flatten());
  }

  const { email } = result.data;
  const requestId = c.get('requestId');

  // Find user
  const user = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first<{ id: string }>();

  if (!user) {
    // Don't reveal whether user exists - just say email sent
    return c.json({
      data: {
        message: 'If an account exists, check your email for a sign-in link',
      },
      requestId,
    });
  }

  // Create magic link token
  const token = generateToken(32);
  const tokenId = generateUUID();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  await c.env.DB.prepare(
    `INSERT INTO magic_link_tokens (id, user_id, email, token, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(tokenId, user.id, email, token, expiresAt, now).run();

  // In development mode, skip email and return the magic link directly
  const isDevelopment = c.env.ENVIRONMENT === 'development';
  
  if (isDevelopment) {
    const magicLink = `${c.env.FRONTEND_URL}/auth/verify?token=${token}`;
    console.log(`[DEV] Magic link for ${email}: ${magicLink}`);
    
    return c.json({
      data: {
        message: 'If an account exists, check your email for a sign-in link',
        // Only include in dev mode for testing
        _dev: {
          magicLink,
          note: 'This is only shown in development mode',
        },
      },
      requestId,
    });
  }

  // Send magic link email in production
  const emailService = new EmailService(c.env.RESEND_API_KEY, c.env.FROM_EMAIL);
  await emailService.sendMagicLink(email, token, c.env.FRONTEND_URL);

  return c.json({
    data: {
      message: 'If an account exists, check your email for a sign-in link',
    },
    requestId,
  });
});

/**
 * Verify magic link and return JWT
 */
auth.post('/verify', async (c) => {
  const body = await c.req.json();
  const result = verifyMagicLinkSchema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.flatten());
  }

  const { token } = result.data;
  const requestId = c.get('requestId');
  const now = new Date().toISOString();

  // Find and validate token
  const magicToken = await c.env.DB.prepare(
    `SELECT id, user_id, email, expires_at, used_at FROM magic_link_tokens WHERE token = ?`
  ).bind(token).first<{
    id: string;
    user_id: string;
    email: string;
    expires_at: string;
    used_at: string | null;
  }>();

  if (!magicToken) {
    throw new AuthenticationError('Invalid or expired link');
  }

  if (magicToken.used_at) {
    throw new AuthenticationError('This link has already been used');
  }

  if (new Date(magicToken.expires_at) < new Date()) {
    throw new AuthenticationError('This link has expired');
  }

  // Mark token as used
  await c.env.DB.prepare(
    'UPDATE magic_link_tokens SET used_at = ? WHERE id = ?'
  ).bind(now, magicToken.id).run();

  // Get user
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?'
  ).bind(magicToken.user_id).first();

  if (!user) {
    throw new NotFoundError('User');
  }

  // Create JWT
  const jwt = await createJWT(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    c.env.JWT_SECRET,
    86400 * 7 // 7 days
  );

  return c.json({
    data: {
      user,
      token: jwt,
      expires_at: new Date(Date.now() + 86400 * 7 * 1000).toISOString(),
    },
    requestId,
  });
});

/**
 * Get current user
 */
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  const requestId = c.get('requestId');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const { verifyJWT } = await import('../utils/crypto');
  const payload = await verifyJWT<{ sub: string }>(token, c.env.JWT_SECRET);
  
  if (!payload) {
    throw new AuthenticationError('Invalid or expired token');
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?'
  ).bind(payload.sub).first();

  if (!user) {
    throw new NotFoundError('User');
  }

  return c.json({
    data: { user },
    requestId,
  });
});

/**
 * Sign out - Client-side token removal, but we can invalidate if needed
 */
auth.post('/signout', async (c) => {
  const requestId = c.get('requestId');
  
  // In a production app, you might want to:
  // - Add the token to a blocklist
  // - Delete any active sessions from a sessions table
  
  return c.json({
    data: {
      message: 'Signed out successfully',
    },
    requestId,
  });
});

export { auth };
