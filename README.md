# Kivo

<p align="center">
  <strong>Self-hosted invoicing for freelancers and small businesses</strong><br>
  One deployment. One business. Complete data ownership.
</p>

![Kivo Demo](screenshots/kivo.gif)

## What is Kivo?

Kivo is an open-source invoicing application designed for **business-to-customer workflows**. You deploy it once for your business, and it handles everything: clients, invoices, PDFs, emails, payment tracking, and automated reminders.

### Who is this for?

- **Freelancers** invoicing clients for project work
- **Consultants** billing for hours or deliverables
- **Small agencies** managing multiple client relationships
- **Any business** that sends invoices and wants to own their data

### Why self-hosted?

- **No monthly SaaS fees** — run it on Cloudflare's generous free tier
- **Your data stays yours** — invoices, client details, everything lives in your account
- **No multi-tenant complexity** — one database, one business, no shared anything
- **Open source** — modify, extend, audit the code

## Features

- **Client Management** — Create, edit, archive clients with full contact details
- **Invoice Lifecycle** — Draft → Send → View → Pay → Track. Full status history.
- **Real PDF Generation** — Professional invoices via Cloudflare Browser Rendering API, stored in R2
- **Email Delivery** — Send invoices, payment reminders, and receipts via Resend
- **Online Payments** — Stripe Checkout integration for card payments (optional)
- **Automatic Reminders** — Durable Objects schedule and send payment reminders
- **Dashboard** — Outstanding totals, monthly revenue, status breakdowns
- **Zero Friction** — Open the app and start. No signup, no user accounts.

## Architecture

Kivo is a single Cloudflare Worker with all code and frontend assets bundled together:

- **`/`** — React SPA (dashboard, clients, invoices, settings)
- **`/api/*`** — Hono API routes
- **`/health`** — Health check

**Data layer:**
- **D1** (SQLite) — Clients, invoices, items, events, payments, settings
- **R2** (Object Storage) — Generated PDFs, business logos
- **Durable Objects** — Reminder scheduling engine

## Setup Guide

This guide walks you through deploying Kivo for your business. You don't need to be a developer, but you should be comfortable running commands in a terminal.

### Prerequisites

You'll need accounts with these services (all have free tiers):

