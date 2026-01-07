import { PAYMENT_TERM_DAYS } from './constants';
import type { PaymentTerms, Currency, InvoiceStatus } from './types';

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate due date based on payment terms
 */
export function calculateDueDate(issueDate: Date, paymentTerms: PaymentTerms): Date {
  const days = PAYMENT_TERM_DAYS[paymentTerms] ?? 30;
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
}

/**
 * Format date to ISO string (date only)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date for display in a specific timezone
 */
export function formatDateForTimezone(date: Date | string, timezone: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unit_price: number; tax_rate?: number | null }>,
  discountType?: 'fixed' | 'percentage' | null,
  discountValue?: number | null
): {
  subtotal: number;
  tax_total: number;
  discount_amount: number;
  total: number;
  item_amounts: number[];
} {
  let subtotal = 0;
  let tax_total = 0;
  const item_amounts: number[] = [];

  for (const item of items) {
    const itemAmount = item.quantity * item.unit_price;
    item_amounts.push(itemAmount);
    subtotal += itemAmount;

    if (item.tax_rate) {
      tax_total += itemAmount * (item.tax_rate / 100);
    }
  }

  let discount_amount = 0;
  if (discountType && discountValue && discountValue > 0) {
    if (discountType === 'fixed') {
      discount_amount = Math.min(discountValue, subtotal);
    } else if (discountType === 'percentage') {
      discount_amount = subtotal * (discountValue / 100);
    }
  }

  const total = Math.max(0, subtotal + tax_total - discount_amount);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_total: Math.round(tax_total * 100) / 100,
    discount_amount: Math.round(discount_amount * 100) / 100,
    total: Math.round(total * 100) / 100,
    item_amounts: item_amounts.map((a) => Math.round(a * 100) / 100),
  };
}

/**
 * Generate next invoice number
 */
export function generateInvoiceNumber(prefix: string, number: number): string {
  return `${prefix}-${number.toString().padStart(5, '0')}`;
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: string, status: InvoiceStatus): boolean {
  if (status === 'paid' || status === 'void' || status === 'draft') {
    return false;
  }
  const due = new Date(dueDate);
  const now = new Date();
  return due < now;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    draft: 'gray',
    sent: 'blue',
    viewed: 'purple',
    paid: 'green',
    overdue: 'red',
    void: 'slate',
  };
  return colors[status];
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry utility for async operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delayMs * Math.pow(2, i));
      }
    }
  }
  throw lastError;
}

/**
 * Generate idempotency key for reminders
 */
export function generateReminderIdempotencyKey(
  invoiceId: string,
  reminderType: string,
  scheduledDate: string
): string {
  return `${invoiceId}:${reminderType}:${scheduledDate}`;
}
