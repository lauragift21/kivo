# Kivo

Open-source, self-hosted invoicing for freelancers and small businesses. Deploy your own instance on Cloudflare — own your data, control your workflow.

![Kivo Demo](screenshots/kivo.gif)

## Philosophy

Kivo is **single-tenant by design**. Each deployment serves one business with complete data isolation. No shared databases, no user management, no SaaS lock-in. Just your invoices, your clients, your data.

## Features

- **Clients** — Create, edit, archive with full contact details
- **Invoices** — Full lifecycle: draft, send, track, and get paid
- **PDF Generation** — Real PDFs via Cloudflare Browser Rendering API, stored in R2
- **Email Delivery** — Invoice sending, payment reminders, receipts via Resend
- **Online Payments** — Stripe Checkout integration with webhook handling
- **Payment Reminders** — Automatic reminders via Durable Objects
- **Dashboard** — KPIs and analytics at a glance
- **Zero Auth Friction** — Open the app and start invoicing immediately

## Architecture

Kivo deploys as a **single Cloudflare Worker**:

- `/api/*` → Hono API routes
- `/health` → Health check endpoint
- `/*` → Static assets (React SPA)

**Stack:**
- Cloudflare Workers + D1 (SQLite) + R2 (storage) + Durable Objects (reminders)
- React + Vite + TanStack Router/Query
- Tailwind CSS + shadcn/ui

## Quick Deploy

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account
- Resend account (for email)
- Stripe account (optional, for payments)

### 1. Create Resources

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create kivo-db
# Copy the database_id to apps/api/wrangler.jsonc

# Create R2 bucket
wrangler r2 bucket create kivo-storage
```

### 2. Configure

Edit `apps/api/wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "kivo-db",
    "database_id": "your-database-id-here"
  }
]
```

Set secrets:

```bash
cd apps/api

# Email (required)
wrangler secret put RESEND_API_KEY

# Stripe (optional — only if taking online payments)
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# PDF generation (optional)
wrangler secret put CF_API_TOKEN
```

### 3. Database Setup

```bash
# Apply migrations
npm run db:migrate -w apps/api
```

### 4. Deploy

```bash
npm run deploy
```

Your app is live at `https://kivo.your-subdomain.workers.dev`

### 5. Configure Stripe (Optional)

If using payments, create a webhook in Stripe Dashboard:
- URL: `https://your-domain.workers.dev/api/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`

### 6. First Run

Open your deployed URL. Go to **Settings** and configure:
- Business name and email
- Default currency
- Invoice prefix
- Email sender name

No signup, no accounts — just start invoicing.

## Development

```bash
# Start local dev servers
npm run dev

# API: http://localhost:8787
# Web: http://localhost:5173
```

Apply local migrations:
```bash
npm run db:migrate:local -w apps/api
```

## Environment Variables

| Secret | Required | Description |
|--------|----------|-------------|
| `RESEND_API_KEY` | Yes | Email delivery |
| `STRIPE_SECRET_KEY` | No | Online payments |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook verification |
| `CF_API_TOKEN` | No | PDF generation via Browser Rendering |

Public vars in `wrangler.jsonc`:
| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Your deployed URL |
| `API_URL` | Same as above |
| `FROM_EMAIL` | Verified sender email in Resend |
| `CF_ACCOUNT_ID` | Cloudflare account ID |

## Data Ownership

Kivo stores everything in **your** Cloudflare account:

- **D1** — All invoice, client, and settings data
- **R2** — PDFs and your business logo
- **Durable Objects** — Reminder scheduling state

Delete the worker and the data is gone. It's yours entirely.

## Testing

```bash
# Run all tests
npm test

# Run shared package tests
npm test -w packages/shared
```

## License

MIT
