import { generateReminderIdempotencyKey, DEFAULT_REMINDER_DAYS } from '@kivo/shared';
import type { ReminderType } from '@kivo/shared';

interface ReminderJob {
  invoice_id: string;
  reminder_type: ReminderType;
  scheduled_at: number; // Unix timestamp in ms
  idempotency_key: string;
  sent: boolean;
}

interface InvoiceReminders {
  invoice_id: string;
  due_date: string;
  reminders: ReminderJob[];
  cancelled: boolean;
}

interface ReminderState {
  invoices: Record<string, InvoiceReminders>;
}

export class ReminderScheduler implements DurableObject {
  private state: DurableObjectState;
  private env: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/schedule':
          return await this.handleSchedule(request);
        case '/cancel':
          return await this.handleCancel(request);
        case '/process':
          return await this.handleProcess();
        case '/status':
          return await this.handleStatus(request);
        default:
          return new Response('Not found', { status: 404 });
      }
    } catch (error) {
      console.error('ReminderScheduler error:', error);
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Schedule reminders for an invoice
   */
  private async handleSchedule(request: Request): Promise<Response> {
    const body = await request.json() as { invoice_id: string; due_date: string };
    const { invoice_id, due_date } = body;

    const dueDateTime = new Date(due_date).getTime();
    const now = Date.now();

    // Get existing state
    const state = await this.state.storage.get<ReminderState>('state') || { invoices: {} };

    // Calculate reminder times
    const reminders: ReminderJob[] = [];

    // Before due (3 days before)
    const beforeDueTime = dueDateTime - (DEFAULT_REMINDER_DAYS.before_due * 24 * 60 * 60 * 1000);
    if (beforeDueTime > now) {
      reminders.push({
        invoice_id,
        reminder_type: 'before_due',
        scheduled_at: beforeDueTime,
        idempotency_key: generateReminderIdempotencyKey(invoice_id, 'before_due', due_date),
        sent: false,
      });
    }

    // On due date
    const onDueTime = dueDateTime;
    if (onDueTime > now) {
      reminders.push({
        invoice_id,
        reminder_type: 'on_due',
        scheduled_at: onDueTime,
        idempotency_key: generateReminderIdempotencyKey(invoice_id, 'on_due', due_date),
        sent: false,
      });
    }

    // After due (7 days after)
    const afterDueTime = dueDateTime + (DEFAULT_REMINDER_DAYS.after_due * 24 * 60 * 60 * 1000);
    reminders.push({
      invoice_id,
      reminder_type: 'after_due',
      scheduled_at: afterDueTime,
      idempotency_key: generateReminderIdempotencyKey(invoice_id, 'after_due', due_date),
      sent: false,
    });

    // Store invoice reminders
    state.invoices[invoice_id] = {
      invoice_id,
      due_date,
      reminders,
      cancelled: false,
    };

    await this.state.storage.put('state', state);

    // Schedule alarm for earliest reminder
    const nextReminder = reminders.find(r => !r.sent && r.scheduled_at > now);
    if (nextReminder) {
      await this.state.storage.setAlarm(nextReminder.scheduled_at);
    }

    return new Response(JSON.stringify({ scheduled: reminders.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Cancel reminders for an invoice (e.g., when paid or voided)
   */
  private async handleCancel(request: Request): Promise<Response> {
    const body = await request.json() as { invoice_id: string };
    const { invoice_id } = body;

    const state = await this.state.storage.get<ReminderState>('state') || { invoices: {} };

    if (state.invoices[invoice_id]) {
      state.invoices[invoice_id].cancelled = true;
      await this.state.storage.put('state', state);
    }

    return new Response(JSON.stringify({ cancelled: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Process due reminders (called by alarm)
   */
  async alarm(): Promise<void> {
    await this.processReminders();
  }

  private async handleProcess(): Promise<Response> {
    const result = await this.processReminders();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async processReminders(): Promise<{ processed: number; sent: number }> {
    const state = await this.state.storage.get<ReminderState>('state') || { invoices: {} };
    const now = Date.now();
    let processed = 0;
    let sent = 0;

    for (const [invoiceId, invoiceData] of Object.entries(state.invoices)) {
      if (invoiceData.cancelled) continue;

      for (const reminder of invoiceData.reminders) {
        // Skip already sent reminders
        if (reminder.sent) continue;

        // Check if it's time to send
        if (reminder.scheduled_at <= now) {
          processed++;

          // Check idempotency - query the database to see if this reminder was already sent
          const alreadySent = await this.checkReminderSent(invoiceId, reminder.idempotency_key);

          if (!alreadySent) {
            // Send the reminder
            const success = await this.sendReminder(invoiceId, reminder.reminder_type);

            if (success) {
              sent++;
              reminder.sent = true;

              // Record in database
              await this.recordReminderSent(invoiceId, reminder.reminder_type, reminder.idempotency_key);
            }
          } else {
            // Mark as sent to avoid reprocessing
            reminder.sent = true;
          }
        }
      }
    }

    // Save updated state
    await this.state.storage.put('state', state);

    // Schedule next alarm
    await this.scheduleNextAlarm(state);

    return { processed, sent };
  }

  private async checkReminderSent(invoiceId: string, idempotencyKey: string): Promise<boolean> {
    try {
      const result = await this.env.DB.prepare(
        `SELECT id FROM invoice_events 
         WHERE invoice_id = ? AND event_type = 'reminder_sent' 
         AND metadata LIKE ?`
      ).bind(invoiceId, `%${idempotencyKey}%`).first();

      return !!result;
    } catch {
      return false;
    }
  }

  private async sendReminder(invoiceId: string, reminderType: ReminderType): Promise<boolean> {
    try {
      // Get invoice details
      const invoice = await this.env.DB.prepare(
        `SELECT i.*, c.email as client_email, c.name as client_name
         FROM invoices i
         JOIN clients c ON i.client_id = c.id
         WHERE i.id = ?`
      ).bind(invoiceId).first();

      if (!invoice || invoice.status === 'paid' || invoice.status === 'void') {
        return false;
      }

      // Get settings
      const settings = await this.env.DB.prepare(
        'SELECT * FROM settings WHERE user_id = ?'
      ).bind(invoice.user_id).first();

      // Get public token
      const publicToken = await this.env.DB.prepare(
        'SELECT token FROM invoice_public_tokens WHERE invoice_id = ?'
      ).bind(invoiceId).first<{ token: string }>();

      if (!publicToken) {
        return false;
      }

      const publicUrl = `${this.env.FRONTEND_URL}/invoice/${publicToken.token}`;

      // Send email via Resend
      const fromEmail = this.env.FROM_EMAIL;
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: settings?.email_from_name
            ? `${settings.email_from_name} <${fromEmail}>`
            : fromEmail,
          to: invoice.client_email,
          subject: this.getReminderSubject(invoice.invoice_number, reminderType),
          html: this.getReminderHTML(invoice, settings, publicUrl, reminderType),
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send reminder:', error);
      return false;
    }
  }

  private getReminderSubject(invoiceNumber: string, reminderType: ReminderType): string {
    switch (reminderType) {
      case 'before_due':
        return `Reminder: Invoice ${invoiceNumber} is due soon`;
      case 'on_due':
        return `Invoice ${invoiceNumber} is due today`;
      case 'after_due':
        return `Overdue: Invoice ${invoiceNumber} requires attention`;
    }
  }

  private getReminderHTML(invoice: any, settings: any, publicUrl: string, reminderType: ReminderType): string {
    const businessName = settings?.business_name || 'Kivo';
    const isOverdue = reminderType === 'after_due';

    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a;">${businessName}</h1>
        <div style="background: ${isOverdue ? '#fef2f2' : '#f9fafb'}; padding: 30px; border-radius: 8px;">
          <h2>Invoice ${invoice.invoice_number}</h2>
          <p>Amount: <strong>${invoice.currency} ${invoice.total}</strong></p>
          <p>Due: ${new Date(invoice.due_date).toLocaleDateString()}</p>
          <a href="${publicUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Invoice</a>
        </div>
      </body>
      </html>
    `;
  }

  private async recordReminderSent(invoiceId: string, reminderType: ReminderType, idempotencyKey: string): Promise<void> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await this.env.DB.prepare(
      `INSERT INTO invoice_events (id, invoice_id, event_type, metadata, created_at)
       VALUES (?, ?, 'reminder_sent', ?, ?)`
    ).bind(id, invoiceId, JSON.stringify({ reminder_type: reminderType, idempotency_key: idempotencyKey }), now).run();
  }

  private async scheduleNextAlarm(state: ReminderState): Promise<void> {
    const now = Date.now();
    let nextTime: number | null = null;

    for (const invoiceData of Object.values(state.invoices)) {
      if (invoiceData.cancelled) continue;

      for (const reminder of invoiceData.reminders) {
        if (!reminder.sent && reminder.scheduled_at > now) {
          if (!nextTime || reminder.scheduled_at < nextTime) {
            nextTime = reminder.scheduled_at;
          }
        }
      }
    }

    if (nextTime) {
      await this.state.storage.setAlarm(nextTime);
    }
  }

  private async handleStatus(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const invoiceId = url.searchParams.get('invoice_id');

    const state = await this.state.storage.get<ReminderState>('state') || { invoices: {} };

    if (invoiceId) {
      const invoiceData = state.invoices[invoiceId];
      return new Response(JSON.stringify(invoiceData || null), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(state), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
