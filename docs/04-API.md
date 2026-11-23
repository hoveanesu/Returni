# RETURNi: API Specification

Base URL: `/api`. JSON in and out. Auth by Supabase session (web) or service credentials (webhooks and jobs). Errors: `{ "error": { "code": "...", "message": "..." } }`.

## Auth and profile
| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | /auth/merchant/signup | public | Create merchant account and pending business |
| POST | /auth/otp/request | customer | Send OTP to customer's WhatsApp |
| POST | /auth/otp/verify | customer | Verify OTP, start session |
| GET | /join/:token | public | Resolve a sign-up link (masked phone, pending entries, BackPay balance) |
| POST | /join/:token/complete | public | Finish sign-up after OTP: name, terms, consent. Activates pending entries |
| GET | /join | public | Generic sign-up page (from QR code), asks for phone number |
| GET | /me | any | Current profile and role |

## Merchant
| Method | Path | Purpose |
|---|---|---|
| GET | /merchant/overview | Sales, receipts, repeat rate, sign-up rate, BackPay issued and redeemed |
| POST | /merchant/sales | Record a sale (creates receipt, BackPay, entries, WhatsApp) |
| GET | /merchant/receipts | List receipts (filter by date, phone) |
| GET/PUT | /merchant/backpay-settings | View or set BackPay percentage and expiry days (within admin limits) |
| GET/POST | /merchant/offers | List or create RETURNi Prices offers |
| PATCH | /merchant/offers/:id | Edit, pause, resume |
| POST | /merchant/redemptions/verify | Confirm a customer's redemption code |
| GET | /merchant/subscription | Status and payment history |
| GET/POST | /merchant/staff | List or add staff |

### POST /merchant/sales
```json
{
  "customer_phone": "+263771234567",
  "total_cents": 2500,
  "items": [{ "name": "Bread", "qty": 2, "price_cents": 100 }],
  "whatsapp_consent": true,
  "idempotency_key": "uuid"
}
```
Response `201`:
```json
{ "receipt_id": "...", "receipt_no": "R-000123", "backpay_earned_cents": 25, "backpay_expires_at": "2027-02-20", "entries_earned": 1, "entries_status": "pending", "signup_link": "https://returni.example/join/abc123", "message_status": "queued" }
```

## Customer (web dashboard)
| Method | Path | Purpose |
|---|---|---|
| GET | /customer/account | Profile and registration status |
| GET | /customer/summary | BackPay balance per merchant with expiry dates, active and pending entries, recent receipts |
| GET | /customer/receipts | Receipt history |
| GET | /customer/offers | Available RETURNi Prices |
| POST | /customer/redemptions | Redeem an offer (debits BackPay, returns code) |
| GET | /customer/gold-drop | Current entries and past results |
| POST | /customer/opt-out | Stop WhatsApp messages |

## Admin
| Method | Path | Purpose |
|---|---|---|
| GET | /admin/overview | Platform metrics |
| GET | /admin/merchants | List and filter |
| PATCH | /admin/merchants/:id | Approve, suspend |
| POST | /admin/subscriptions/:id/confirm | Mark payment received |
| GET/PUT | /admin/config | Read or update rates, splits and merchant BackPay limits (audited) |
| GET | /admin/gold-drops | List draws |
| POST | /admin/gold-drops/:id/draw | Run draw (logs seed) |
| POST | /admin/gold-drops/:id/publish | Publish winners, notify |
| PATCH | /admin/winners/:id | Update prize status |
| GET | /admin/messages | WhatsApp delivery log and failures |
| GET | /admin/audit | Audit log |
| POST | /admin/ledger/adjust | Manual BackPay adjustment (reason required) |

## WhatsApp webhooks
| Method | Path | Purpose |
|---|---|---|
| GET | /webhooks/whatsapp | Verification handshake |
| POST | /webhooks/whatsapp | Inbound messages and delivery statuses |

### Inbound commands
| Customer sends | Reply |
|---|---|
| `BALANCE` | BackPay balance with expiry dates and Gold Drop entries, plus the sign-up link if no account yet |
| `JOIN` | Sends the personal sign-up link |
| `OFFERS` | Active RETURNi Prices near them |
| `REDEEM <number>` | Redemption code for that offer |
| `RECEIPTS` | Last 5 receipts |
| `HELP` | Menu of commands |
| `STOP` / `START` | Opt out or back in |

## Jobs (internal)
- `POST /jobs/send-messages`: send queued messages, retry failures.
- `POST /jobs/gold-drop/close`: close the week's draw.
- `POST /jobs/expire-backpay`: write expiry ledger entries and send expiry reminders.
- `POST /jobs/pending-entries`: remind customers before pending entries expire, then expire unclaimed ones.
- `POST /jobs/subscription-reminders`: nudge merchants before due date.

## Standards
- Validate with Zod. Rate limit per IP and per user.
- Idempotency key required on `/merchant/sales`.
- Pagination: `?page=1&limit=20`.
- Verify WhatsApp signature on every webhook call.
