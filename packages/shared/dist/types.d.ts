import { z } from 'zod';
import { userSchema, clientSchema, createClientSchema, updateClientSchema, invoiceSchema, invoiceItemSchema, createInvoiceSchema, updateInvoiceSchema, invoiceWithClientSchema, invoiceEventSchema, publicTokenSchema, paymentSchema, settingsSchema, updateSettingsSchema, dashboardKPIsSchema, invoiceFilterSchema, reminderSchema, apiErrorSchema, signUpSchema, signInSchema, verifyMagicLinkSchema, createInvoiceItemSchema } from './schemas';
import { INVOICE_STATUSES, CURRENCIES, DISCOUNT_TYPES, PAYMENT_TERMS, REMINDER_TYPES, INVOICE_EVENT_TYPES, TIMEZONES } from './constants';
export type User = z.infer<typeof userSchema>;
export type Client = z.infer<typeof clientSchema>;
export type CreateClient = z.infer<typeof createClientSchema>;
export type UpdateClient = z.infer<typeof updateClientSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type CreateInvoice = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof updateInvoiceSchema>;
export type InvoiceWithClient = z.infer<typeof invoiceWithClientSchema>;
export type CreateInvoiceItem = z.infer<typeof createInvoiceItemSchema>;
export type InvoiceEvent = z.infer<typeof invoiceEventSchema>;
export type PublicToken = z.infer<typeof publicTokenSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type DashboardKPIs = z.infer<typeof dashboardKPIsSchema>;
export type InvoiceFilter = z.infer<typeof invoiceFilterSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type VerifyMagicLink = z.infer<typeof verifyMagicLinkSchema>;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type Currency = (typeof CURRENCIES)[number];
export type DiscountType = (typeof DISCOUNT_TYPES)[number];
export type PaymentTerms = (typeof PAYMENT_TERMS)[number];
export type ReminderType = (typeof REMINDER_TYPES)[number];
export type InvoiceEventType = (typeof INVOICE_EVENT_TYPES)[number];
export type Timezone = (typeof TIMEZONES)[number];
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}
export interface ApiResponse<T> {
    data: T;
    requestId: string;
}
export interface AuthSession {
    user: User;
    token: string;
    expires_at: string;
}
export interface MagicLinkToken {
    id: string;
    user_id: string | null;
    email: string;
    token: string;
    expires_at: string;
    used_at: string | null;
    created_at: string;
}
export interface RecentInvoice {
    id: string;
    invoice_number: string;
    client_name: string;
    status: InvoiceStatus;
    total: number;
    currency: Currency;
    due_date: string;
    created_at: string;
}
export interface DashboardData {
    kpis: DashboardKPIs;
    recent_invoices: RecentInvoice[];
}
export interface PublicInvoiceData {
    invoice: {
        invoice_number: string;
        status: InvoiceStatus;
        issue_date: string;
        due_date: string;
        currency: Currency;
        subtotal: number;
        tax_total: number;
        discount_amount: number | null;
        total: number;
        notes: string | null;
        payment_terms: PaymentTerms | null;
    };
    client: {
        name: string;
        email: string;
        company: string | null;
        address: string | null;
    };
    business: {
        name: string | null;
        email: string | null;
        address: string | null;
        logo_url: string | null;
    };
    items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate: number | null;
        amount: number;
    }>;
    can_pay: boolean;
    pdf_url: string | null;
}
export interface ReminderJob {
    invoice_id: string;
    reminder_type: ReminderType;
    scheduled_at: number;
    idempotency_key: string;
}
export interface ReminderState {
    invoices: Record<string, {
        reminders: ReminderJob[];
        last_updated: number;
    }>;
}
export interface AnalyticsEvent {
    event: string;
    user_id: string;
    properties: Record<string, unknown>;
    timestamp: string;
}
//# sourceMappingURL=types.d.ts.map