# Kivo

Modern invoicing for freelancers and independent creators. Built on the Cloudflare developer platform.

![Kivo Demo](screenshots/kivo.gif)

## Features

- **Authentication**: Email magic link authentication (passwordless)
- **Multi-tenant**: Each user only sees their own data
- **Clients**: Create, edit, archive clients with full contact details
- **Invoices**: Full invoice lifecycle - draft, send, track, and get paid
- **PDF Generation**: Real PDF invoices via Cloudflare Browser Rendering API, stored in R2
- **Email Notifications**: Invoice delivery, reminders, payment receipts via Resend
- **Payments**: Stripe Checkout integration with webhook handling
- **Reminders**: Automatic payment reminders using Durable Objects
- **Dashboard**: KPIs and analytics at a glance

## Architecture Overview

```
kivo/
├── apps/
│   ├── api/          # Cloudflare Workers backend (Hono) + static assets
│   └── web/          # React frontend (Vite + TanStack)
└── packages/
    └── shared/       # Shared types and utilities
```

### Deployment Architecture

Kivo deploys as a **single Cloudflare Worker** that serves both the API and frontend:

- `/api/*` → Hono API routes
- `/health` → Health check endpoint
- `/*` → Static assets (React SPA)

This unified deployment provides:
- Single URL for the entire application
- No CORS configuration needed (same origin)
- Simplified deployment process
- Reduced infrastructure complexity

### Tech Stack

**Backend**
- Cloudflare Workers (TypeScript, ES Modules)
- Hono for routing
- D1 for relational data
- R2 for PDF/asset storage
- Browser Rendering API for PDF generation
- Durable Objects for reminder scheduling
- Cron Triggers for periodic reconciliation
- Static Assets for serving the frontend

**Frontend**
- React + Vite
- TanStack Router + Query
- Tailwind CSS + shadcn/ui
- Form validation with Zod
- react-hook-form

**Email + Payments**
- Resend for transactional email
- Stripe for payments

## Setup Instructions

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account
- Stripe account
- Resend account

### 1. Clone and Install

```bash
git clone <repository-url>
cd kivo
npm install
```

### 2. Create Cloudflare Resources

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create kivo-db
# Copy the database_id to wrangler.jsonc

# Create R2 bucket
wrangler r2 bucket create kivo-storage
```

### 3. Configure Environment Variables

Update `apps/api/wrangler.jsonc` with your D1 database ID.

Set secrets using Wrangler:

```bash
cd apps/api

# JWT secret for auth tokens
wrangler secret put JWT_SECRET
# (Enter a secure random string)

# Resend API key for email
wrangler secret put RESEND_API_KEY
# (Get from https://resend.com/api-keys)

# Stripe secret key
wrangler secret put STRIPE_SECRET_KEY
# (Get from https://dashboard.stripe.com/apikeys)

# Stripe webhook secret
wrangler secret put STRIPE_WEBHOOK_SECRET
# (Get after creating webhook endpoint)

# Cloudflare Browser Rendering API token (for PDF generation)
wrangler secret put CF_API_TOKEN
# (Create at https://dash.cloudflare.com/profile/api-tokens with Browser Rendering permissions)
```

### 4. Run Database Migrations

```bash
# Local development
npm run db:migrate:local -w apps/api

# Production
npm run db:migrate -w apps/api

# Seed sample data (optional)
npm run db:seed:local -w apps/api
```

### 5. Configure Stripe Webhook

Create a webhook endpoint in Stripe Dashboard:
- URL: `https://your-worker.your-subdomain.workers.dev/api/webhooks/stripe`
- Events to listen for:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `payment_intent.payment_failed`

### 6. Start Development

```bash
# Start both API and web dev servers
npm run dev
```

- API: http://localhost:8787
- Web: http://localhost:5173

### 7. Deploy to Production

#### Option A: Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to Cloudflare when you push to `main`.

**Setup GitHub Secrets:**

1. Go to your repository on GitHub → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN`: Create at [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) with "Edit Cloudflare Workers" permissions
   - `CLOUDFLARE_ACCOUNT_ID`: Find in the Cloudflare dashboard URL or Workers overview page

Once configured, every push to `main` will automatically:
1. Build the shared package
2. Build the web frontend
3. Deploy to Cloudflare Workers

#### Option B: Manual Deployment

Kivo deploys as a single Cloudflare Worker with static assets:

```bash
npm run deploy
```

This command will:
1. Build the shared package
2. Build the web frontend to `apps/web/dist`
3. Deploy the combined worker (API + static assets) to Cloudflare

Your app will be available at: `https://kivo.<your-subdomain>.workers.dev`

**Update production environment variables** in `apps/api/wrangler.jsonc`:
```jsonc
"vars": {
  "ENVIRONMENT": "production",
  "FRONTEND_URL": "https://kivo.<your-subdomain>.workers.dev",
  "API_URL": "https://kivo.<your-subdomain>.workers.dev",
  "FROM_EMAIL": "your-verified-email@domain.com"
}
```

## Environment Variables

### API (Cloudflare Workers)

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret for signing JWT tokens |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CF_ACCOUNT_ID` | Cloudflare account ID (for Browser Rendering API) |
| `CF_API_TOKEN` | Cloudflare API token with Browser Rendering permissions |
| `FRONTEND_URL` | Frontend URL (for CORS and email links) |
| `API_URL` | API URL (for generating links) |

### Web (Frontend)

The frontend proxies API requests to `/api` in development. In production, both frontend and API are served from the same worker, so no additional configuration is needed.

## Demo Flow

1. **Sign Up**: Enter your email to receive a magic link
2. **Verify**: Click the link in your email to authenticate
3. **Settings**: Configure your business profile and defaults
4. **Create Client**: Add your first client with contact details
5. **Create Invoice**: Generate an invoice with line items
6. **Send Invoice**: Send via email to your client
7. **Client View**: Client opens the public link, views invoice
8. **Payment**: Client pays via Stripe Checkout
9. **Confirmation**: Both parties receive email confirmations

## Testing

```bash
# Run all tests
npm test

# Run shared package tests
npm test -w packages/shared
```

## License

MIT
