import type { PaymentTerms, Currency, InvoiceStatus } from './types';
/**
 * Generate a UUID v4
 */
export declare function generateUUID(): string;
/**
 * Generate a secure random token
 */
export declare function generateToken(length?: number): string;
/**
 * Calculate due date based on payment terms
 */
export declare function calculateDueDate(issueDate: Date, paymentTerms: PaymentTerms): Date;
/**
 * Format date to ISO string (date only)
 */
export declare function formatDateISO(date: Date): string;
/**
 * Format date for display in a specific timezone
 */
export declare function formatDateForTimezone(date: Date | string, timezone: string): string;
/**
 * Format currency amount
 */
export declare function formatCurrency(amount: number, currency: Currency): string;
/**
 * Calculate invoice totals
 */
export declare function calculateInvoiceTotals(items: Array<{
    quantity: number;
    unit_price: number;
    tax_rate?: number | null;
}>, discountType?: 'fixed' | 'percentage' | null, discountValue?: number | null): {
    subtotal: number;
    tax_total: number;
    discount_amount: number;
    total: number;
    item_amounts: number[];
};
/**
 * Generate next invoice number
 */
export declare function generateInvoiceNumber(prefix: string, number: number): string;
/**
 * Check if invoice is overdue
 */
export declare function isInvoiceOverdue(dueDate: string, status: InvoiceStatus): boolean;
/**
 * Get status badge color
 */
export declare function getStatusColor(status: InvoiceStatus): string;
/**
 * Truncate string with ellipsis
 */
export declare function truncate(str: string, maxLength: number): string;
/**
 * Sleep utility for async operations
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry utility for async operations
 */
export declare function retry<T>(fn: () => Promise<T>, maxRetries?: number, delayMs?: number): Promise<T>;
/**
 * Generate idempotency key for reminders
 */
export declare function generateReminderIdempotencyKey(invoiceId: string, reminderType: string, scheduledDate: string): string;
//# sourceMappingURL=utils.d.ts.map