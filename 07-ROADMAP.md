# RETURNi: Roadmap

Time estimates assume one builder using AI tools. Adjust as you learn.

## Phase 0: Setup (week 1)
- [ ] GitHub repository `Returni` and `docs/` in place
- [ ] Next.js, TypeScript, Tailwind project created
- [ ] Supabase project (staging) and environment variables
- [ ] Brand tokens added to Tailwind
- [ ] WhatsApp Business account and Meta developer app started (approval can take time)

## Phase 1: Foundation (weeks 2-3)
- [ ] Database migrations from `03-DATABASE_SCHEMA.md`
- [ ] Auth with roles (merchant, admin) and RLS policies
- [ ] Config table and admin config page
- [ ] Merchant sign up and admin approval

## Phase 2: Sales and receipts (weeks 4-5)
- [ ] Merchant BackPay settings (percentage and expiry within admin limits)
- [ ] Record sale screen and API (idempotent)
- [ ] Receipts, BackPay ledger, Gold Drop entries in one transaction
- [ ] WhatsApp outbound: template, queue, sender, delivery status
- [ ] Merchant overview page

## Phase 3: WhatsApp customer experience (weeks 6-7)
- [ ] Inbound webhook with signature check
- [ ] Commands: BALANCE, OFFERS, RECEIPTS, HELP, STOP/START
- [ ] Sessions for multi-step flows
- [ ] Sign-up link generation and sign-up landing page
- [ ] Customer account creation with WhatsApp OTP, consent and terms
- [ ] Pending entries activation and reminder job
- [ ] Customer OTP login and customer dashboard (BackPay per merchant with expiry dates)
- [ ] Optional QR code for merchants

## Phase 4: RETURNi Prices (week 8)
- [ ] Merchant offers management
- [ ] Redemption flow (WhatsApp and dashboard)
- [ ] Merchant code verification

## Phase 5: Gold Drop (weeks 9-10)
- [ ] Weekly close job and draw function with logged seed
- [ ] Admin review, publish, winner notifications
- [ ] Prize tracking

## Phase 6: Admin and hardening (weeks 11-12)
- [ ] Admin overview, messages log, audit log, ledger adjustments
- [ ] Subscription tracking and reminders
- [ ] Fraud flags and rate limits
- [ ] Tests for money paths (BackPay, draws, redemptions)
- [ ] Security review

## Phase 7: Pilot launch (weeks 13-16)
- [ ] 5 to 10 pilot merchants in one city
- [ ] Production environment and monitoring
- [ ] Customer support process
- [ ] Review metrics weekly and fix top issues

## After the pilot
Payment gateway, Shona and Ndebele, more prize types, merchant analytics, loyalty tiers, expansion to other countries and currencies.

## Risks
| Risk | Mitigation |
|---|---|
| WhatsApp template approval delays | Apply early, keep SMS or link fallback |
| BackPay liability exceeds pool | Monitor, cap rates, expiry rules |
| Gold Drop legal requirements | Check licensing before pilot |
| Merchant adoption | Make recording a sale under 10 seconds, give simple training |
| Low customer sign-up rate | Sign-up link in every message, QR at the counter, reminders, track sign-up rate per merchant |
| Data protection | Consent, minimal data, clear privacy policy |
