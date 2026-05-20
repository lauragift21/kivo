import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { authMiddleware } from '../middleware/auth';

const dashboard = new Hono<{ Bindings: Env; Variables: Variables }>();

dashboard.use('/*', authMiddleware);

/**
 * Get dashboard KPIs and recent invoices
 */
dashboard.get('/', async (c) => {
  const requestId = c.get('requestId');

  const settings = await c.env.DB.prepare(
    'SELECT default_currency FROM settings LIMIT 1'
  ).first<{ default_currency: string }>();

  const defaultCurrency = settings?.default_currency || 'USD';

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  const outstandingResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(total), 0) as total
     FROM invoices
     WHERE status IN ('sent', 'viewed', 'overdue')`
  ).first<{ total: number }>();

  const paidThisMonthResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(total), 0) as total
     FROM invoices
     WHERE status = 'paid'
     AND updated_at >= ? AND updated_at <= ?`
  ).bind(firstDayOfMonth, lastDayOfMonth + 'T23:59:59').first<{ total: number }>();

  const overdueResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count
     FROM invoices
     WHERE status IN ('sent', 'viewed') AND due_date < ?`
  ).bind(today).first<{ count: number }>();

  await c.env.DB.prepare(
    `UPDATE invoices
     SET status = 'overdue', updated_at = ?
     WHERE status IN ('sent', 'viewed') AND due_date < ?`
  ).bind(now.toISOString(), today).run();

  const clientsResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM clients WHERE archived = 0`
  ).first<{ count: number }>();

  const invoicesCountResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM invoices`
  ).first<{ count: number }>();

  const recentInvoices = await c.env.DB.prepare(
    `SELECT i.id, i.invoice_number, i.status, i.total, i.currency, i.due_date, i.created_at,
            c.name as client_name
     FROM invoices i
     LEFT JOIN clients c ON i.client_id = c.id
     ORDER BY i.created_at DESC
     LIMIT 10`
  ).all();

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
  const requestId = c.get('requestId');

  const months: { month: string; invoiced: number; paid: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = date.toISOString().split('T')[0];
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const invoicedResult = await c.env.DB.prepare(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM invoices
       WHERE created_at >= ? AND created_at <= ?`
    ).bind(monthStart, monthEnd + 'T23:59:59').first<{ total: number }>();

    const paidResult = await c.env.DB.prepare(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM invoices
       WHERE status = 'paid'
       AND updated_at >= ? AND updated_at <= ?`
    ).bind(monthStart, monthEnd + 'T23:59:59').first<{ total: number }>();

    months.push({
      month: monthLabel,
      invoiced: invoicedResult?.total || 0,
      paid: paidResult?.total || 0,
    });
  }

  const statusBreakdown = await c.env.DB.prepare(
    `SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as total
     FROM invoices
     GROUP BY status`
  ).all();

  return c.json({
    data: {
      monthly: months,
      by_status: statusBreakdown.results,
    },
    requestId,
  });
});

export { dashboard };