1. **[Cloudflare](https://dash.cloudflare.com/sign-up)** — Hosting, database, storage
2. **[Resend](https://resend.com)** — Sending invoice emails
3. **[Stripe](https://stripe.com)** — Online payments (optional)

Install these tools on your computer:

- [Node.js 18+](https://nodejs.org)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/):
  ```bash
  npm install -g wrangler
  ```

### Step 1: Clone the Repository

```bash
git clone https://github.com/lauragift21/kivo-self-hosted.git
cd kivo-self-hosted
npm install
```

### Step 2: Log in to Cloudflare

```bash
wrangler login
```

This opens a browser window to authenticate. Once done, you're connected to your Cloudflare account.

### Step 3: Create the Database

```bash
wrangler d1 create kivo-db
```

After creation, Wrangler prints a `database_id`. Copy it. Open `apps/api/wrangler.jsonc` and replace:

```jsonc
"database_id": "replace-with-your-database-id"
```

with the ID you just copied.

### Step 4: Create Storage for PDFs

```bash
wrangler r2 bucket create kivo-storage
```

### Step 5: Set Your Domain URL

In `apps/api/wrangler.jsonc`, update these fields with your actual domain:

```jsonc
"vars": {
  "ENVIRONMENT": "production",
  "FRONTEND_URL": "https://invoices.your-domain.com",
  "API_URL": "https://invoices.your-domain.com",
  "FROM_EMAIL": "billing@your-domain.com",
  "CF_ACCOUNT_ID": "your-cloudflare-account-id"
}
```

**If you don't have a custom domain yet**, use the default Workers URL format:
```jsonc
  "FRONTEND_URL": "https://kivo.YOUR-SUBDOMAIN.workers.dev",
  "API_URL": "https://kivo.YOUR-SUBDOMAIN.workers.dev",
```

You can see your account ID in the Cloudflare dashboard sidebar.

### Step 6: Set Secrets

Secrets are sensitive values that shouldn't be in code. Set them with Wrangler:

```bash
cd apps/api

# Required — Resend API key for sending emails
wrangler secret put RESEND_API_KEY
# (Paste your key from https://resend.com/api-keys)

# Optional — Stripe keys for online payments
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# Optional — Cloudflare API token for PDF generation
wrangler secret put CF_API_TOKEN
# (Create at https://dash.cloudflare.com/profile/api-tokens with "Browser Rendering" permission)
```

### Step 7: Set Up Email Sending (Resend)

1. Go to [Resend](https://resend.com) and create an account
2. Add and verify your domain (e.g., `your-domain.com`)
3. Create an API key with "Sending access"
4. Use that key for `RESEND_API_KEY` above
5. The `FROM_EMAIL` in `wrangler.jsonc` must match your verified domain

### Step 8: Run Database Migrations

This creates all the tables Kivo needs:

```bash
# Run in the project root
cd ../..  # if you're still in apps/api
npm run db:migrate -w apps/api
```

You should see: `Migrations applied successfully.`

### Step 9: Deploy

```bash
npm run deploy
```

This builds the frontend, bundles everything, and deploys to Cloudflare. It'll print a URL like:

```
https://kivo.YOUR-SUBDOMAIN.workers.dev
```

**You're live.**

### Step 10: First-Time Setup

Open your deployed URL in a browser. You'll land on the Dashboard.

1. Click **Settings** in the sidebar
2. Fill in:
   - **Business Name** — appears on invoices
   - **Business Email** — reply-to address
   - **Default Currency** — USD, EUR, GBP, etc.
   - **Invoice Prefix** — e.g., `INV` generates `INV-001`, `INV-002`
   - **Email From Name** — e.g., "Gift from Freelance Studio"
3. Upload your **Logo** (optional)
4. Save

That's it. No signup forms. No user accounts. Just start invoicing.

### Optional: Enable Online Payments (Stripe)

If you want clients to pay invoices by card:

1. Create a [Stripe account](https://stripe.com)
2. Get your **Secret Key** from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. Add it as `STRIPE_SECRET_KEY` (Step 6)
4. Go to **Developers → Webhooks** in Stripe
5. Add an endpoint:
   - **URL:** `https://your-domain.workers.dev/api/webhooks/stripe`
   - **Events:**
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `payment_intent.payment_failed`
6. Copy the **Webhook Secret** and set it as `STRIPE_WEBHOOK_SECRET` (Step 6)
7. Redeploy:
   ```bash
   npm run deploy
   ```

When you send an invoice, clients will see a "Pay Now" button that takes them to Stripe Checkout.

### Optional: Use a Custom Domain

Instead of the default `workers.dev` URL, you can use your own domain:

1. In Cloudflare Dashboard, go to **Workers & Pages**
2. Select your Kivo worker
3. Go to **Triggers → Custom Domains**
4. Add your domain (e.g., `invoices.your-domain.com`)
5. Update `FRONTEND_URL` and `API_URL` in `wrangler.jsonc`
6. Redeploy

## Updating Kivo

When a new version is released:

```bash
git pull origin main
npm install
npm run db:migrate -w apps/api  # if there are new migrations
npm run deploy
```

## Local Development

```bash
# Start both API and frontend locally
npm run dev
```

- API: http://localhost:8787
- Web: http://localhost:5173

Apply local database migrations:
```bash
npm run db:migrate:local -w apps/api
```

## Environment Variables Reference

| Secret | Required | Description |
|--------|----------|-------------|
| `RESEND_API_KEY` | Yes | Email delivery |
| `STRIPE_SECRET_KEY` | No | Online payments |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook verification |
| `CF_API_TOKEN` | No | PDF generation (falls back to HTML if not set) |

Public vars (in `wrangler.jsonc`):
| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Your app's URL |
| `API_URL` | Same as above |
| `FROM_EMAIL` | Verified sender domain in Resend |
| `CF_ACCOUNT_ID` | Cloudflare account ID |

## Data Ownership

Everything lives in your Cloudflare account:

| Data | Location |
|------|----------|
| Clients, invoices, settings | D1 (SQLite database) |
| PDFs, logos | R2 (object storage) |
| Reminder schedules | Durable Objects |

Delete the worker and the data is gone. Cloudflare has the data, but only in your account. No third-party SaaS has access.

## Troubleshooting

**Emails not sending?**
- Check that `FROM_EMAIL` uses your Resend-verified domain
- Verify `RESEND_API_KEY` is set with `wrangler secret list`
- Check Resend dashboard for delivery logs

**PDFs not generating?**
- `CF_API_TOKEN` is optional — without it, Kivo generates HTML instead of PDF
- To enable real PDFs, create an API token with "Browser Rendering" permission

**Stripe payments not working?**
- Verify webhook URL matches your deployed domain exactly
- Check Stripe Dashboard for failed webhook deliveries
- Ensure `STRIPE_SECRET_KEY` starts with `sk_test_` (test) or `sk_live_` (production)

**Database errors?**
- Run migrations: `npm run db:migrate -w apps/api`
- Check D1 database exists in Cloudflare Dashboard

## License

MIT
