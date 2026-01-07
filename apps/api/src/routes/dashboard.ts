import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { authMiddleware } from '../middleware/auth';

const dashboard = new Hono<{ Bindings: Env; Variables: Variables }>();

dashboard.use('/*', authMiddleware);

/**
 * Get dashboard KPIs and recent invoices
 */
dashboard.get('/', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');

  // Get user's settings for default currency
  const settings = await c.env.DB.prepare(
    'SELECT default_currency FROM settings WHERE user_id = ?'
  ).bind(userId).first<{ default_currency: string }>();
  
  const defaultCurrency = settings?.default_currency || 'USD';

  // Get current month boundaries
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  // Total outstanding (sent, viewed, overdue)
  const outstandingResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(total), 0) as total
     FROM invoices 
     WHERE user_id = ? AND status IN ('sent', 'viewed', 'overdue')`
  ).bind(userId).first<{ total: number }>();

  // Total paid this month
  const paidThisMonthResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(total), 0) as total
     FROM invoices 
     WHERE user_id = ? AND status = 'paid' 
     AND updated_at >= ? AND updated_at <= ?`
  ).bind(userId, firstDayOfMonth, lastDayOfMonth + 'T23:59:59').first<{ total: number }>();

  // Overdue count
  const overdueResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count
     FROM invoices 
     WHERE user_id = ? AND status IN ('sent', 'viewed') AND due_date < ?`
  ).bind(userId, today).first<{ count: number }>();

  // Update overdue invoices status
  await c.env.DB.prepare(
    `UPDATE invoices 
     SET status = 'overdue', updated_at = ?
     WHERE user_id = ? AND status IN ('sent', 'viewed') AND due_date < ?`
  ).bind(now.toISOString(), userId, today).run();

  // Total clients
  const clientsResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND archived = 0`
  ).bind(userId).first<{ count: number }>();

  // Total invoices
  const invoicesCountResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM invoices WHERE user_id = ?`
  ).bind(userId).first<{ count: number }>();

  // Recent invoices (last 10)
  const recentInvoices = await c.env.DB.prepare(
    `SELECT i.id, i.invoice_number, i.status, i.total, i.currency, i.due_date, i.created_at,
            c.name as client_name
     FROM invoices i
     LEFT JOIN clients c ON i.client_id = c.id
     WHERE i.user_id = ?
     ORDER BY i.created_at DESC
     LIMIT 10`
  ).bind(userId).all();

  return c.json({
    data: {
      kpis: {
        total_outstanding: outstandingResult?.total || 0,
        total_paid_this_month: paidThisMonthResult?.total || 0,
        overdue_count: overdueResult?.count || 0,
        total_clients: clientsResult?.count || 0,
        total_invoices: invoicesCountResult?.count || 0,
      },
      default_currency: defaultCurrency,
      recent_invoices: recentInvoices.results,
    },
    requestId,
  });
});

/**
 * Get invoice statistics over time
 */
dashboard.get('/stats', async (c) => {
  const userId = c.get('userId')!;
  const requestId = c.get('requestId');

  // Get last 6 months of data
  const months: { month: string; invoiced: number; paid: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = date.toISOString().split('T')[0];
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Total invoiced this month
    const invoicedResult = await c.env.DB.prepare(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM invoices 
       WHERE user_id = ? AND created_at >= ? AND created_at <= ?`
    ).bind(userId, monthStart, monthEnd + 'T23:59:59').first<{ total: number }>();

    // Total paid this month
    const paidResult = await c.env.DB.prepare(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM invoices 
       WHERE user_id = ? AND status = 'paid' 
       AND updated_at >= ? AND updated_at <= ?`
    ).bind(userId, monthStart, monthEnd + 'T23:59:59').first<{ total: number }>();

    months.push({
      month: monthLabel,
      invoiced: invoicedResult?.total || 0,
      paid: paidResult?.total || 0,
    });
  }

  // Status breakdown
  const statusBreakdown = await c.env.DB.prepare(
    `SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as total
     FROM invoices 
     WHERE user_id = ?
     GROUP BY status`
  ).bind(userId).all();

  return c.json({
    data: {
      monthly: months,
      by_status: statusBreakdown.results,
    },
    requestId,
  });
});

export { dashboard };
