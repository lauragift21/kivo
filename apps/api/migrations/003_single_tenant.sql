-- Kivo Single-Tenant Migration
-- Removes multi-user support: drops users/magic_link_tokens, removes user_id columns

-- Drop unused tables
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS magic_link_tokens;

-- ============================================
-- Clients: recreate without user_id
-- ============================================
CREATE TABLE clients_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  address TEXT,
  notes TEXT,
  archived INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO clients_new (id, name, email, company, address, notes, archived, created_at, updated_at)
SELECT id, name, email, company, address, notes, archived, created_at, updated_at FROM clients;

DROP TABLE clients;
ALTER TABLE clients_new RENAME TO clients;

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_archived ON clients(archived);

-- ============================================
-- Invoices: recreate without user_id
-- ============================================
CREATE TABLE invoices_new (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal REAL NOT NULL DEFAULT 0,
  tax_total REAL NOT NULL DEFAULT 0,
  discount_type TEXT,
  discount_value REAL,
  discount_amount REAL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  notes TEXT,
  payment_terms TEXT,
  reminders_enabled INTEGER DEFAULT 1,
  pdf_generated_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
);

INSERT INTO invoices_new (
  id, client_id, invoice_number, status, issue_date, due_date, currency,
  subtotal, tax_total, discount_type, discount_value, discount_amount, total,
  notes, payment_terms, reminders_enabled, pdf_generated_at, created_at, updated_at
)
SELECT
  id, client_id, invoice_number, status, issue_date, due_date, currency,
  subtotal, tax_total, discount_type, discount_value, discount_amount, total,
  notes, payment_terms, reminders_enabled, pdf_generated_at, created_at, updated_at
FROM invoices;

DROP TABLE invoices;
ALTER TABLE invoices_new RENAME TO invoices;

CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_created ON invoices(created_at DESC);

-- ============================================
-- Settings: recreate without user_id (singleton)
-- Keep only the first settings row if multiple exist
-- ============================================
CREATE TABLE settings_new (
  id TEXT PRIMARY KEY,
  business_name TEXT,
  business_email TEXT,
  business_address TEXT,
  logo_url TEXT,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  default_payment_terms TEXT NOT NULL DEFAULT 'net_30',
  timezone TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
  email_from_name TEXT,
  invoice_prefix TEXT NOT NULL DEFAULT 'INV',
  next_invoice_number INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO settings_new (
  id, business_name, business_email, business_address, logo_url,
  default_currency, default_payment_terms, timezone, email_from_name,
  invoice_prefix, next_invoice_number, created_at, updated_at
)
SELECT
  id, business_name, business_email, business_address, logo_url,
  default_currency, default_payment_terms, timezone, email_from_name,
  invoice_prefix, next_invoice_number, created_at, updated_at
FROM settings LIMIT 1;

DROP TABLE settings;
ALTER TABLE settings_new RENAME TO settings;
