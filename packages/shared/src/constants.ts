export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'viewed',
  'paid',
  'overdue',
  'void',
] as const;

export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'CHF',
  'JPY',
] as const;

export const DISCOUNT_TYPES = ['fixed', 'percentage'] as const;

export const PAYMENT_TERMS = [
  'due_on_receipt',
  'net_7',
  'net_14',
  'net_30',
  'net_60',
  'net_90',
] as const;

export const PAYMENT_TERM_DAYS: Record<string, number> = {
  due_on_receipt: 0,
  net_7: 7,
  net_14: 14,
  net_30: 30,
  net_60: 60,
  net_90: 90,
};

export const REMINDER_TYPES = [
  'before_due',
  'on_due',
  'after_due',
] as const;

export const DEFAULT_REMINDER_DAYS = {
  before_due: 3,
  on_due: 0,
  after_due: 7,
};

export const INVOICE_EVENT_TYPES = [
  'created',
  'updated',
  'sent',
  'viewed',
  'paid',
  'voided',
  'reminder_sent',
  'payment_failed',
] as const;

export const TIMEZONES = [
  'UTC',
  'Europe/Amsterdam',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
] as const;

export const DEFAULT_TIMEZONE = 'Europe/Amsterdam';

export const ANALYTICS_EVENTS = {
  CLIENT_CREATED: 'client_created',
  INVOICE_CREATED: 'invoice_created',
  INVOICE_SENT: 'invoice_sent',
  INVOICE_VIEWED: 'invoice_viewed',
  INVOICE_PAID: 'invoice_paid',
} as const;
