export declare const INVOICE_STATUSES: readonly ["draft", "sent", "viewed", "paid", "overdue", "void"];
export declare const CURRENCIES: readonly ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"];
export declare const DISCOUNT_TYPES: readonly ["fixed", "percentage"];
export declare const PAYMENT_TERMS: readonly ["due_on_receipt", "net_7", "net_14", "net_30", "net_60", "net_90"];
export declare const PAYMENT_TERM_DAYS: Record<string, number>;
export declare const REMINDER_TYPES: readonly ["before_due", "on_due", "after_due"];
export declare const DEFAULT_REMINDER_DAYS: {
    before_due: number;
    on_due: number;
    after_due: number;
};
export declare const INVOICE_EVENT_TYPES: readonly ["created", "updated", "sent", "viewed", "paid", "voided", "reminder_sent", "payment_failed"];
export declare const TIMEZONES: readonly ["UTC", "Europe/Amsterdam", "Europe/London", "Europe/Paris", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney"];
export declare const DEFAULT_TIMEZONE = "Europe/Amsterdam";
export declare const ANALYTICS_EVENTS: {
    readonly CLIENT_CREATED: "client_created";
    readonly INVOICE_CREATED: "invoice_created";
    readonly INVOICE_SENT: "invoice_sent";
    readonly INVOICE_VIEWED: "invoice_viewed";
    readonly INVOICE_PAID: "invoice_paid";
};
//# sourceMappingURL=constants.d.ts.map