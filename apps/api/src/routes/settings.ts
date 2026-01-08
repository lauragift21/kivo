import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { updateSettingsSchema } from '@kivo/shared';
import type { Settings } from '@kivo/shared';
import { ValidationError, NotFoundError } from '../utils/errors';
import { authMiddleware } from '../middleware/auth';
import { generateUUID } from '../utils/crypto';

const settings = new Hono<{ Bindings: Env; Variables: Variables }>();

settings.use('/*', authMiddleware);

/**
 * Get user settings
 */
settings.get('/', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');

  let userSettings = await c.env.DB.prepare(
    'SELECT * FROM settings WHERE user_id = ?'
  ).bind(userId).first<Settings>();

  // Create default settings if none exist
  if (!userSettings) {
    const now = new Date().toISOString();
    const settingsId = generateUUID();

    await c.env.DB.prepare(
      `INSERT INTO settings (id, user_id, default_currency, default_payment_terms, timezone, invoice_prefix, next_invoice_number, created_at, updated_at)
       VALUES (?, ?, 'USD', 'net_30', 'Europe/Amsterdam', 'INV', 1, ?, ?)`
    ).bind(settingsId, userId, now, now).run();

    userSettings = await c.env.DB.prepare(
      'SELECT * FROM settings WHERE id = ?'
    ).bind(settingsId).first<Settings>();
  }

  return c.json({
    data: userSettings,
    requestId,
  });
});

/**
 * Update user settings
 */
settings.patch('/', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');

  const body = await c.req.json();
  const result = updateSettingsSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.flatten());
  }

  const updates = result.data;
  const now = new Date().toISOString();

  // Check if settings exist
  let userSettings = await c.env.DB.prepare(
    'SELECT id FROM settings WHERE user_id = ?'
  ).bind(userId).first<{ id: string }>();

  if (!userSettings) {
    // Create settings first
    const settingsId = generateUUID();
    await c.env.DB.prepare(
      `INSERT INTO settings (id, user_id, default_currency, default_payment_terms, timezone, invoice_prefix, next_invoice_number, created_at, updated_at)
       VALUES (?, ?, 'USD', 'net_30', 'Europe/Amsterdam', 'INV', 1, ?, ?)`
    ).bind(settingsId, userId, now, now).run();
    userSettings = { id: settingsId };
  }

  // Build dynamic update query
  const fields: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  if (updates.business_name !== undefined) {
    fields.push('business_name = ?');
    values.push(updates.business_name);
  }
  if (updates.business_email !== undefined) {
    fields.push('business_email = ?');
    values.push(updates.business_email);
  }
  if (updates.business_address !== undefined) {
    fields.push('business_address = ?');
    values.push(updates.business_address);
  }
  if (updates.default_currency !== undefined) {
    fields.push('default_currency = ?');
    values.push(updates.default_currency);
  }
  if (updates.default_payment_terms !== undefined) {
    fields.push('default_payment_terms = ?');
    values.push(updates.default_payment_terms);
  }
  if (updates.timezone !== undefined) {
    fields.push('timezone = ?');
    values.push(updates.timezone);
  }
  if (updates.email_from_name !== undefined) {
    fields.push('email_from_name = ?');
    values.push(updates.email_from_name);
  }
  if (updates.invoice_prefix !== undefined) {
    fields.push('invoice_prefix = ?');
    values.push(updates.invoice_prefix);
  }

  values.push(userId);

  await c.env.DB.prepare(
    `UPDATE settings SET ${fields.join(', ')} WHERE user_id = ?`
  ).bind(...values).run();

  const updatedSettings = await c.env.DB.prepare(
    'SELECT * FROM settings WHERE user_id = ?'
  ).bind(userId).first<Settings>();

  return c.json({
    data: updatedSettings,
    requestId,
  });
});

/**
 * Upload business logo
 */
settings.post('/logo', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');

  const formData = await c.req.formData();
  const fileEntry = formData.get('logo');

  if (!fileEntry || typeof fileEntry === 'string') {
    throw new ValidationError('No logo file provided');
  }

  // Cast to File - we've verified it's not a string above
  const file = fileEntry as unknown as File;

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError('Invalid file type. Allowed: PNG, JPEG, SVG');
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new ValidationError('File size must be less than 2MB');
  }

  // Determine file extension
  const ext = file.type === 'image/svg+xml' ? 'svg' : file.type === 'image/png' ? 'png' : 'jpg';
  const key = `${userId}/branding/logo.${ext}`;

  // Upload to R2
  await c.env.STORAGE.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  const logoUrl = `${c.env.API_URL}/api/settings/logo`;
  const now = new Date().toISOString();

  // Update settings with logo URL
  await c.env.DB.prepare(
    'UPDATE settings SET logo_url = ?, updated_at = ? WHERE user_id = ?'
  ).bind(logoUrl, now, userId).run();

  return c.json({
    data: {
      message: 'Logo uploaded successfully',
      logo_url: logoUrl,
    },
    requestId,
  });
});

/**
 * Get business logo
 */
settings.get('/logo', async (c) => {
  const userId = c.get('userId')!;

  // Try different extensions
  const extensions = ['png', 'jpg', 'svg'];
  let logo = null;
  let contentType = '';

  for (const ext of extensions) {
    const key = `${userId}/branding/logo.${ext}`;
    logo = await c.env.STORAGE.get(key);
    if (logo) {
      contentType = ext === 'svg' ? 'image/svg+xml' : ext === 'png' ? 'image/png' : 'image/jpeg';
      break;
    }
  }

  if (!logo) {
    throw new NotFoundError('Logo');
  }

  return new Response(logo.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

/**
 * Delete business logo
 */
settings.delete('/logo', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');

  // Try to delete all possible extensions
  const extensions = ['png', 'jpg', 'svg'];
  for (const ext of extensions) {
    const key = `${userId}/branding/logo.${ext}`;
    await c.env.STORAGE.delete(key);
  }

  const now = new Date().toISOString();

  // Update settings to remove logo URL
  await c.env.DB.prepare(
    'UPDATE settings SET logo_url = NULL, updated_at = ? WHERE user_id = ?'
  ).bind(now, userId).run();

  return c.json({
    data: { message: 'Logo deleted successfully' },
    requestId,
  });
});

export { settings };
