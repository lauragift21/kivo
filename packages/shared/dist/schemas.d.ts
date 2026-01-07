import { z } from 'zod';
export declare const emailSchema: z.ZodString;
export declare const signUpSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
}, {
    email: string;
    name: string;
}>;
export declare const signInSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const verifyMagicLinkSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    id: string;
    created_at: string;
    updated_at: string;
}, {
    email: string;
    name: string;
    id: string;
    created_at: string;
    updated_at: string;
}>;
export declare const clientSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    company: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    archived: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    archived: boolean;
    company?: string | null | undefined;
    address?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    email: string;
    name: string;
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    company?: string | null | undefined;
    address?: string | null | undefined;
    notes?: string | null | undefined;
    archived?: boolean | undefined;
}>;
export declare const createClientSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    company: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    company?: string | null | undefined;
    address?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    email: string;
    name: string;
    company?: string | null | undefined;
    address?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const updateClientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
} & {
    archived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    company?: string | null | undefined;
    address?: string | null | undefined;
    notes?: string | null | undefined;
    archived?: boolean | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    company?: string | null | undefined;
    address?: string | null | undefined;
    notes?: string | null | undefined;
    archived?: boolean | undefined;
}>;
export declare const invoiceItemSchema: z.ZodObject<{
    id: z.ZodString;
    invoice_id: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit_price: z.ZodNumber;
    tax_rate: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    amount: z.ZodNumber;
    sort_order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    invoice_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    sort_order: number;
    tax_rate?: number | null | undefined;
}, {
    id: string;
    invoice_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    sort_order: number;
    tax_rate?: number | null | undefined;
}>;
export declare const createInvoiceItemSchema: z.ZodObject<{
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit_price: z.ZodNumber;
    tax_rate: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    sort_order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number | null | undefined;
    sort_order?: number | undefined;
}, {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number | null | undefined;
    sort_order?: number | undefined;
}>;
export declare const invoiceStatusSchema: z.ZodEnum<["draft", "sent", "viewed", "paid", "overdue", "void"]>;
export declare const currencySchema: z.ZodEnum<["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"]>;
export declare const discountTypeSchema: z.ZodEnum<["fixed", "percentage"]>;
export declare const paymentTermsSchema: z.ZodEnum<["due_on_receipt", "net_7", "net_14", "net_30", "net_60", "net_90"]>;
export declare const invoiceSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    client_id: z.ZodString;
    invoice_number: z.ZodString;
    status: z.ZodEnum<["draft", "sent", "viewed", "paid", "overdue", "void"]>;
    issue_date: z.ZodString;
    due_date: z.ZodString;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"]>;
    subtotal: z.ZodNumber;
    tax_total: z.ZodNumber;
    discount_type: z.ZodOptional<z.ZodNullable<z.ZodEnum<["fixed", "percentage"]>>>;
    discount_value: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    discount_amount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    total: z.ZodNumber;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    payment_terms: z.ZodOptional<z.ZodNullable<z.ZodEnum<["due_on_receipt", "net_7", "net_14", "net_30", "net_60", "net_90"]>>>;
    reminders_enabled: z.ZodDefault<z.ZodBoolean>;
    pdf_generated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "void";
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    client_id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY";
    subtotal: number;
    tax_total: number;
    total: number;
    reminders_enabled: boolean;
    notes?: string | null | undefined;
    discount_type?: "fixed" | "percentage" | null | undefined;
    discount_value?: number | null | undefined;
    discount_amount?: number | null | undefined;
    payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | null | undefined;
    pdf_generated_at?: string | null | undefined;
}, {
    status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "void";
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    client_id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY";
    subtotal: number;
    tax_total: number;
    total: number;
    notes?: string | null | undefined;
    discount_type?: "fixed" | "percentage" | null | undefined;
    discount_value?: number | null | undefined;
    discount_amount?: number | null | undefined;
    payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | null | undefined;
    reminders_enabled?: boolean | undefined;
    pdf_generated_at?: string | null | undefined;
}>;
export declare const createInvoiceSchema: z.ZodObject<{
    client_id: z.ZodString;
    invoice_number: z.ZodString;
    issue_date: z.ZodString;
    due_date: z.ZodString;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"]>;
    discount_type: z.ZodNullable<z.ZodOptional<z.ZodEnum<["fixed", "percentage"]>>>;
    discount_value: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    payment_terms: z.ZodNullable<z.ZodOptional<z.ZodEnum<["due_on_receipt", "net_7", "net_14", "net_30", "net_60", "net_90"]>>>;
    reminders_enabled: z.ZodOptional<z.ZodBoolean>;
    items: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit_price: z.ZodNumber;
        tax_rate: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        sort_order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number | null | undefined;
        sort_order?: number | undefined;
    }, {
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number | null | undefined;
        sort_order?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    client_id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY";
    items: {
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number | null | undefined;
        sort_order?: number | undefined;
    }[];
    notes?: string | null | undefined;
    discount_type?: "fixed" | "percentage" | null | undefined;
    discount_value?: number | null | undefined;
    payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | null | undefined;
    reminders_enabled?: boolean | undefined;
}, {
    client_id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY";
    items: {
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number | null | undefined;
        sort_order?: number | undefined;
    }[];
    notes?: string | null | undefined;
    discount_type?: "fixed" | "percentage" | null | undefined;
    discount_value?: number | null | undefined;
    payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | null | undefined;
    reminders_enabled?: boolean | undefined;
}>;
export declare const updateInvoiceSchema: z.ZodObject<{
    client_id: z.ZodOptional<z.ZodString>;
    invoice_number: z.ZodOptional<z.ZodString>;
    issue_date: z.ZodOptional<z.ZodString>;
    due_date: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodEnum<["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"]>>;
    discount_type: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodEnum<["fixed", "percentage"]>>>>;
    discount_value: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    payment_terms: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodEnum<["due_on_receipt", "net_7", "net_14", "net_30", "net_60", "net_90"]>>>>;
    reminders_enabled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit_price: z.ZodNumber;
        tax_rate: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        sort_order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number | null | undefined;
        sort_order?: number | undefined;
    }, {
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number | null | undefined;
        sort_order?: number | undefined;
    }>, "many">>;
} & {
    status: z.ZodOptional<z.ZodEnum<["draft", "sent", "viewed", "paid", "overdue", "void"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "draft" | "sent" | "viewed" | "paid" | "overdue" | "void" | undefined;
    notes?: string | null | undefined;
    client_id?: string | undefined;
    invoice_number?: string | undefined;
    issue_date?: string | undefined;
    due_date?: string | undefined;
    currency?: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY" | undefined;
    discount_type?: "fixed" | "percentage" | null | undefined;
    discount_value?: number | null | undefined;
    payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | null | undefined;
    reminders_enabled?: boolean | undefined;
    items?: {
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number | null | undefined;
        sort_order?: number | undefined;
    }[] | undefined;
}, {
    status?: "draft" | "sent" | "viewed" | "paid" | "overdue" | "void" | undefined;
    notes?: string | null | undefined;
    client_id?: string | undefined;
    invoice_number?: string | undefined;
    issue_date?: string | undefined;
    due_date?: string | undefined;
    currency?: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY" | undefined;
    discount_type?: "fixed" | "percentage" | null | undefined;
    discount_value?: number | null | undefined;
    payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | null | undefined;
    reminders_enabled?: boolean | undefined;
    items?: {
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number | null | undefined;
        sort_order?: number | undefined;
    }[] | undefined;
}>;
export declare const invoiceWithClientSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    client_id: z.ZodString;
    invoice_number: z.ZodString;
    status: z.ZodEnum<["draft", "sent", "viewed", "paid", "overdue", "void"]>;
    issue_date: z.ZodString;
    due_date: z.ZodString;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"]>;
    subtotal: z.ZodNumber;
    tax_total: z.ZodNumber;
    discount_type: z.ZodOptional<z.ZodNullable<z.ZodEnum<["fixed", "percentage"]>>>;
    discount_value: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    discount_amount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    total: z.ZodNumber;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    payment_terms: z.ZodOptional<z.ZodNullable<z.ZodEnum<["due_on_receipt", "net_7", "net_14", "net_30", "net_60", "net_90"]>>>;
    reminders_enabled: z.ZodDefault<z.ZodBoolean>;
    pdf_generated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    client: z.ZodObject<Pick<{
        id: z.ZodString;
        user_id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        company: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        archived: z.ZodDefault<z.ZodBoolean>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
    }, "email" | "name" | "id" | "company" | "address">, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
        id: string;
        company?: string | null | undefined;
        address?: string | null | undefined;
    }, {
        email: string;
        name: string;
        id: string;
        company?: string | null | undefined;
        address?: string | null | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        invoice_id: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit_price: z.ZodNumber;
        tax_rate: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        amount: z.ZodNumber;
        sort_order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        invoice_id: string;
        description: string;
        quantity: number;
        unit_price: number;
        amount: number;
        sort_order: number;
        tax_rate?: number | null | undefined;
    }, {
        id: string;
        invoice_id: string;
        description: string;
        quantity: number;
        unit_price: number;
        amount: number;
        sort_order: number;
        tax_rate?: number | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "void";
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    client_id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY";
    subtotal: number;
    tax_total: number;
    total: number;
    reminders_enabled: boolean;
    items: {
        id: string;
        invoice_id: string;
        description: string;
        quantity: number;
        unit_price: number;
        amount: number;
        sort_order: number;
        tax_rate?: number | null | undefined;
    }[];
    client: {
        email: string;
        name: string;
        id: string;
        company?: string | null | undefined;
        address?: string | null | undefined;
    };
    notes?: string | null | undefined;
    discount_type?: "fixed" | "percentage" | null | undefined;
    discount_value?: number | null | undefined;
    discount_amount?: number | null | undefined;
    payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | null | undefined;
    pdf_generated_at?: string | null | undefined;
}, {
    status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "void";
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    client_id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY";
    subtotal: number;
    tax_total: number;
    total: number;
    items: {
        id: string;
        invoice_id: string;
        description: string;
        quantity: number;
        unit_price: number;
        amount: number;
        sort_order: number;
        tax_rate?: number | null | undefined;
    }[];
    client: {
        email: string;
        name: string;
        id: string;
        company?: string | null | undefined;
        address?: string | null | undefined;
    };
    notes?: string | null | undefined;
    discount_type?: "fixed" | "percentage" | null | undefined;
    discount_value?: number | null | undefined;
    discount_amount?: number | null | undefined;
    payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | null | undefined;
    reminders_enabled?: boolean | undefined;
    pdf_generated_at?: string | null | undefined;
}>;
export declare const invoiceEventTypeSchema: z.ZodEnum<["created", "updated", "sent", "viewed", "paid", "voided", "reminder_sent", "payment_failed"]>;
export declare const invoiceEventSchema: z.ZodObject<{
    id: z.ZodString;
    invoice_id: z.ZodString;
    event_type: z.ZodEnum<["created", "updated", "sent", "viewed", "paid", "voided", "reminder_sent", "payment_failed"]>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    invoice_id: string;
    event_type: "sent" | "viewed" | "paid" | "created" | "updated" | "voided" | "reminder_sent" | "payment_failed";
    metadata?: Record<string, unknown> | null | undefined;
}, {
    id: string;
    created_at: string;
    invoice_id: string;
    event_type: "sent" | "viewed" | "paid" | "created" | "updated" | "voided" | "reminder_sent" | "payment_failed";
    metadata?: Record<string, unknown> | null | undefined;
}>;
export declare const publicTokenSchema: z.ZodObject<{
    id: z.ZodString;
    invoice_id: z.ZodString;
    token: z.ZodString;
    expires_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    id: string;
    created_at: string;
    invoice_id: string;
    expires_at?: string | null | undefined;
}, {
    token: string;
    id: string;
    created_at: string;
    invoice_id: string;
    expires_at?: string | null | undefined;
}>;
export declare const paymentSchema: z.ZodObject<{
    id: z.ZodString;
    invoice_id: z.ZodString;
    stripe_payment_intent_id: z.ZodString;
    stripe_checkout_session_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    amount: z.ZodNumber;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"]>;
    status: z.ZodEnum<["pending", "succeeded", "failed", "refunded"]>;
    paid_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "succeeded" | "failed" | "refunded";
    id: string;
    created_at: string;
    invoice_id: string;
    amount: number;
    currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY";
    stripe_payment_intent_id: string;
    stripe_checkout_session_id?: string | null | undefined;
    paid_at?: string | null | undefined;
}, {
    status: "pending" | "succeeded" | "failed" | "refunded";
    id: string;
    created_at: string;
    invoice_id: string;
    amount: number;
    currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY";
    stripe_payment_intent_id: string;
    stripe_checkout_session_id?: string | null | undefined;
    paid_at?: string | null | undefined;
}>;
export declare const settingsSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    business_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    business_email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    business_address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logo_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    default_currency: z.ZodDefault<z.ZodEnum<["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"]>>;
    default_payment_terms: z.ZodDefault<z.ZodEnum<["due_on_receipt", "net_7", "net_14", "net_30", "net_60", "net_90"]>>;
    timezone: z.ZodDefault<z.ZodEnum<["UTC", "Europe/Amsterdam", "Europe/London", "Europe/Paris", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney"]>>;
    email_from_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    invoice_prefix: z.ZodDefault<z.ZodString>;
    next_invoice_number: z.ZodDefault<z.ZodNumber>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    default_currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY";
    default_payment_terms: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90";
    timezone: "UTC" | "Europe/Amsterdam" | "Europe/London" | "Europe/Paris" | "Europe/Berlin" | "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "Asia/Tokyo" | "Asia/Singapore" | "Australia/Sydney";
    invoice_prefix: string;
    next_invoice_number: number;
    business_name?: string | null | undefined;
    business_email?: string | null | undefined;
    business_address?: string | null | undefined;
    logo_url?: string | null | undefined;
    email_from_name?: string | null | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    business_name?: string | null | undefined;
    business_email?: string | null | undefined;
    business_address?: string | null | undefined;
    logo_url?: string | null | undefined;
    default_currency?: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY" | undefined;
    default_payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | undefined;
    timezone?: "UTC" | "Europe/Amsterdam" | "Europe/London" | "Europe/Paris" | "Europe/Berlin" | "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "Asia/Tokyo" | "Asia/Singapore" | "Australia/Sydney" | undefined;
    email_from_name?: string | null | undefined;
    invoice_prefix?: string | undefined;
    next_invoice_number?: number | undefined;
}>;
export declare const updateSettingsSchema: z.ZodObject<{
    business_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    business_email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    business_address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    default_currency: z.ZodOptional<z.ZodEnum<["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"]>>;
    default_payment_terms: z.ZodOptional<z.ZodEnum<["due_on_receipt", "net_7", "net_14", "net_30", "net_60", "net_90"]>>;
    timezone: z.ZodOptional<z.ZodEnum<["UTC", "Europe/Amsterdam", "Europe/London", "Europe/Paris", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney"]>>;
    email_from_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    invoice_prefix: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    business_name?: string | null | undefined;
    business_email?: string | null | undefined;
    business_address?: string | null | undefined;
    default_currency?: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY" | undefined;
    default_payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | undefined;
    timezone?: "UTC" | "Europe/Amsterdam" | "Europe/London" | "Europe/Paris" | "Europe/Berlin" | "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "Asia/Tokyo" | "Asia/Singapore" | "Australia/Sydney" | undefined;
    email_from_name?: string | null | undefined;
    invoice_prefix?: string | undefined;
}, {
    business_name?: string | null | undefined;
    business_email?: string | null | undefined;
    business_address?: string | null | undefined;
    default_currency?: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "CHF" | "JPY" | undefined;
    default_payment_terms?: "due_on_receipt" | "net_7" | "net_14" | "net_30" | "net_60" | "net_90" | undefined;
    timezone?: "UTC" | "Europe/Amsterdam" | "Europe/London" | "Europe/Paris" | "Europe/Berlin" | "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "Asia/Tokyo" | "Asia/Singapore" | "Australia/Sydney" | undefined;
    email_from_name?: string | null | undefined;
    invoice_prefix?: string | undefined;
}>;
export declare const dashboardKPIsSchema: z.ZodObject<{
    total_outstanding: z.ZodNumber;
    total_paid_this_month: z.ZodNumber;
    overdue_count: z.ZodNumber;
    total_clients: z.ZodNumber;
    total_invoices: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total_outstanding: number;
    total_paid_this_month: number;
    overdue_count: number;
    total_clients: number;
    total_invoices: number;
}, {
    total_outstanding: number;
    total_paid_this_month: number;
    overdue_count: number;
    total_clients: number;
    total_invoices: number;
}>;
export declare const invoiceFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["draft", "sent", "viewed", "paid", "overdue", "void"]>>;
    client_id: z.ZodOptional<z.ZodString>;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "draft" | "sent" | "viewed" | "paid" | "overdue" | "void" | undefined;
    client_id?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
}, {
    status?: "draft" | "sent" | "viewed" | "paid" | "overdue" | "void" | undefined;
    client_id?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const reminderTypeSchema: z.ZodEnum<["before_due", "on_due", "after_due"]>;
export declare const reminderSchema: z.ZodObject<{
    invoice_id: z.ZodString;
    reminder_type: z.ZodEnum<["before_due", "on_due", "after_due"]>;
    scheduled_at: z.ZodString;
    sent_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    invoice_id: string;
    reminder_type: "before_due" | "on_due" | "after_due";
    scheduled_at: string;
    sent_at?: string | null | undefined;
}, {
    invoice_id: string;
    reminder_type: "before_due" | "on_due" | "after_due";
    scheduled_at: string;
    sent_at?: string | null | undefined;
}>;
export declare const apiErrorSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: unknown;
    }, {
        code: string;
        message: string;
        details?: unknown;
    }>;
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    requestId: string;
}, {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    requestId: string;
}>;
export declare const paginatedResponseSchema: <T extends z.ZodTypeAny>(itemSchema: T) => z.ZodObject<{
    data: z.ZodArray<T, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        total_pages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    }, {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    }>;
}, "strip", z.ZodTypeAny, {
    data: T["_output"][];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}, {
    data: T["_input"][];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}>;
export declare const stripeCheckoutSessionSchema: z.ZodObject<{
    invoice_id: z.ZodString;
    success_url: z.ZodString;
    cancel_url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    invoice_id: string;
    success_url: string;
    cancel_url: string;
}, {
    invoice_id: string;
    success_url: string;
    cancel_url: string;
}>;
//# sourceMappingURL=schemas.d.ts.map