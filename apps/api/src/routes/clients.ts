import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { createClientSchema, updateClientSchema } from '@kivo/shared';
import type { Client } from '@kivo/shared';
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors';
import { generateUUID } from '../utils/crypto';
import { authMiddleware } from '../middleware/auth';
import { AnalyticsService } from '../services/analytics';

const clients = new Hono<{ Bindings: Env; Variables: Variables }>();

// All client routes require authentication
clients.use('/*', authMiddleware);

/**
 * List all clients for the authenticated user
 */
clients.get('/', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  
  const { archived } = c.req.query();
  const showArchived = archived === 'true';

  const result = await c.env.DB.prepare(
    `SELECT * FROM clients WHERE user_id = ? AND archived = ? ORDER BY created_at DESC`
  ).bind(userId, showArchived ? 1 : 0).all<Client>();

  return c.json({
    data: result.results,
    requestId,
  });
});

/**
 * Get a single client by ID
 */
clients.get('/:id', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const clientId = c.req.param('id');

  const client = await c.env.DB.prepare(
    'SELECT * FROM clients WHERE id = ? AND user_id = ?'
  ).bind(clientId, userId).first<Client>();

  if (!client) {
    throw new NotFoundError('Client');
  }

  return c.json({
    data: client,
    requestId,
  });
});

/**
 * Create a new client
 */
clients.post('/', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  
  const body = await c.req.json();
  const result = createClientSchema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.flatten());
  }

  const { name, email, company, address, notes } = result.data;
  const clientId = generateUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO clients (id, user_id, name, email, company, address, notes, archived, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).bind(clientId, userId, name, email, company || null, address || null, notes || null, now, now).run();

  const client = await c.env.DB.prepare(
    'SELECT * FROM clients WHERE id = ?'
  ).bind(clientId).first<Client>();

  // Track analytics
  const analytics = new AnalyticsService();
  analytics.trackClientCreated(userId, clientId);

  return c.json({
    data: client,
    requestId,
  }, 201);
});

/**
 * Update a client
 */
clients.patch('/:id', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const clientId = c.req.param('id');

  // Check client exists and belongs to user
  const existingClient = await c.env.DB.prepare(
    'SELECT id FROM clients WHERE id = ? AND user_id = ?'
  ).bind(clientId, userId).first();

  if (!existingClient) {
    throw new NotFoundError('Client');
  }

  const body = await c.req.json();
  const result = updateClientSchema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.flatten());
  }

  const updates = result.data;
  const now = new Date().toISOString();

  // Build dynamic update query
  const fields: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.email !== undefined) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.company !== undefined) {
    fields.push('company = ?');
    values.push(updates.company);
  }
  if (updates.address !== undefined) {
    fields.push('address = ?');
    values.push(updates.address);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }
  if (updates.archived !== undefined) {
    fields.push('archived = ?');
    values.push(updates.archived ? 1 : 0);
  }

  values.push(clientId, userId);

  await c.env.DB.prepare(
    `UPDATE clients SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...values).run();

  const client = await c.env.DB.prepare(
    'SELECT * FROM clients WHERE id = ?'
  ).bind(clientId).first<Client>();

  return c.json({
    data: client,
    requestId,
  });
});

/**
 * Archive a client (soft delete)
 */
clients.delete('/:id', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const clientId = c.req.param('id');

  // Check client exists and belongs to user
  const existingClient = await c.env.DB.prepare(
    'SELECT id FROM clients WHERE id = ? AND user_id = ?'
  ).bind(clientId, userId).first();

  if (!existingClient) {
    throw new NotFoundError('Client');
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(
    'UPDATE clients SET archived = 1, updated_at = ? WHERE id = ? AND user_id = ?'
  ).bind(now, clientId, userId).run();

  return c.json({
    data: { message: 'Client archived' },
    requestId,
  });
});

/**
 * Restore an archived client
 */
clients.post('/:id/restore', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const clientId = c.req.param('id');

  // Check client exists and belongs to user
  const existingClient = await c.env.DB.prepare(
    'SELECT id FROM clients WHERE id = ? AND user_id = ?'
  ).bind(clientId, userId).first();

  if (!existingClient) {
    throw new NotFoundError('Client');
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(
    'UPDATE clients SET archived = 0, updated_at = ? WHERE id = ? AND user_id = ?'
  ).bind(now, clientId, userId).run();

  const client = await c.env.DB.prepare(
    'SELECT * FROM clients WHERE id = ?'
  ).bind(clientId).first<Client>();

  return c.json({
    data: client,
    requestId,
  });
});

export { clients };
