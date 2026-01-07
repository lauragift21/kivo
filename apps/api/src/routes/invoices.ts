import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceFilterSchema,
  calculateInvoiceTotals,
  generateInvoiceNumber,
} from '@kivo/shared';
import type { Invoice, InvoiceItem, InvoiceWithClient, Client, Settings } from '@kivo/shared';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';
import { generateUUID, generateToken } from '../utils/crypto';
import { authMiddleware } from '../middleware/auth';
import { PDFService } from '../services/pdf';
import { EmailService } from '../services/email';
import { AnalyticsService } from '../services/analytics';

const invoices = new Hono<{ Bindings: Env; Variables: Variables }>();

// All invoice routes require authentication
invoices.use('/*', authMiddleware);

/**
 * List invoices with filtering and pagination
 */
invoices.get('/', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  
  const query = c.req.query();
  const result = invoiceFilterSchema.safeParse({
    status: query.status || undefined,
    client_id: query.client_id || undefined,
    date_from: query.date_from || undefined,
    date_to: query.date_to || undefined,
    page: query.page ? parseInt(query.page) : 1,
    limit: query.limit ? parseInt(query.limit) : 20,
  });

  if (!result.success) {
    throw new ValidationError('Invalid filter parameters', result.error.flatten());
  }

  const filters = result.data;
  const offset = (filters.page - 1) * filters.limit;

  // Build dynamic query
  let whereClause = 'user_id = ?';
  const params: any[] = [userId];

  if (filters.status) {
    whereClause += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.client_id) {
    whereClause += ' AND client_id = ?';
    params.push(filters.client_id);
  }
  if (filters.date_from) {
    whereClause += ' AND issue_date >= ?';
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    whereClause += ' AND issue_date <= ?';
    params.push(filters.date_to);
  }

  // Get total count
  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM invoices WHERE ${whereClause}`
  ).bind(...params).first<{ count: number }>();

  const total = countResult?.count || 0;

  // Get invoices with client info
  const invoicesResult = await c.env.DB.prepare(
    `SELECT i.*, c.name as client_name, c.email as client_email, c.company as client_company
     FROM invoices i
     LEFT JOIN clients c ON i.client_id = c.id
     WHERE i.${whereClause}
     ORDER BY i.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...params, filters.limit, offset).all();

  return c.json({
    data: invoicesResult.results,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      total_pages: Math.ceil(total / filters.limit),
    },
    requestId,
  });
});

/**
 * Get a single invoice with items and client
 */
invoices.get('/:id', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const invoiceId = c.req.param('id');

  const invoice = await c.env.DB.prepare(
    'SELECT * FROM invoices WHERE id = ? AND user_id = ?'
  ).bind(invoiceId, userId).first<Invoice>();

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  // Get client
  const client = await c.env.DB.prepare(
    'SELECT id, name, email, company, address FROM clients WHERE id = ?'
  ).bind(invoice.client_id).first();

  // Get items
  const items = await c.env.DB.prepare(
    'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order'
  ).bind(invoiceId).all<InvoiceItem>();

  // Get events
  const events = await c.env.DB.prepare(
    'SELECT * FROM invoice_events WHERE invoice_id = ? ORDER BY created_at DESC'
  ).bind(invoiceId).all();

  // Get payments
  const payments = await c.env.DB.prepare(
    'SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at DESC'
  ).bind(invoiceId).all();

  return c.json({
    data: {
      ...invoice,
      client,
      items: items.results,
      events: events.results,
      payments: payments.results,
    },
    requestId,
  });
});

/**
 * Create a new invoice
 */
