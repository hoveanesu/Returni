# RETURNi: Database Schema (PostgreSQL / Supabase)

Principles: UUID primary keys, `created_at` on everything, money as integer cents (USD only), ledgers are insert-only, Row Level Security on all tables.

```sql
-- ENUMS
create type user_role as enum ('customer','merchant_owner','merchant_staff','admin');
create type merchant_status as enum ('pending','active','suspended');
create type ledger_type as enum ('earn','redeem','expire','adjust','reverse');
create type redemption_status as enum ('pending','fulfilled','cancelled','expired');
create type msg_status as enum ('queued','sent','delivered','read','failed');
create type draw_status as enum ('open','closed','drawn','published');
create type prize_status as enum ('pending','sent','claimed');
create type entry_status as enum ('pending','active','expired');

-- PEOPLE
create table profiles (
  id uuid primary key references auth.users(id),
  role user_role not null,
  full_name text,
  email text,
  phone text,
  created_at timestamptz default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,            -- E.164, e.g. +263...
  profile_id uuid references profiles(id),
  display_name text,
  registered_at timestamptz,             -- null = WhatsApp only, no account yet
  signup_source text,                    -- 'receipt_link','qr','whatsapp'
  whatsapp_opt_in boolean default false,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  created_at timestamptz default now()
);

-- MERCHANTS
create table merchants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  business_name text not null,
  city text,
  address text,
  phone text,
  status merchant_status default 'pending',
  backpay_rate_bps int not null,         -- set by merchant, within admin min and max (basis points)
  backpay_expiry_days int not null,      -- set by merchant, within admin min and max
  created_at timestamptz default now()
);

create table merchant_staff (
  merchant_id uuid references merchants(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (merchant_id, profile_id)
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  amount_cents int not null,             -- planning default 1500
  period_start date not null,
  period_end date not null,
  paid_at timestamptz,
  payment_ref text,
  confirmed_by uuid references profiles(id)
);

-- RECEIPTS
create table receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text unique not null,
  merchant_id uuid references merchants(id),
  customer_id uuid references customers(id),
  recorded_by uuid references profiles(id),
  total_cents int not null check (total_cents > 0),
  items jsonb,                           -- optional line items
  idempotency_key text unique,
  backpay_earned_cents int default 0,
  entries_earned int default 0,
  created_at timestamptz default now()
);

-- BACKPAY LEDGER (insert-only)
create table backpay_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  merchant_id uuid references merchants(id),
  type ledger_type not null,
  amount_cents int not null,             -- positive credit, negative debit
  receipt_id uuid references receipts(id),
  redemption_id uuid,
  note text,
  expires_at timestamptz,                -- stamped from the merchant's expiry days when earned
  created_at timestamptz default now()
);
-- BackPay is per merchant (earned and redeemed at the issuing merchant)
create view customer_backpay_balance as
  select customer_id, merchant_id, sum(amount_cents) as balance_cents
  from backpay_ledger group by customer_id, merchant_id;

-- RETURNI PRICES
create table offers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  title text not null,
  description text,
  original_price_cents int not null,
  returni_price_cents int not null,
  backpay_cost_cents int not null,
  stock int,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

create table redemptions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id),
  customer_id uuid references customers(id),
  merchant_id uuid references merchants(id),
  code text unique not null,
  status redemption_status default 'pending',
  expires_at timestamptz,
  fulfilled_at timestamptz,
  created_at timestamptz default now()
);

-- GOLD DROP
create table gold_drops (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  status draw_status default 'open',
  seed text,
  drawn_at timestamptz,
  prize_pool_cents int
);

create table gold_drop_entries (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid references gold_drops(id),
  customer_id uuid references customers(id),
  receipt_id uuid references receipts(id),
  status entry_status default 'pending', -- active only if the customer has an account
  activated_at timestamptz,
  claim_by timestamptz,                  -- pending entries expire if no sign-up by then
  created_at timestamptz default now()
);

create table gold_drop_winners (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid references gold_drops(id),
  customer_id uuid references customers(id),
  prize text not null,                   -- e.g. airtime voucher
  prize_value_cents int,
  status prize_status default 'pending',
  notified_at timestamptz
);

-- SIGN-UP LINKS (adoption)
create table signup_links (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  receipt_id uuid references receipts(id),
  token_hash text unique not null,       -- store a hash, never the raw token
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- WHATSAPP
create table whatsapp_sessions (
  customer_id uuid primary key references customers(id),
  state text,
  context jsonb,
  last_inbound_at timestamptz
);

create table whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  direction text check (direction in ('in','out')),
  template text,
  body jsonb,
  provider_id text,
  status msg_status default 'queued',
  attempts int default 0,
  error text,
  created_at timestamptz default now()
);

-- CONFIG AND AUDIT
create table config (
  key text primary key,
  value jsonb not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);
```

## Seed config keys
`subscription_price_cents` (1500), `backpay_pool_pct` (5), `gold_drop_pool_pct` (20), `backpay_rate_min_bps`, `backpay_rate_max_bps`, `backpay_expiry_min_days`, `backpay_expiry_max_days`, `entries_per_purchase`, `min_purchase_for_entry_cents`, `pending_entries_claim_days` (14), `signup_link_ttl_days`.

## Indexes to add
`receipts(merchant_id, created_at)`, `receipts(customer_id)`, `backpay_ledger(customer_id)`, `gold_drop_entries(drop_id)`, `whatsapp_messages(status, created_at)`.

## RLS summary
- Customers read only rows with their `customer_id`.
- Merchants read and write only rows with their `merchant_id`.
- Admins have full access. Service role is used for WhatsApp webhooks and jobs.
