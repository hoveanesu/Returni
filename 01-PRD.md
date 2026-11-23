# RETURNi: Product Requirements Document

**Tagline:** Every Purchase Deserves More
**Launch market:** Zimbabwe (design so it can expand across Africa)
**Status:** Draft v1. Items marked **ASSUMPTION** need your confirmation.

## 1. Vision
RETURNi is a customer growth, rewards and retention platform. Merchants pay a monthly subscription. Customers get a Smart Receipt on WhatsApp for every purchase, earn BackPay, unlock RETURNi Prices, and are entered into the weekly Gold Drop. The aim: give customers a reason to come back and give merchants measurable repeat business.

## 2. The customer loop
Buy -> Smart Receipt (WhatsApp) -> earn BackPay -> unlock RETURNi Prices -> enter Gold Drop -> return

## 3. Users and roles
| Role | Who | Main channel |
|---|---|---|
| Customer | Shopper | **WhatsApp** for receipts and quick commands, plus a **registered customer account** (web dashboard). An account is required to enter Gold Drop |
| Merchant | Shop owner or cashier | Merchant web dashboard (mobile-friendly) |
| Admin | RETURNi team | Admin web dashboard |

## 4. Core modules
1. **Smart Receipts:** WhatsApp-first digital receipt sent after each purchase.
2. **BackPay:** ledger-based percentage rewards (not airtime, not real cashback). **Each merchant sets their own BackPay percentage and expiry period**, within limits set by RETURNi. Customers redeem BackPay to access exclusive offers and RETURNi Prices.
3. **RETURNi Prices:** voluntary merchant discounts versus the original price, unlocked with BackPay.
4. **Gold Drop:** weekly purchase-linked prize draw. Pilot prizes are airtime vouchers. Each qualifying purchase adds entries. **Only customers with a registered account can be entered.**
5. **Dashboards:** customer, merchant and admin.
6. **Customer Accounts and Adoption:** a sign-up link on every Smart Receipt and BackPay message that drives customers to create an account and unlock Gold Drop.

## 4.1 Customer accounts and adoption
Customers can use WhatsApp alone, but a **registered customer account** unlocks the full benefit. This is the main adoption mechanism.
- Every Smart Receipt and BackPay message includes a short personal **sign-up link**.
- The link opens a mobile page with the phone number prefilled. The customer verifies with a WhatsApp OTP, accepts terms and consent, and is registered in under a minute.
- **Gold Drop requires an account.** Customers without one see a message such as "You have 3 entries waiting. Sign up to enter this week's draw."
- Entries earned before sign-up are held as **pending** and activated when the customer signs up within the claim window (**ASSUMPTION**: 14 days).
- BackPay accrues from the very first purchase, so customers feel the value before they register.
- Account benefits: BackPay balance per merchant with expiry dates, offers, receipt history, Gold Drop entries and results.
- Adoption tactics: reminder before pending entries expire, a prompt at the point of sale, an optional QR code at the counter that opens the sign-up page, and a sign-up rate shown on the merchant dashboard.

## 5. User stories
### Customer (WhatsApp first)
- As a customer, I give my phone number at checkout and receive a Smart Receipt on WhatsApp without installing anything.
- I can message the RETURNi WhatsApp number to see my BackPay balance, active offers, Gold Drop entries and past receipts.
- I can redeem BackPay for a RETURNi Price at a participating merchant.
- I get notified when I win Gold Drop.
- I can tap the sign-up link in my receipt to create a free account and enter the Gold Drop draw.
- I can see my BackPay per merchant and when each amount expires.
- I am reminded before my BackPay or pending entries expire.
- I can opt out at any time by replying STOP.

### Merchant
- I can sign up, subscribe and add my shop and staff.
- I can record a sale (amount, items optional, customer phone) in seconds.
- I can set my own BackPay percentage and expiry period (within RETURNi's limits).
- I can create and pause RETURNi Prices offers.
- I can see how many of my customers have created accounts.
- I can see repeat customers, sales, BackPay issued and redeemed, and my subscription status.

### Admin
- I can approve or suspend merchants, and see platform-wide metrics.
- I can edit all rates and splits (nothing hardcoded), including the minimum and maximum BackPay percentage and expiry that merchants may choose.
- I can run, review and audit the weekly Gold Drop and manage prize fulfilment.
- I can monitor WhatsApp delivery and handle disputes and fraud flags.

## 6. Functional requirements
### Smart Receipts
- Created when a merchant records a sale. Contains merchant, date, items or total, receipt number, BackPay earned and its expiry date, Gold Drop entries earned, and a **personal sign-up link** (left out once the customer has an account).
- Delivered by WhatsApp using an approved template message. Fallback: SMS or a public receipt link (**ASSUMPTION**).
- Customer identified by phone number in international format (+263...).

### BackPay
- Credits and debits recorded in an append-only ledger. Balance is the sum of entries.
- **The merchant sets the percentage** (within admin minimum and maximum).
- **The merchant sets the expiry period** in days (within admin limits). The expiry date is stamped on each credit when it is earned.
- BackPay is earned and redeemed at the merchant that issued it (**ASSUMPTION**).
- Redemption unlocks RETURNi Prices. No cash out.

### RETURNi Prices
- Merchant sets item or offer, original price, RETURNi price, BackPay cost, validity, stock limit.
- Customer redeems via WhatsApp code or dashboard. Merchant confirms with a code.

### Gold Drop
- Weekly draw. Entries created by qualifying purchases. Entries are **active** only for customers with a registered account. Entries from customers without one are **pending** until sign-up.
- Draw is random, seeded and logged so it can be audited.
- Pilot prizes: airtime vouchers.

### Subscriptions
- Planning price: US$15 per merchant per month, editable.

## 7. Non-functional requirements
- Works on low bandwidth and low-end phones (WhatsApp, mobile-first web).
- Money, points and entries are never edited in place. Ledgers only.
- Full audit log for admin and money-related actions.
- Consent and opt-out for WhatsApp messaging. Protect personal data and comply with Zimbabwe data protection law (**confirm with a local lawyer**).
- Timezone: Africa/Harare. Currency: **USD only**.

## 8. Success metrics
Active merchants, sign-up conversion (receipts to registered accounts), receipts per merchant per week, % of customers who return within 14 days, BackPay redemption rate, WhatsApp delivery rate, Gold Drop participation, monthly merchant churn.

## 9. MVP scope
**In:** merchant, customer (WhatsApp plus registered account and dashboard) and admin dashboards; sign-up links on receipts; Smart Receipts; BackPay ledger; RETURNi Prices; Gold Drop; subscription tracking (manual payment confirmation).
**Out for now:** native mobile app, multi-country, automated payment gateway, advanced analytics.

## 10. Open questions
1. Which payment methods will merchants use to pay subscriptions?
2. Who funds merchant-set BackPay: the merchant (redeemed at their shop) or the platform pool? What minimum and maximum percentage and expiry should merchants be allowed?
3. How are Gold Drop entries earned (per purchase, or per amount spent)?
4. Which WhatsApp provider: Meta Cloud API directly or a local reseller?
5. Sign-up is assumed to be phone number plus WhatsApp OTP. Is email or a password also needed?

## 11. Brand
Green #2F7D32, Navy #191A2E, Blue #0B3B7E, Background #F8FAF9, Surface #FFFFFF, Surface secondary #E7EEEF, Sage #BBCBBF, Text secondary #5D5E6C. Logo: green and blue arrow swirl with navy RETURNi wordmark.
