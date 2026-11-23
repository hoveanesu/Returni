# RETURNi: Business Logic

All numbers below are **defaults stored in the `config` table**. Nothing is hardcoded. Items marked **ASSUMPTION** need confirmation. All money is in **USD only**, stored as integer cents.

## 1. Revenue and pool planning
- Merchant subscription (planning): **US$15 per month**.
- From gross subscription revenue: **Gold Drop gets 20%**, **BackPay gets 5%**. The rest covers operations and margin.

Example with 100 merchants: revenue $1,500 per month, Gold Drop pool $300, BackPay pool $75.

Config keys: `subscription_price_cents`, `gold_drop_pool_pct`, `backpay_pool_pct`.

## 2. Smart Receipts
1. Merchant records a sale: amount and customer phone.
2. Phone normalised to E.164 (+263...). Find or create the customer.
3. Create receipt with unique number and idempotency key.
4. In one database transaction: create the receipt row, write the BackPay credit using the **merchant's percentage** with the **merchant's expiry date**, and create Gold Drop entries (`active` if the customer has an account, otherwise `pending`).
5. Queue the WhatsApp receipt with the customer's personal sign-up link (left out once they have an account). If the customer has not opted in, send only the permitted opt-in message or skip, and show the merchant that the customer has not consented.

## 3. BackPay
- **What it is:** a ledger balance, not cash, not airtime. It can only be used to access exclusive offers and RETURNi Prices.
- **Earning:** `earned = floor(total_cents * rate_bps / 10000)` where `rate_bps` is the **percentage set by the merchant**, within the admin's minimum and maximum. A change affects only future purchases.
- **Funding and liability:** BackPay is earned and redeemed at the issuing merchant (**ASSUMPTION**), so the merchant carries what they set. The platform tracks issued, redeemed, expired and outstanding BackPay per merchant. **Open question:** does the 5% BackPay pool still fund any part of it, or is it only a platform budget and cap?
- **Redeeming:** debit when the customer requests an offer. If the redemption expires or is cancelled, write a reversing credit.
- **Expiry:** the **merchant sets the expiry period** in days, within the admin's minimum and maximum. Each credit is stamped with `expires_at` when earned, so later changes don't affect existing credits. Oldest credits are used first. An expiry job writes negative ledger entries, and customers get a WhatsApp reminder before expiry.
- **Integrity:** never update or delete ledger rows. Corrections are `adjust` or `reverse` entries with a reason.

## 4. RETURNi Prices
- Merchant opts in voluntarily and creates offers with original price, RETURNi price and BackPay cost.
- Rules: RETURNi price must be lower than the original price. BackPay cost is at least 1 cent. Offers can have stock and date limits.
- Redemption flow: customer requests, system checks balance and stock, debits BackPay, creates a short code valid for a set time (default 48 hours). Merchant verifies the code at the counter and marks it fulfilled.
- The merchant carries the discount. RETURNi does not pay for it.

## 5. Gold Drop
- **Draw cycle:** weekly, Monday 00:00 to Sunday 23:59 (Africa/Harare).
- **Entries (ASSUMPTION):** 1 entry per qualifying purchase, where a purchase qualifies if it meets `min_purchase_for_entry_cents`. `entries_per_purchase` is configurable. **Only registered customers' entries count.** Entries from customers without an account stay `pending` until sign-up (see section 10).
- **Pilot prizes:** airtime vouchers.
- **Prize pool:** up to `gold_drop_pool_pct` of that period's subscription revenue.
- **Draw process:**
  1. Job closes the draw and freezes entries. Only `active` entries are in the draw.
  2. Admin runs the draw. System generates a seed, selects winners with a reproducible random method, stores the seed and result.
  3. Rules: a customer cannot win more than once per draw. Optionally exclude a merchant's staff and owners.
  4. Admin reviews, then publishes. Winners receive a WhatsApp message and claim instructions.
  5. Admin tracks prize status: pending, sent, claimed.
- **Fairness and law:** confirm with a local lawyer whether purchase-linked prize draws need a licence or notice in Zimbabwe, and publish the rules to customers.

## 6. Subscriptions
- Merchant is `pending` until admin approves. A merchant can record sales only while `active` and paid up.
- MVP: payments confirmed manually by admin. Later: payment gateway.
- Grace period (default 7 days) then merchant is suspended. Suspended merchants cannot record sales, and their offers are hidden.

## 7. WhatsApp rules
- Opt-in required before sending marketing or receipts. `STOP` opts out immediately.
- Use approved templates for business-initiated messages.
- Limit message volume per customer per day (default 5, **ASSUMPTION**).
- Retry failed sends with backoff, then flag for admin.

## 8. Fraud and abuse controls
- Rate limit sales per merchant per minute and per customer per day.
- Flag unusual patterns: many small sales to the same phone, sales just under the entry threshold, repeated redemptions.
- Staff cannot send receipts to their own number for rewards (**ASSUMPTION**).
- Merchant can reverse a sale within 24 hours. Reversal writes reversing ledger entries and removes Gold Drop entries.

## 9. Reporting
- Merchant: sales, receipts, repeat customer rate, sign-up rate, BackPay issued and redeemed, offers performance.
- Admin: platform revenue, pool balances, liabilities, churn, delivery rate.

## 10. Customer accounts and adoption
- **Goal:** turn WhatsApp-only shoppers into registered customers. An account is required to be in the Gold Drop draw.
- **Sign-up link:** one per customer, random token stored as a hash, expires after `signup_link_ttl_days`. Included in every receipt and BackPay message until the customer registers.
- **Registration:** phone number, WhatsApp OTP, terms and consent. No password in the MVP (**ASSUMPTION**).
- **Pending entries:** entries earned before sign-up are `pending` with a `claim_by` date (default 14 days). On sign-up, pending entries within the window become `active` in the current open draw. Entries that miss the window expire. They are never added to a draw that has already closed.
- **BackPay is not held back:** it accrues from the first purchase whether or not the customer has an account.
- **Reminders:** WhatsApp reminder before pending entries expire and before BackPay expires (respecting message limits and opt-out).
- **Counter prompts:** merchants can display a QR code that opens the sign-up page.
- **Metrics:** sign-up rate = registered customers divided by customers who received a receipt. Shown to merchants and admins.
- **Privacy:** collect only phone number and optional name. Keep consent records. Allow account deletion on request.