invoices.post('/', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  
  const body = await c.req.json();
  const result = createInvoiceSchema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.flatten());
  }

  const data = result.data;

  // Verify client belongs to user
  const client = await c.env.DB.prepare(
    'SELECT id FROM clients WHERE id = ? AND user_id = ? AND archived = 0'
  ).bind(data.client_id, userId).first();

  if (!client) {
    throw new NotFoundError('Client');
  }

  // Get user settings for invoice number
  const settings = await c.env.DB.prepare(
    'SELECT * FROM settings WHERE user_id = ?'
  ).bind(userId).first<Settings>();

  // Calculate totals
  const totals = calculateInvoiceTotals(
    data.items,
    data.discount_type,
    data.discount_value
  );

  const invoiceId = generateUUID();
  const now = new Date().toISOString();

  // Generate invoice number if not provided
  let invoiceNumber = data.invoice_number;
  if (!invoiceNumber && settings) {
    invoiceNumber = generateInvoiceNumber(settings.invoice_prefix, settings.next_invoice_number);
    // Update next invoice number
    await c.env.DB.prepare(
      'UPDATE settings SET next_invoice_number = next_invoice_number + 1, updated_at = ? WHERE user_id = ?'
    ).bind(now, userId).run();
  }

  // Insert invoice
  await c.env.DB.prepare(
    `INSERT INTO invoices (
      id, user_id, client_id, invoice_number, status, issue_date, due_date,
      currency, subtotal, tax_total, discount_type, discount_value, discount_amount,
      total, notes, payment_terms, reminders_enabled, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    invoiceId, userId, data.client_id, invoiceNumber, data.issue_date, data.due_date,
    data.currency, totals.subtotal, totals.tax_total, data.discount_type || null,
    data.discount_value || null, totals.discount_amount, totals.total,
    data.notes || null, data.payment_terms || null, data.reminders_enabled !== false ? 1 : 0,
    now, now
  ).run();

  // Insert items
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const itemId = generateUUID();
    const itemAmount = totals.item_amounts[i];

    await c.env.DB.prepare(
      `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, amount, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(itemId, invoiceId, item.description, item.quantity, item.unit_price, item.tax_rate || null, itemAmount, i).run();
  }

  // Create invoice event
  await c.env.DB.prepare(
    `INSERT INTO invoice_events (id, invoice_id, event_type, created_at)
     VALUES (?, ?, 'created', ?)`
  ).bind(generateUUID(), invoiceId, now).run();

  // Track analytics
  const analytics = new AnalyticsService();
  analytics.trackInvoiceCreated(userId, invoiceId, totals.total, data.currency);

  // Fetch complete invoice
  const invoice = await getInvoiceWithDetails(c.env.DB, invoiceId);

  return c.json({
    data: invoice,
    requestId,
  }, 201);
});

/**
 * Update an invoice
 */
