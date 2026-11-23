# RETURNi: UI/UX Guide

## 1. Principles
- Mobile first. Most merchants and customers use phones, often on slow data.
- Recording a sale takes under 10 seconds.
- Customers never need an app: WhatsApp does the job.
- Plain language, large touch targets, minimal typing.
- All amounts shown in USD ($).

## 2. Brand tokens
| Token | Value |
|---|---|
| Primary (green) | #2F7D32 |
| Navy | #191A2E |
| Blue | #0B3B7E |
| Background | #F8FAF9 |
| Surface | #FFFFFF |
| Surface secondary | #E7EEEF |
| Sage | #BBCBBF |
| Text secondary | #5D5E6C |

Tailwind config suggestion:
```js
colors: {
  brand: { green: '#2F7D32', navy: '#191A2E', blue: '#0B3B7E' },
  surface: { DEFAULT: '#FFFFFF', alt: '#E7EEEF' },
  app: '#F8FAF9', sage: '#BBCBBF', muted: '#5D5E6C'
}
```
Use green for primary actions, navy for text and headers, blue for links and info. Meet WCAG AA contrast. Font: system sans or Inter. Logo: green and blue arrow swirl with navy RETURNi wordmark.

## 3. Customer experience (WhatsApp)
### Smart Receipt message (template)
```
Thank you for shopping at {{merchant}}!
Receipt {{receipt_no}} · {{date}}
Total: ${{total}}
You earned ${{backpay}} BackPay and {{entries}} Gold Drop entry.
Balance: ${{balance}} (expires {{expiry_date}})
Create your free account to enter this week's Gold Drop: {{signup_link}}
Reply OFFERS to see RETURNi Prices or BALANCE any time.
```
### Conversation menu
Reply with a word or number: 1 Balance, 2 Offers, 3 Receipts, 4 Gold Drop, 5 Help. Use WhatsApp quick-reply buttons where available. Keep messages short. Always include a way to stop (`STOP`).

## 4. Customer account and dashboard (mobile first)
Created through the sign-up link. Later logins use a phone OTP sent on WhatsApp.

### Sign-up page (from the link)
- Headline: "Enter this week's Gold Drop". Shows masked phone, BackPay balance and "3 entries waiting".
- Steps: confirm phone, enter WhatsApp OTP, accept terms and consent, done. Aim for under a minute and three screens.
- Success state: entries activated, next draw countdown, button to see offers.
- Link expired state: ask for phone number and resend.

### Dashboard
- **Home:** BackPay balance card, this week's Gold Drop entries, next draw countdown.
- **Offers:** cards with original price (struck through), RETURNi price, BackPay cost, Redeem button.
- **Receipts:** list with merchant and total.
- **Gold Drop:** entries and past winners.
- **Settings:** language, WhatsApp opt out.

## 5. Merchant dashboard
Left nav on desktop, bottom nav on mobile.
- **Record sale (home):** phone number field, amount field, consent checkbox, big green "Send receipt" button, success state with BackPay earned.
- **Overview:** sales today and this week, receipts, repeat customer %, sign-up rate, BackPay issued and redeemed.
- **BackPay settings:** set percentage and expiry days, with a live preview ("Customer spends $10 and earns $0.30, valid for 60 days"). Limits shown from admin settings.
- **Offers:** create and pause RETURNi Prices.
- **Redeem code:** single input, shows offer and customer, Confirm button.
- **Receipts:** searchable list.
- **Subscription:** status, due date, payment history.
- **Staff:** add cashier accounts.

## 6. Admin dashboard
- **Overview:** merchants, receipts, BackPay liability, Gold Drop pool, message delivery rate.
- **Merchants:** approve or suspend, subscription status.
- **Config:** editable rates and splits, plus the minimum and maximum BackPay percentage and expiry merchants may choose, with change history.
- **Gold Drop:** run draw, review winners, mark prizes sent.
- **Messages:** WhatsApp delivery log with failures and retry.
- **Audit log and adjustments.**

## 7. Key screens checklist
Landing, customer sign-up (from link), BackPay settings, merchant sign up, merchant login, record sale, offers, redeem code, merchant overview, customer login (OTP), customer home, admin login, admin overview, config, Gold Drop management.

## 8. States and edge cases
Empty states with a helpful next step, loading skeletons, offline or slow network messages, form errors in plain words, confirmation before irreversible actions (draw, suspend).

## 9. Accessibility and language
Labels on all fields, keyboard friendly, readable text size. Build with translations in mind (English first; Shona and Ndebele later).
