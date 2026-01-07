-- Seed data for Kivo
-- This creates a demo user with sample clients and invoices

-- Demo user
INSERT INTO users (id, email, name, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@smartinvoicing.app',
  'Demo User',
  '2024-01-01T00:00:00.000Z',
  '2024-01-01T00:00:00.000Z'
);

-- Demo user settings
INSERT INTO settings (id, user_id, business_name, business_email, business_address, default_currency, default_payment_terms, timezone, email_from_name, invoice_prefix, next_invoice_number, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Acme Design Studio',
  'hello@acmedesign.co',
  '123 Creative Street\nDesign District\nNew York, NY 10001',
  'USD',
  'net_30',
  'America/New_York',
  'Acme Design',
  'INV',
  4,
  '2024-01-01T00:00:00.000Z',
  '2024-01-01T00:00:00.000Z'
);

-- Sample clients
INSERT INTO clients (id, user_id, name, email, company, address, notes, archived, created_at, updated_at)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  'John Smith',
  'john@techstartup.io',
  'TechStartup Inc.',
  '456 Innovation Blvd\nSilicon Valley, CA 94025',
  'Great client - always pays on time',
  0,
  '2024-01-15T10:00:00.000Z',
  '2024-01-15T10:00:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440000',
  'Sarah Johnson',
  'sarah@greenleaf.eco',
  'GreenLeaf Organics',
  '789 Sustainability Ave\nPortland, OR 97201',
  'Referred by John Smith',
  0,
  '2024-02-01T14:30:00.000Z',
  '2024-02-01T14:30:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440000',
  'Mike Chen',
  'mike@coffeeroasters.com',
  'Artisan Coffee Roasters',
  '321 Bean Street\nSeattle, WA 98101',
  NULL,
  0,
  '2024-02-15T09:00:00.000Z',
  '2024-02-15T09:00:00.000Z'
);

-- Sample invoices
INSERT INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, currency, subtotal, tax_total, discount_type, discount_value, discount_amount, total, notes, payment_terms, reminders_enabled, created_at, updated_at)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440010',
  'INV-00001',
  'paid',
  '2024-01-20',
  '2024-02-19',
  'USD',
  5000.00,
  0,
  NULL,
  NULL,
  0,
  5000.00,
  'Thank you for your business!',
  'net_30',
  1,
  '2024-01-20T10:00:00.000Z',
  '2024-02-15T14:00:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440021',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440011',
  'INV-00002',
  'sent',
  '2024-03-01',
  '2024-03-31',
  'USD',
  3500.00,
  280.00,
  'percentage',
  10,
  350.00,
  3430.00,
  'Website redesign project - Phase 1',
  'net_30',
  1,
  '2024-03-01T09:00:00.000Z',
  '2024-03-01T09:30:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440022',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440012',
  'INV-00003',
  'draft',
  '2024-03-15',
  '2024-04-14',
  'USD',
  2200.00,
  0,
  NULL,
  NULL,
  0,
  2200.00,
  'Brand identity package',
  'net_30',
  1,
  '2024-03-15T11:00:00.000Z',
  '2024-03-15T11:00:00.000Z'
);

-- Invoice items for INV-00001
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, amount, sort_order)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440030',
  '550e8400-e29b-41d4-a716-446655440020',
  'Web Application Development',
  40,
  100.00,
  NULL,
  4000.00,
  0
),
(
  '550e8400-e29b-41d4-a716-446655440031',
  '550e8400-e29b-41d4-a716-446655440020',
  'UI/UX Design Consultation',
  10,
  100.00,
  NULL,
  1000.00,
  1
);

-- Invoice items for INV-00002
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, amount, sort_order)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440032',
  '550e8400-e29b-41d4-a716-446655440021',
  'Homepage Redesign',
  1,
  1500.00,
  8,
  1500.00,
  0
),
(
  '550e8400-e29b-41d4-a716-446655440033',
  '550e8400-e29b-41d4-a716-446655440021',
  'Product Pages (5 pages)',
  5,
  300.00,
  8,
  1500.00,
  1
),
(
  '550e8400-e29b-41d4-a716-446655440034',
  '550e8400-e29b-41d4-a716-446655440021',
  'Responsive Mobile Optimization',
  1,
  500.00,
  8,
  500.00,
  2
);

-- Invoice items for INV-00003
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, amount, sort_order)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440035',
  '550e8400-e29b-41d4-a716-446655440022',
  'Logo Design (3 concepts)',
  1,
  800.00,
  NULL,
  800.00,
  0
),
(
  '550e8400-e29b-41d4-a716-446655440036',
  '550e8400-e29b-41d4-a716-446655440022',
  'Brand Style Guide',
  1,
  600.00,
  NULL,
  600.00,
  1
),
(
  '550e8400-e29b-41d4-a716-446655440037',
  '550e8400-e29b-41d4-a716-446655440022',
  'Business Card Design',
  1,
  400.00,
  NULL,
  400.00,
  2
),
(
  '550e8400-e29b-41d4-a716-446655440038',
  '550e8400-e29b-41d4-a716-446655440022',
  'Social Media Assets',
  1,
  400.00,
  NULL,
  400.00,
  3
);

-- Invoice events
INSERT INTO invoice_events (id, invoice_id, event_type, metadata, created_at)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440040',
  '550e8400-e29b-41d4-a716-446655440020',
  'created',
  NULL,
  '2024-01-20T10:00:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440041',
  '550e8400-e29b-41d4-a716-446655440020',
  'sent',
  '{"email": "john@techstartup.io"}',
  '2024-01-20T10:30:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440042',
  '550e8400-e29b-41d4-a716-446655440020',
  'viewed',
  NULL,
  '2024-01-21T09:00:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440043',
  '550e8400-e29b-41d4-a716-446655440020',
  'paid',
  '{"payment_intent": "pi_demo123", "amount": 500000}',
  '2024-02-15T14:00:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440044',
  '550e8400-e29b-41d4-a716-446655440021',
  'created',
  NULL,
  '2024-03-01T09:00:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440045',
  '550e8400-e29b-41d4-a716-446655440021',
  'sent',
  '{"email": "sarah@greenleaf.eco"}',
  '2024-03-01T09:30:00.000Z'
),
(
  '550e8400-e29b-41d4-a716-446655440046',
  '550e8400-e29b-41d4-a716-446655440022',
  'created',
  NULL,
  '2024-03-15T11:00:00.000Z'
);

-- Public token for INV-00002 (sent invoice)
INSERT INTO invoice_public_tokens (id, invoice_id, token, expires_at, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440050',
  '550e8400-e29b-41d4-a716-446655440021',
  'demo_public_token_abc123def456',
  NULL,
  '2024-03-01T09:30:00.000Z'
);

-- Payment record for paid invoice
INSERT INTO payments (id, invoice_id, stripe_payment_intent_id, stripe_checkout_session_id, amount, currency, status, paid_at, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440060',
  '550e8400-e29b-41d4-a716-446655440020',
  'pi_demo123',
  'cs_demo123',
  5000.00,
  'USD',
  'succeeded',
  '2024-02-15T14:00:00.000Z',
  '2024-02-15T13:55:00.000Z'
);
