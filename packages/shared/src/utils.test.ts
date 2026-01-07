import { describe, it, expect } from 'vitest';
import {
  calculateInvoiceTotals,
  generateInvoiceNumber,
  isInvoiceOverdue,
  calculateDueDate,
  generateReminderIdempotencyKey,
} from './utils';

describe('calculateInvoiceTotals', () => {
  it('should calculate subtotal correctly', () => {
    const items = [
      { quantity: 2, unit_price: 100 },
      { quantity: 1, unit_price: 50 },
    ];
    const result = calculateInvoiceTotals(items);
    expect(result.subtotal).toBe(250);
    expect(result.total).toBe(250);
  });

  it('should calculate tax correctly', () => {
    const items = [
      { quantity: 1, unit_price: 100, tax_rate: 10 },
    ];
    const result = calculateInvoiceTotals(items);
    expect(result.subtotal).toBe(100);
    expect(result.tax_total).toBe(10);
    expect(result.total).toBe(110);
  });

  it('should apply fixed discount', () => {
    const items = [
      { quantity: 1, unit_price: 100 },
    ];
    const result = calculateInvoiceTotals(items, 'fixed', 20);
    expect(result.subtotal).toBe(100);
    expect(result.discount_amount).toBe(20);
    expect(result.total).toBe(80);
  });

  it('should apply percentage discount', () => {
    const items = [
      { quantity: 1, unit_price: 100 },
    ];
    const result = calculateInvoiceTotals(items, 'percentage', 10);
    expect(result.subtotal).toBe(100);
    expect(result.discount_amount).toBe(10);
    expect(result.total).toBe(90);
  });

  it('should not allow negative total', () => {
    const items = [
      { quantity: 1, unit_price: 50 },
    ];
    const result = calculateInvoiceTotals(items, 'fixed', 100);
    expect(result.total).toBe(0);
  });
});

describe('generateInvoiceNumber', () => {
  it('should generate invoice number with padding', () => {
    expect(generateInvoiceNumber('INV', 1)).toBe('INV-00001');
    expect(generateInvoiceNumber('INV', 123)).toBe('INV-00123');
    expect(generateInvoiceNumber('INV', 99999)).toBe('INV-99999');
  });
});

describe('isInvoiceOverdue', () => {
  it('should return false for paid invoices', () => {
    const pastDate = '2020-01-01';
    expect(isInvoiceOverdue(pastDate, 'paid')).toBe(false);
  });

  it('should return false for void invoices', () => {
    const pastDate = '2020-01-01';
    expect(isInvoiceOverdue(pastDate, 'void')).toBe(false);
  });

  it('should return false for draft invoices', () => {
    const pastDate = '2020-01-01';
    expect(isInvoiceOverdue(pastDate, 'draft')).toBe(false);
  });

  it('should return true for sent invoice with past due date', () => {
    const pastDate = '2020-01-01';
    expect(isInvoiceOverdue(pastDate, 'sent')).toBe(true);
  });

  it('should return false for sent invoice with future due date', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(isInvoiceOverdue(futureDate.toISOString(), 'sent')).toBe(false);
  });
});

describe('calculateDueDate', () => {
  it('should add correct days for net_30', () => {
    const issueDate = new Date('2024-01-01');
    const dueDate = calculateDueDate(issueDate, 'net_30');
    expect(dueDate.toISOString().split('T')[0]).toBe('2024-01-31');
  });

  it('should return same date for due_on_receipt', () => {
    const issueDate = new Date('2024-01-01');
    const dueDate = calculateDueDate(issueDate, 'due_on_receipt');
    expect(dueDate.toISOString().split('T')[0]).toBe('2024-01-01');
  });
});

describe('generateReminderIdempotencyKey', () => {
  it('should generate consistent keys', () => {
    const key1 = generateReminderIdempotencyKey('inv-123', 'before_due', '2024-01-15');
    const key2 = generateReminderIdempotencyKey('inv-123', 'before_due', '2024-01-15');
    expect(key1).toBe(key2);
    expect(key1).toBe('inv-123:before_due:2024-01-15');
  });

  it('should generate different keys for different types', () => {
    const key1 = generateReminderIdempotencyKey('inv-123', 'before_due', '2024-01-15');
    const key2 = generateReminderIdempotencyKey('inv-123', 'on_due', '2024-01-15');
    expect(key1).not.toBe(key2);
  });
});