invoices.patch('/:id', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const invoiceId = c.req.param('id');

  // Check invoice exists and belongs to user
  const existingInvoice = await c.env.DB.prepare(
    'SELECT * FROM invoices WHERE id = ? AND user_id = ?'
  ).bind(invoiceId, userId).first<Invoice>();

  if (!existingInvoice) {
    throw new NotFoundError('Invoice');
  }

  // Can only edit draft invoices (or update status)
  const body = await c.req.json();
  const result = updateInvoiceSchema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.flatten());
  }

  const data = result.data;
  const now = new Date().toISOString();

  // If updating items, recalculate totals
  if (data.items && existingInvoice.status !== 'draft') {
    throw new ValidationError('Cannot modify items on a non-draft invoice');
  }

  let totals;
  if (data.items) {
    totals = calculateInvoiceTotals(
      data.items,
      data.discount_type ?? existingInvoice.discount_type,
      data.discount_value ?? existingInvoice.discount_value
    );

    // Delete existing items
    await c.env.DB.prepare(
      'DELETE FROM invoice_items WHERE invoice_id = ?'
    ).bind(invoiceId).run();

    // Insert new items
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const itemId = generateUUID();
      const itemAmount = totals.item_amounts[i];

      await c.env.DB.prepare(
        `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, amount, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(itemId, invoiceId, item.description, item.quantity, item.unit_price, item.tax_rate || null, itemAmount, i).run();
    }
  }

  // Build update query
  const fields: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  if (data.client_id !== undefined) {
    fields.push('client_id = ?');
    values.push(data.client_id);
  }
  if (data.invoice_number !== undefined) {
    fields.push('invoice_number = ?');
    values.push(data.invoice_number);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    values.push(data.status);
  }
  if (data.issue_date !== undefined) {
    fields.push('issue_date = ?');
    values.push(data.issue_date);
  }
  if (data.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(data.due_date);
  }
  if (data.currency !== undefined) {
    fields.push('currency = ?');
    values.push(data.currency);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    values.push(data.notes);
  }
  if (data.payment_terms !== undefined) {
    fields.push('payment_terms = ?');
    values.push(data.payment_terms);
  }
  if (data.reminders_enabled !== undefined) {
    fields.push('reminders_enabled = ?');
    values.push(data.reminders_enabled ? 1 : 0);
  }
  if (data.discount_type !== undefined) {
    fields.push('discount_type = ?');
    values.push(data.discount_type);
  }
  if (data.discount_value !== undefined) {
    fields.push('discount_value = ?');
    values.push(data.discount_value);
  }

  if (totals) {
    fields.push('subtotal = ?', 'tax_total = ?', 'discount_amount = ?', 'total = ?');
    values.push(totals.subtotal, totals.tax_total, totals.discount_amount, totals.total);
  }

  values.push(invoiceId, userId);

  await c.env.DB.prepare(
    `UPDATE invoices SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...values).run();

  // Log event if status changed
  if (data.status && data.status !== existingInvoice.status) {
    await c.env.DB.prepare(
      `INSERT INTO invoice_events (id, invoice_id, event_type, metadata, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      generateUUID(),
      invoiceId,
      data.status === 'void' ? 'voided' : 'updated',
      JSON.stringify({ old_status: existingInvoice.status, new_status: data.status }),
      now
    ).run();
  }

  // Fetch complete invoice
  const invoice = await getInvoiceWithDetails(c.env.DB, invoiceId);

  return c.json({
    data: invoice,
    requestId,
  });
});

/**
 * Send invoice to client
 */
invoices.post('/:id/send', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const invoiceId = c.req.param('id');

  // Get invoice with client
  const invoice = await c.env.DB.prepare(
    'SELECT * FROM invoices WHERE id = ? AND user_id = ?'
  ).bind(invoiceId, userId).first<Invoice>();

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  if (invoice.status === 'paid' || invoice.status === 'void') {
    throw new ValidationError('Cannot send a paid or void invoice');
  }

  const client = await c.env.DB.prepare(
    'SELECT * FROM clients WHERE id = ?'
  ).bind(invoice.client_id).first<Client>();

  if (!client) {
    throw new NotFoundError('Client');
  }

  const settings = await c.env.DB.prepare(
    'SELECT * FROM settings WHERE user_id = ?'
  ).bind(userId).first<Settings>();

  const now = new Date().toISOString();

  // Create or get public token
  let publicToken = await c.env.DB.prepare(
    'SELECT token FROM invoice_public_tokens WHERE invoice_id = ?'
  ).bind(invoiceId).first<{ token: string }>();

  if (!publicToken) {
    const token = generateToken(32);
    await c.env.DB.prepare(
      `INSERT INTO invoice_public_tokens (id, invoice_id, token, created_at)
       VALUES (?, ?, ?, ?)`
    ).bind(generateUUID(), invoiceId, token, now).run();
    publicToken = { token };
  }

  const publicUrl = `${c.env.FRONTEND_URL}/invoice/${publicToken.token}`;

  // Send email
  const emailService = new EmailService(c.env.RESEND_API_KEY, c.env.FROM_EMAIL);
  await emailService.sendInvoice(
    client.email,
    invoice.invoice_number,
    settings?.business_name || 'Kivo',
    invoice.total,
    invoice.currency as any,
    invoice.due_date,
    publicUrl,
    settings?.email_from_name || undefined
  );

  // Update invoice status
  await c.env.DB.prepare(
    "UPDATE invoices SET status = 'sent', updated_at = ? WHERE id = ?"
  ).bind(now, invoiceId).run();

  // Log event
  await c.env.DB.prepare(
    `INSERT INTO invoice_events (id, invoice_id, event_type, metadata, created_at)
     VALUES (?, ?, 'sent', ?, ?)`
  ).bind(generateUUID(), invoiceId, JSON.stringify({ email: client.email }), now).run();

  // Track analytics
  const analytics = new AnalyticsService();
  analytics.trackInvoiceSent(userId, invoiceId);

  // Schedule reminders if enabled
  if (invoice.reminders_enabled) {
    // Get Durable Object for reminder scheduling
    const reminderDOId = c.env.REMINDER_SCHEDULER.idFromName(userId);
    const reminderDO = c.env.REMINDER_SCHEDULER.get(reminderDOId);
    
    await reminderDO.fetch('http://internal/schedule', {
      method: 'POST',
      body: JSON.stringify({
        invoice_id: invoiceId,
        due_date: invoice.due_date,
      }),
    });
  }

  return c.json({
    data: {
      message: 'Invoice sent successfully',
      public_url: publicUrl,
    },
    requestId,
  });
});

/**
 * Duplicate an invoice
 */
invoices.post('/:id/duplicate', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const invoiceId = c.req.param('id');

  const original = await getInvoiceWithDetails(c.env.DB, invoiceId);

  if (!original || original.user_id !== userId) {
    throw new NotFoundError('Invoice');
  }

  // Get settings for new invoice number
  const settings = await c.env.DB.prepare(
    'SELECT * FROM settings WHERE user_id = ?'
  ).bind(userId).first<Settings>();

  const newInvoiceId = generateUUID();
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  // Generate new invoice number
  const newInvoiceNumber = settings
    ? generateInvoiceNumber(settings.invoice_prefix, settings.next_invoice_number)
    : `INV-${Date.now()}`;

  if (settings) {
    await c.env.DB.prepare(
      'UPDATE settings SET next_invoice_number = next_invoice_number + 1, updated_at = ? WHERE user_id = ?'
    ).bind(now, userId).run();
  }

  // Create new invoice as draft
  await c.env.DB.prepare(
    `INSERT INTO invoices (
      id, user_id, client_id, invoice_number, status, issue_date, due_date,
      currency, subtotal, tax_total, discount_type, discount_value, discount_amount,
      total, notes, payment_terms, reminders_enabled, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    newInvoiceId, userId, original.client_id, newInvoiceNumber, today, original.due_date,
    original.currency, original.subtotal, original.tax_total, original.discount_type,
    original.discount_value, original.discount_amount, original.total,
    original.notes, original.payment_terms, original.reminders_enabled ? 1 : 0,
    now, now
  ).run();

  // Copy items
  for (const item of original.items) {
    await c.env.DB.prepare(
      `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, amount, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(generateUUID(), newInvoiceId, item.description, item.quantity, item.unit_price, item.tax_rate, item.amount, item.sort_order).run();
  }

  // Log event
  await c.env.DB.prepare(
    `INSERT INTO invoice_events (id, invoice_id, event_type, metadata, created_at)
     VALUES (?, ?, 'created', ?, ?)`
  ).bind(generateUUID(), newInvoiceId, JSON.stringify({ duplicated_from: invoiceId }), now).run();

  const newInvoice = await getInvoiceWithDetails(c.env.DB, newInvoiceId);

  return c.json({
    data: newInvoice,
    requestId,
  }, 201);
});

/**
 * Generate/regenerate PDF for invoice
 */
invoices.post('/:id/pdf', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const invoiceId = c.req.param('id');

  const invoice = await getInvoiceWithDetails(c.env.DB, invoiceId);

  if (!invoice || invoice.user_id !== userId) {
    throw new NotFoundError('Invoice');
  }

  const settings = await c.env.DB.prepare(
    'SELECT * FROM settings WHERE user_id = ?'
  ).bind(userId).first<Settings>();

  // Generate PDF
  const pdfService = new PDFService(c.env.STORAGE);
  const pdfData = await pdfService.generateInvoicePDF(invoice as InvoiceWithClient, settings!);
  
  // Store PDF
  const pdfKey = await pdfService.storePDF(userId, invoiceId, invoice.invoice_number, pdfData);

  // Update invoice
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    'UPDATE invoices SET pdf_generated_at = ?, updated_at = ? WHERE id = ?'
  ).bind(now, now, invoiceId).run();

  return c.json({
    data: {
      message: 'PDF generated successfully',
      pdf_key: pdfKey,
    },
    requestId,
  });
});

/**
 * Get PDF download URL
 */
invoices.get('/:id/pdf', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');
  const invoiceId = c.req.param('id');

  const invoice = await c.env.DB.prepare(
    'SELECT invoice_number FROM invoices WHERE id = ? AND user_id = ?'
  ).bind(invoiceId, userId).first<{ invoice_number: string }>();

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  const pdfKey = `${userId}/invoices/${invoiceId}/${invoice.invoice_number}.html`;
  const pdfService = new PDFService(c.env.STORAGE);
  const pdf = await pdfService.getPDF(pdfKey);

  if (!pdf) {
    throw new NotFoundError('PDF');
  }

  return new Response(pdf.body, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="${invoice.invoice_number}.html"`,
    },
  });
});

// Helper function to get invoice with all details
async function getInvoiceWithDetails(db: D1Database, invoiceId: string): Promise<any> {
  const invoice = await db.prepare(
    'SELECT * FROM invoices WHERE id = ?'
  ).bind(invoiceId).first();

  if (!invoice) return null;

  const client = await db.prepare(
    'SELECT id, name, email, company, address FROM clients WHERE id = ?'
  ).bind(invoice.client_id).first();

  const items = await db.prepare(
    'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order'
  ).bind(invoiceId).all();

  return {
    ...invoice,
    client,
    items: items.results,
  };
}

export { invoices };
