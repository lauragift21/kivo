import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { StripeService } from '../services/stripe';
import { EmailService } from '../services/email';
import { AnalyticsService } from '../services/analytics';
import { generateUUID } from '../utils/crypto';
import { createLogger } from '../utils/logger';
import type Stripe from 'stripe';

const webhooks = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * Stripe webhook handler
 */
webhooks.post('/stripe', async (c) => {
  const requestId = c.get('requestId');
  const logger = createLogger(requestId);

  const signature = c.req.header('stripe-signature');
  if (!signature) {
    logger.warn('Missing Stripe signature');
    return c.json({ error: 'Missing signature' }, 400);
  }

  const payload = await c.req.text();
  const stripeService = new StripeService(c.env.STRIPE_SECRET_KEY, c.env.STRIPE_WEBHOOK_SECRET);

  let event: Stripe.Event;
  try {
    event = await stripeService.verifyWebhook(payload, signature);
  } catch (error) {
    logger.error('Webhook verification failed', error as Error);
    return c.json({ error: 'Invalid signature' }, 400);
  }

  logger.info('Received Stripe webhook', { type: event.type, id: event.id });

  const now = new Date().toISOString();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoice_id;
      
      if (!invoiceId) {
        logger.warn('No invoice_id in session metadata');
        break;
      }

      // Update payment record
      await c.env.DB.prepare(
        `UPDATE payments 
         SET stripe_payment_intent_id = ?, status = 'succeeded', paid_at = ?
         WHERE stripe_checkout_session_id = ?`
      ).bind(session.payment_intent, now, session.id).run();

      // Update invoice status
      const invoice = await c.env.DB.prepare(
        'SELECT user_id, invoice_number, total, currency, client_id FROM invoices WHERE id = ?'
      ).bind(invoiceId).first<{
        user_id: string;
        invoice_number: string;
        total: number;
        currency: string;
        client_id: string;
      }>();

      if (!invoice) {
        logger.warn('Invoice not found', { invoiceId });
        break;
      }

      await c.env.DB.prepare(
        "UPDATE invoices SET status = 'paid', updated_at = ? WHERE id = ?"
      ).bind(now, invoiceId).run();

      // Log event
      await c.env.DB.prepare(
        `INSERT INTO invoice_events (id, invoice_id, event_type, metadata, created_at)
         VALUES (?, ?, 'paid', ?, ?)`
      ).bind(
        generateUUID(),
        invoiceId,
        JSON.stringify({
          payment_intent: session.payment_intent,
          amount: session.amount_total,
        }),
        now
      ).run();

      // Cancel reminders
      const reminderDOId = c.env.REMINDER_SCHEDULER.idFromName(invoice.user_id);
      const reminderDO = c.env.REMINDER_SCHEDULER.get(reminderDOId);
      
      await reminderDO.fetch('http://internal/cancel', {
        method: 'POST',
        body: JSON.stringify({ invoice_id: invoiceId }),
      });

      // Track analytics
      const analytics = new AnalyticsService();
      analytics.trackInvoicePaid(invoice.user_id, invoiceId, invoice.total, invoice.currency);

      // Send payment receipt
      const client = await c.env.DB.prepare(
        'SELECT email FROM clients WHERE id = ?'
      ).bind(invoice.client_id).first<{ email: string }>();

      const settings = await c.env.DB.prepare(
        'SELECT business_name, email_from_name FROM settings WHERE user_id = ?'
      ).bind(invoice.user_id).first<{ business_name: string; email_from_name: string }>();

      if (client) {
        const emailService = new EmailService(c.env.RESEND_API_KEY, c.env.FROM_EMAIL);
        await emailService.sendPaymentReceipt(
          client.email,
          invoice.invoice_number,
          settings?.business_name || 'Kivo',
          invoice.total,
          invoice.currency as any,
          now,
          settings?.email_from_name
        );
      }

      logger.info('Invoice marked as paid', { invoiceId });
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update payment record to cancelled
      await c.env.DB.prepare(
        `UPDATE payments SET status = 'failed' WHERE stripe_checkout_session_id = ?`
      ).bind(session.id).run();

      logger.info('Checkout session expired', { sessionId: session.id });
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Update payment record
      await c.env.DB.prepare(
        `UPDATE payments SET status = 'failed' WHERE stripe_payment_intent_id = ?`
      ).bind(paymentIntent.id).run();

      // Log event
      const payment = await c.env.DB.prepare(
        'SELECT invoice_id FROM payments WHERE stripe_payment_intent_id = ?'
      ).bind(paymentIntent.id).first<{ invoice_id: string }>();

      if (payment) {
        await c.env.DB.prepare(
          `INSERT INTO invoice_events (id, invoice_id, event_type, metadata, created_at)
           VALUES (?, ?, 'payment_failed', ?, ?)`
        ).bind(
          generateUUID(),
          payment.invoice_id,
          JSON.stringify({
            payment_intent: paymentIntent.id,
            error: paymentIntent.last_payment_error?.message,
          }),
          now
        ).run();
      }

      logger.warn('Payment failed', { paymentIntentId: paymentIntent.id });
      break;
    }

    default:
      logger.info('Unhandled webhook event type', { type: event.type });
  }

  return c.json({ received: true });
});

export { webhooks };
