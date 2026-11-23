# RETURNi: Architecture

## 1. Stack (candidate)
- **Frontend and server:** Next.js (App Router), TypeScript, Tailwind CSS
- **Database and auth:** Supabase (PostgreSQL, Row Level Security, Auth)
- **Messaging:** WhatsApp Business Platform (Cloud API)
- **Hosting:** Vercel (web), Supabase (data). Scheduled jobs via Supabase cron or Vercel Cron
- **Validation:** Zod. **Testing:** Vitest and Playwright

## 2. System overview
```
Customer (WhatsApp) <-> WhatsApp Cloud API <-> /api/webhooks/whatsapp ─┐
Merchant dashboard (web) ───────────────────────────────────────────────┤
Admin dashboard (web) ──────────────────────────────────────────────────┤
Customer dashboard (web, optional) ─────────────────────────────────────┤
                                                    Next.js API + services
                                                              │
                                        Supabase PostgreSQL (ledgers, RLS)
                                                              │
                                    Jobs: receipts queue, Gold Drop, expiry
```

## 3. Layers
1. **UI:** role-based dashboards under `/merchant`, `/admin`, `/me`.
2. **API routes:** thin controllers that validate input and call services.
3. **Services (business logic):** `receipts`, `accounts`, `backpay`, `prices`, `golddrop`, `subscriptions`, `whatsapp`, `config`.
4. **Data:** Postgres tables, views for balances, RLS for isolation.

## 4. WhatsApp integration (customer)
### Outbound
- Receipts and notifications use **approved template messages** (required outside the 24-hour customer-service window).
- A queue table (`outbound_messages`) holds pending messages. A worker sends them, stores the provider message ID and updates delivery status from webhooks. Failures retry with backoff.

### Inbound
- Webhook `POST /api/webhooks/whatsapp` verifies the signature, stores the message, then routes it to a conversation handler.
- Simple menu or keyword flows: `BALANCE`, `OFFERS`, `RECEIPTS`, `ENTRIES`, `HELP`, `STOP`.
- Conversation state stored in `whatsapp_sessions` so multi-step flows (such as redeeming an offer) work.

### Consent
- Opt-in captured at checkout (merchant records consent) or when the customer first messages the RETURNi number. `STOP` sets opt-out and blocks sends.

## 5. Authentication and roles
- **Merchant and admin:** email or phone login through Supabase Auth, with role stored in `profiles.role`.
- **Customer:** a customer record exists from the first purchase (by phone number). A **registered account** is created through the personal sign-up link, verified by a WhatsApp OTP. Later logins use the same OTP. WhatsApp inbound messages are already tied to the phone number.
- RLS ensures merchants see only their own data and customers only their own.

## 6. Key flows
### Record a sale
1. Merchant submits amount and customer phone.
2. Service creates `receipt`, finds or creates `customer`.
3. In one transaction the service writes the BackPay credit (merchant's percentage, merchant's expiry date stamped on it) and Gold Drop entries (`active` if the customer has an account, otherwise `pending`).
4. Receipt message with the personal sign-up link queued to WhatsApp.

### Redeem a RETURNi Price
1. Customer requests offer by WhatsApp or dashboard.
2. Service checks balance and stock, debits BackPay and creates a `redemption` with a short code.
3. Merchant enters the code. Redemption becomes `fulfilled`.

### Weekly Gold Drop
1. Scheduled job closes the week's entries. Only `active` entries are counted.
2. Draw function picks winners using a logged random seed.
3. Admin reviews, publishes winners and fulfils prizes. Winners are notified on WhatsApp.

## 6.1 Customer sign-up and activation
1. Each receipt and BackPay message carries a link such as `/join/<token>`. The token is random, stored hashed in `signup_links`, tied to the customer, and expires after a set number of days.
2. The page shows the phone number (masked), the count of pending entries and the BackPay balance, and asks the customer to confirm by OTP.
3. OTP is sent to the customer's WhatsApp. On success the system creates the auth user and profile, links it to the existing `customers` row, sets `registered_at`, and records consent.
4. Pending entries within the claim window become `active` in the current open draw.
5. Future receipts no longer include the sign-up link. A reminder job nudges customers who have pending entries about to expire.
6. An optional QR code at the merchant's counter opens a generic sign-up page where the customer enters their phone number.

## 7. Configuration
All rates, splits, prices and limits live in a `config` table, editable by admins, with history. No business constants in code.

## 8. Security
- Secrets in environment variables only. Never commit `.env`.
- Webhook signature verification, rate limiting, input validation.
- Ledger tables are insert-only. Corrections are reversing entries.
- Audit log for admin and money actions.
- Idempotency keys on sale creation to avoid duplicate receipts.

## 9. Folder structure
```
returni/
  docs/
  src/
    app/ (merchant, admin, me, api)
    services/
    lib/ (db, whatsapp, config, validation)
    components/
  supabase/ (migrations, seed)
  tests/
```

## 10. Environments
Local, staging, production. Separate Supabase projects and WhatsApp numbers for staging and production.
