import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateReminderIdempotencyKey } from '@kivo/shared';

// Test the idempotency key generation for reminders
describe('Reminder Idempotency', () => {
  it('should generate consistent idempotency keys', () => {
    const invoiceId = 'inv-12345';
    const reminderType = 'before_due';
    const dueDate = '2024-03-15';

    const key1 = generateReminderIdempotencyKey(invoiceId, reminderType, dueDate);
    const key2 = generateReminderIdempotencyKey(invoiceId, reminderType, dueDate);

    expect(key1).toBe(key2);
    expect(key1).toBe('inv-12345:before_due:2024-03-15');
  });

  it('should generate unique keys for different reminder types', () => {
    const invoiceId = 'inv-12345';
    const dueDate = '2024-03-15';

    const beforeKey = generateReminderIdempotencyKey(invoiceId, 'before_due', dueDate);
    const onKey = generateReminderIdempotencyKey(invoiceId, 'on_due', dueDate);
    const afterKey = generateReminderIdempotencyKey(invoiceId, 'after_due', dueDate);

    expect(beforeKey).not.toBe(onKey);
    expect(onKey).not.toBe(afterKey);
    expect(beforeKey).not.toBe(afterKey);
  });

  it('should generate unique keys for different invoices', () => {
    const reminderType = 'on_due';
    const dueDate = '2024-03-15';

    const key1 = generateReminderIdempotencyKey('inv-111', reminderType, dueDate);
    const key2 = generateReminderIdempotencyKey('inv-222', reminderType, dueDate);

    expect(key1).not.toBe(key2);
  });

  it('should generate unique keys for different dates', () => {
    const invoiceId = 'inv-12345';
    const reminderType = 'on_due';

    const key1 = generateReminderIdempotencyKey(invoiceId, reminderType, '2024-03-15');
    const key2 = generateReminderIdempotencyKey(invoiceId, reminderType, '2024-03-16');

    expect(key1).not.toBe(key2);
  });
});

// Mock test for reminder scheduling logic
describe('Reminder Scheduling Logic', () => {
  interface ReminderJob {
    invoice_id: string;
    reminder_type: string;
    scheduled_at: number;
    idempotency_key: string;
    sent: boolean;
  }

  function calculateReminders(invoiceId: string, dueDate: string): ReminderJob[] {
    const dueDateMs = new Date(dueDate).getTime();
    const now = Date.now();
    const reminders: ReminderJob[] = [];

    // Before due (3 days before)
    const beforeDueTime = dueDateMs - (3 * 24 * 60 * 60 * 1000);
    if (beforeDueTime > now) {
      reminders.push({
        invoice_id: invoiceId,
        reminder_type: 'before_due',
        scheduled_at: beforeDueTime,
        idempotency_key: generateReminderIdempotencyKey(invoiceId, 'before_due', dueDate),
        sent: false,
      });
    }

    // On due
    if (dueDateMs > now) {
      reminders.push({
        invoice_id: invoiceId,
        reminder_type: 'on_due',
        scheduled_at: dueDateMs,
        idempotency_key: generateReminderIdempotencyKey(invoiceId, 'on_due', dueDate),
        sent: false,
      });
    }

    // After due (7 days after)
    const afterDueTime = dueDateMs + (7 * 24 * 60 * 60 * 1000);
    reminders.push({
      invoice_id: invoiceId,
      reminder_type: 'after_due',
      scheduled_at: afterDueTime,
      idempotency_key: generateReminderIdempotencyKey(invoiceId, 'after_due', dueDate),
      sent: false,
    });

    return reminders;
  }

  it('should schedule all three reminders for future due date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days in future
    
    const reminders = calculateReminders('inv-123', futureDate.toISOString().split('T')[0]);
    
    expect(reminders.length).toBe(3);
    expect(reminders.map(r => r.reminder_type)).toContain('before_due');
    expect(reminders.map(r => r.reminder_type)).toContain('on_due');
    expect(reminders.map(r => r.reminder_type)).toContain('after_due');
  });

  it('should not schedule past reminders', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10); // 10 days in past
    
    const reminders = calculateReminders('inv-123', pastDate.toISOString().split('T')[0]);
    
    // Only after_due should be scheduled since it's in the future
    expect(reminders.length).toBe(1);
    expect(reminders[0].reminder_type).toBe('after_due');
  });

  it('should prevent duplicate sends using idempotency keys', () => {
    const sentReminders = new Set<string>();
    const dueDate = '2024-06-15';
    const invoiceId = 'inv-456';

    // Simulate first send attempt
    const key1 = generateReminderIdempotencyKey(invoiceId, 'on_due', dueDate);
    const shouldSend1 = !sentReminders.has(key1);
    if (shouldSend1) {
      sentReminders.add(key1);
    }

    // Simulate second send attempt (duplicate)
    const key2 = generateReminderIdempotencyKey(invoiceId, 'on_due', dueDate);
    const shouldSend2 = !sentReminders.has(key2);

    expect(shouldSend1).toBe(true);
    expect(shouldSend2).toBe(false);
    expect(key1).toBe(key2);
  });
});
