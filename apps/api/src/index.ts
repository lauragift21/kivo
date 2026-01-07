import { Hono } from 'hono';
import type { Env, Variables } from './types';
import { requestIdMiddleware } from './middleware/request-id';
import { errorHandlerMiddleware } from './middleware/error-handler';
import { createCorsMiddleware } from './middleware/cors';
import { auth } from './routes/auth';
import { clients } from './routes/clients';
import { invoices } from './routes/invoices';
import { publicRoutes } from './routes/public';
import { webhooks } from './routes/webhooks';
import { dashboard } from './routes/dashboard';
import { settings } from './routes/settings';
import { createLogger } from './utils/logger';

// Export Durable Object
export { ReminderScheduler } from './durable-objects/reminder-scheduler';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Global middleware
app.use('*', requestIdMiddleware);
app.use('*', errorHandlerMiddleware);

// CORS - apply dynamically based on env
app.use('*', async (c, next) => {
  const corsMiddleware = createCorsMiddleware(c.env);
  return corsMiddleware(c, next);
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/auth', auth);
app.route('/api/clients', clients);
app.route('/api/invoices', invoices);
app.route('/api/public', publicRoutes);
app.route('/api/webhooks', webhooks);
app.route('/api/dashboard', dashboard);
app.route('/api/settings', settings);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
      requestId: c.get('requestId'),
    },
    404
  );
});

// Cron trigger handler for periodic reconciliation
async function handleScheduledEvent(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
  const logger = createLogger();
  logger.info('Cron trigger started', { cron: event.cron });

  try {
    // Update overdue invoices
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const overdueResult = await env.DB.prepare(
      `UPDATE invoices 
       SET status = 'overdue', updated_at = ?
       WHERE status IN ('sent', 'viewed') AND due_date < ?`
    ).bind(now.toISOString(), today).run();

    logger.info('Updated overdue invoices', { count: overdueResult.meta.changes });

    // Get all users with pending reminders
    const usersWithReminders = await env.DB.prepare(
      `SELECT DISTINCT user_id FROM invoices 
       WHERE status IN ('sent', 'viewed', 'overdue') 
       AND reminders_enabled = 1`
    ).all<{ user_id: string }>();

    // Trigger reminder processing for each user's Durable Object
    for (const { user_id } of usersWithReminders.results) {
      const reminderDOId = env.REMINDER_SCHEDULER.idFromName(user_id);
      const reminderDO = env.REMINDER_SCHEDULER.get(reminderDOId);

      ctx.waitUntil(
        reminderDO.fetch('http://internal/process', { method: 'POST' })
          .catch((error) => {
            logger.error('Failed to process reminders for user', error as Error, { user_id });
          })
      );
    }

    logger.info('Cron trigger completed');
  } catch (error) {
    logger.error('Cron trigger failed', error as Error);
  }
}

export default {
  fetch: app.fetch,
  scheduled: handleScheduledEvent,
};
