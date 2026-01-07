import { z } from 'zod';
import {
  INVOICE_STATUSES,
  CURRENCIES,
  DISCOUNT_TYPES,
  PAYMENT_TERMS,
  REMINDER_TYPES,
  INVOICE_EVENT_TYPES,
  TIMEZONES,
} from './constants';

// ============ Auth Schemas ============

export const emailSchema = z.string().email('Invalid email address');

export const signUpSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Name is required').max(100),
});

export const signInSchema = z.object({
  email: emailSchema,
});

export const verifyMagicLinkSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// ============ User Schemas ============

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ============ Client Schemas ============

export const clientSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1, 'Client name is required').max(200),
  email: z.string().email('Invalid email address'),
  company: z.string().max(200).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  archived: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(200),
  email: z.string().email('Invalid email address'),
  company: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  archived: z.boolean().optional(),
});

// ============ Invoice Item Schemas ============

export const invoiceItemSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  tax_rate: z.number().min(0).max(100).nullable().optional(),
  amount: z.number(),
  sort_order: z.number().int().min(0),
});

export const createInvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  tax_rate: z.number().min(0).max(100).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
});

// ============ Invoice Schemas ============

export const invoiceStatusSchema = z.enum(INVOICE_STATUSES);
export const currencySchema = z.enum(CURRENCIES);
export const discountTypeSchema = z.enum(DISCOUNT_TYPES);
export const paymentTermsSchema = z.enum(PAYMENT_TERMS);

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  client_id: z.string().uuid(),
  invoice_number: z.string().min(1).max(50),
  status: invoiceStatusSchema,
  issue_date: z.string(),
  due_date: z.string(),
  currency: currencySchema,
  subtotal: z.number(),
  tax_total: z.number(),
  discount_type: discountTypeSchema.nullable().optional(),
  discount_value: z.number().min(0).nullable().optional(),
  discount_amount: z.number().min(0).nullable().optional(),
  total: z.number(),
  notes: z.string().max(2000).nullable().optional(),
  payment_terms: paymentTermsSchema.nullable().optional(),
  reminders_enabled: z.boolean().default(true),
  pdf_generated_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const createInvoiceSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  invoice_number: z.string().min(1, 'Invoice number is required').max(50),
  issue_date: z.string(),
  due_date: z.string(),
  currency: currencySchema,
  discount_type: discountTypeSchema.optional().nullable(),
  discount_value: z.number().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  payment_terms: paymentTermsSchema.optional().nullable(),
  reminders_enabled: z.boolean().optional(),
  items: z.array(createInvoiceItemSchema).min(1, 'At least one item is required'),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: invoiceStatusSchema.optional(),
});

export const invoiceWithClientSchema = invoiceSchema.extend({
  client: clientSchema.pick({
    id: true,
    name: true,
    email: true,
    company: true,
    address: true,
  }),
  items: z.array(invoiceItemSchema),
});

// ============ Invoice Event Schemas ============

export const invoiceEventTypeSchema = z.enum(INVOICE_EVENT_TYPES);

export const invoiceEventSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  event_type: invoiceEventTypeSchema,
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.string(),
});

// ============ Public Token Schemas ============

export const publicTokenSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  token: z.string().min(32),
  expires_at: z.string().nullable().optional(),
  created_at: z.string(),
});

// ============ Payment Schemas ============

export const paymentSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  stripe_payment_intent_id: z.string(),
  stripe_checkout_session_id: z.string().nullable().optional(),
  amount: z.number().positive(),
  currency: currencySchema,
  status: z.enum(['pending', 'succeeded', 'failed', 'refunded']),
  paid_at: z.string().nullable().optional(),
  created_at: z.string(),
});

// ============ Settings Schemas ============

export const settingsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  business_name: z.string().max(200).nullable().optional(),
  business_email: z.string().email().nullable().optional(),
  business_address: z.string().max(500).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  default_currency: currencySchema.default('USD'),
  default_payment_terms: paymentTermsSchema.default('net_30'),
  timezone: z.enum(TIMEZONES).default('Europe/Amsterdam'),
  email_from_name: z.string().max(100).nullable().optional(),
  invoice_prefix: z.string().max(10).default('INV'),
  next_invoice_number: z.number().int().positive().default(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export const updateSettingsSchema = z.object({
  business_name: z.string().max(200).optional().nullable(),
  business_email: z.string().email().optional().nullable(),
  business_address: z.string().max(500).optional().nullable(),
  default_currency: currencySchema.optional(),
  default_payment_terms: paymentTermsSchema.optional(),
  timezone: z.enum(TIMEZONES).optional(),
  email_from_name: z.string().max(100).optional().nullable(),
  invoice_prefix: z.string().max(10).optional(),
});

// ============ Dashboard Schemas ============

export const dashboardKPIsSchema = z.object({
  total_outstanding: z.number(),
  total_paid_this_month: z.number(),
  overdue_count: z.number(),
  total_clients: z.number(),
  total_invoices: z.number(),
});

export const invoiceFilterSchema = z.object({
  status: invoiceStatusSchema.optional(),
  client_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ============ Reminder Schemas ============

export const reminderTypeSchema = z.enum(REMINDER_TYPES);

export const reminderSchema = z.object({
  invoice_id: z.string().uuid(),
  reminder_type: reminderTypeSchema,
  scheduled_at: z.string(),
  sent_at: z.string().nullable().optional(),
});

// ============ API Response Schemas ============

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
  requestId: z.string(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      total_pages: z.number(),
    }),
  });

// ============ Stripe Webhook Schemas ============

export const stripeCheckoutSessionSchema = z.object({
  invoice_id: z.string().uuid(),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});
