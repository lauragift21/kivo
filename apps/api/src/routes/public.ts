import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import type { Invoice, Client, Settings, InvoiceItem } from '@kivo/shared';
import { NotFoundError } from '../utils/errors';
import { generateUUID } from '../utils/crypto';
import { publicInvoiceRateLimiter } from '../middleware/rate-limit';
import { StripeService } from '../services/stripe';
import { AnalyticsService } from '../services/analytics';
import { PDFService } from '../services/pdf';

const publicRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Apply rate limiting
publicRoutes.use('/*', publicInvoiceRateLimiter);

/**
 * View public invoice
 */
publicRoutes.get('/invoice/:token', async (c) => {
  const requestId = c.get('requestId');
  const token = c.req.param('token');

  // Find invoice by public token
  const tokenRecord = await c.env.DB.prepare(
    'SELECT invoice_id FROM invoice_public_tokens WHERE token = ?'
  ).bind(token).first<{ invoice_id: string }>();

  if (!tokenRecord) {
    throw new NotFoundError('Invoice');
  }

  const invoice = await c.env.DB.prepare(
    'SELECT * FROM invoices WHERE id = ?'
  ).bind(tokenRecord.invoice_id).first<Invoice>();

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  const client = await c.env.DB.prepare(
    'SELECT name, email, company, address FROM clients WHERE id = ?'
  ).bind(invoice.client_id).first<Partial<Client>>();

  const settings = await c.env.DB.prepare(
    'SELECT business_name, business_email, business_address, logo_url FROM settings WHERE user_id = ?'
  ).bind(invoice.user_id).first<Partial<Settings>>();

  const items = await c.env.DB.prepare(
    'SELECT description, quantity, unit_price, tax_rate, amount FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order'
  ).bind(invoice.id).all<Partial<InvoiceItem>>();

  // Mark as viewed if currently sent
  if (invoice.status === 'sent') {
    const now = new Date().toISOString();
    
    await c.env.DB.prepare(
      "UPDATE invoices SET status = 'viewed', updated_at = ? WHERE id = ?"
    ).bind(now, invoice.id).run();

    await c.env.DB.prepare(
      `INSERT INTO invoice_events (id, invoice_id, event_type, created_at)
       VALUES (?, ?, 'viewed', ?)`
    ).bind(generateUUID(), invoice.id, now).run();

    // Track analytics
    const analytics = new AnalyticsService();
    analytics.trackInvoiceViewed(invoice.user_id, invoice.id);
  }

  // Determine if payment is possible
  const canPay = ['sent', 'viewed', 'overdue'].includes(invoice.status);

  // Get PDF URL if exists
  let pdfUrl = null;
  if (invoice.pdf_generated_at) {
    pdfUrl = `${c.env.API_URL}/api/public/invoice/${token}/pdf`;
  }

  return c.json({
    data: {
      invoice: {
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        tax_total: invoice.tax_total,
        discount_amount: invoice.discount_amount,
        total: invoice.total,
        notes: invoice.notes,
        payment_terms: invoice.payment_terms,
      },
      client: {
        name: client?.name,
        email: client?.email,
        company: client?.company,
        address: client?.address,
      },
      business: {
        name: settings?.business_name,
        email: settings?.business_email,
        address: settings?.business_address,
        logo_url: settings?.logo_url,
      },
      items: items.results,
      can_pay: canPay,
      pdf_url: pdfUrl,
    },
    requestId,
  });
});

/**
 * Get public invoice PDF
 */
publicRoutes.get('/invoice/:token/pdf', async (c) => {
  const token = c.req.param('token');

  // Find invoice by public token
  const tokenRecord = await c.env.DB.prepare(
    'SELECT invoice_id FROM invoice_public_tokens WHERE token = ?'
  ).bind(token).first<{ invoice_id: string }>();

  if (!tokenRecord) {
    throw new NotFoundError('Invoice');
  }

  const invoice = await c.env.DB.prepare(
    'SELECT user_id, invoice_number, pdf_generated_at FROM invoices WHERE id = ?'
  ).bind(tokenRecord.invoice_id).first<{ user_id: string; invoice_number: string; pdf_generated_at: string | null }>();

  if (!invoice || !invoice.pdf_generated_at) {
    throw new NotFoundError('PDF');
  }

  const pdfKey = `${invoice.user_id}/invoices/${tokenRecord.invoice_id}/${invoice.invoice_number}.html`;
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

/**
 * Create Stripe checkout session for invoice payment
 */
publicRoutes.post('/invoice/:token/pay', async (c) => {
  const requestId = c.get('requestId');
  const token = c.req.param('token');

  // Find invoice by public token
  const tokenRecord = await c.env.DB.prepare(
    'SELECT invoice_id FROM invoice_public_tokens WHERE token = ?'
  ).bind(token).first<{ invoice_id: string }>();

  if (!tokenRecord) {
    throw new NotFoundError('Invoice');
  }

  const invoice = await c.env.DB.prepare(
    'SELECT * FROM invoices WHERE id = ?'
  ).bind(tokenRecord.invoice_id).first<Invoice>();

  if (!invoice) {
    throw new NotFoundError('Invoice');
  }

  // Check if invoice can be paid
  if (!['sent', 'viewed', 'overdue'].includes(invoice.status)) {
    return c.json({
      error: {
        code: 'INVOICE_NOT_PAYABLE',
        message: 'This invoice cannot be paid',
      },
      requestId,
    }, 400);
  }

  const client = await c.env.DB.prepare(
    'SELECT email FROM clients WHERE id = ?'
  ).bind(invoice.client_id).first<{ email: string }>();

  const settings = await c.env.DB.prepare(
    'SELECT business_name FROM settings WHERE user_id = ?'
  ).bind(invoice.user_id).first<{ business_name: string }>();

  const stripeService = new StripeService(c.env.STRIPE_SECRET_KEY, c.env.STRIPE_WEBHOOK_SECRET);

  const successUrl = `${c.env.FRONTEND_URL}/invoice/${token}?payment=success`;
  const cancelUrl = `${c.env.FRONTEND_URL}/invoice/${token}?payment=cancelled`;

  const session = await stripeService.createCheckoutSession(
    invoice.id,
    invoice.invoice_number,
    invoice.total,
    invoice.currency as any,
    client?.email || '',
    successUrl,
    cancelUrl,
    settings?.business_name
  );

  // Create pending payment record
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `INSERT INTO payments (id, invoice_id, stripe_checkout_session_id, amount, currency, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(generateUUID(), invoice.id, session.sessionId, invoice.total, invoice.currency, now).run();

  return c.json({
    data: {
      checkout_url: session.url,
      session_id: session.sessionId,
    },
    requestId,
  });
});

export { publicRoutes };
