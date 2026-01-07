import { PAYMENT_TERM_DAYS } from './constants';
/**
 * Generate a UUID v4
 */
export function generateUUID() {
    return crypto.randomUUID();
}
/**
 * Generate a secure random token
 */
export function generateToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
/**
 * Calculate due date based on payment terms
 */
export function calculateDueDate(issueDate, paymentTerms) {
    const days = PAYMENT_TERM_DAYS[paymentTerms] ?? 30;
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
}
/**
 * Format date to ISO string (date only)
 */
export function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}
/**
 * Format date for display in a specific timezone
 */
export function formatDateForTimezone(date, timezone) {
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
export function formatCurrency(amount, currency) {
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
export function calculateInvoiceTotals(items, discountType, discountValue) {
    let subtotal = 0;
    let tax_total = 0;
    const item_amounts = [];
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
        }
        else if (discountType === 'percentage') {
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
export function generateInvoiceNumber(prefix, number) {
    return `${prefix}-${number.toString().padStart(5, '0')}`;
}
/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate, status) {
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
export function getStatusColor(status) {
    const colors = {
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
export function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - 3) + '...';
}
/**
 * Sleep utility for async operations
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Retry utility for async operations
 */
export async function retry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
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
export function generateReminderIdempotencyKey(invoiceId, reminderType, scheduledDate) {
    return `${invoiceId}:${reminderType}:${scheduledDate}`;
}
