import type { Customer, Offer, Product, Transaction } from "./types";

// SAMPLE DATA ONLY. Replaced by database values later.
export const LIMITS = {
  rateMinPct: 1,
  rateMaxPct: 10,
  expiryMinDays: 30,
  expiryMaxDays: 180,
};

export const MOCK_MERCHANT = {
  name: "Demo Store",
  branch: "Harare CBD",
  ratePct: 3,
  expiryDays: 60,
};

// Merchant-configurable rules. Calculation code reads these, never hardcodes them.
export const BACKPAY_RULES = {
  ratePct: MOCK_MERCHANT.ratePct,
  minPurchaseCents: 100,
  maxRewardCents: 500,
  expiryDays: MOCK_MERCHANT.expiryDays,
  goldDropMinCents: 100,
};

export const PAYMENT_METHODS = ["Cash", "EcoCash", "Card", "Bank transfer", "Other"];

export const CATALOG: Product[] = [
  { id: "p-oil", name: "Cooking Oil 2L", category: "Groceries", priceCents: 500 },
  { id: "p-rice", name: "Rice 5kg", category: "Groceries", priceCents: 1000 },
  { id: "p-sugar", name: "Sugar 2kg", category: "Groceries", priceCents: 300 },
  { id: "p-bread", name: "Bread", category: "Bakery", priceCents: 100 },
  { id: "p-wash", name: "Washing Powder 1kg", category: "Household", priceCents: 400 },
  { id: "p-hair", name: "Haircut", category: "Services", priceCents: 800 },
];

// RETURNi Prices. BackPay cost differs per offer (set by the merchant).
export const OFFERS: Offer[] = [
  { id: "of-oil", name: "Cooking Oil 2L", standardCents: 500, returniCents: 450, backpayCostCents: 100, active: true },
  { id: "of-rice", name: "Rice 5kg", standardCents: 1000, returniCents: 875, backpayCostCents: 150, active: true },
  { id: "of-wash", name: "Washing Powder 1kg", standardCents: 400, returniCents: 350, backpayCostCents: 300, active: true },
  { id: "of-hair", name: "Haircut", standardCents: 800, returniCents: 600, backpayCostCents: 500, active: true },
  { id: "of-sugar", name: "Sugar 2kg", standardCents: 300, returniCents: 260, backpayCostCents: 120, active: false },
];

export const CUSTOMERS: Customer[] = [
  { phone: "+263771234567", name: "Anesu Hove", registered: true, backpayCents: 610, purchases: 12, totalSpendCents: 8650 },
  { phone: "+263779876543", name: "Tendai Moyo", registered: true, backpayCents: 210, purchases: 8, totalSpendCents: 5230 },
  { phone: "+263775551234", name: "Precious Chikwanha", registered: true, backpayCents: 675, purchases: 15, totalSpendCents: 11000 },
  { phone: "+263774449876", name: "Joseph Makoni", registered: false, backpayCents: 120, purchases: 6, totalSpendCents: 3420 },
];

// Demo redemption codes (a customer can show their code instead of a number)
export const DEMO_CODES: Record<string, string> = {
  "BP-7X2K-9F": "+263771234567",
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    key: "seed-123", receiptNo: "R-000123", ref: "TRX-20261123-001",
    phone: "+263771234567", customerName: "Anesu Hove", registered: true,
    items: [
      { id: "s1", name: "Cooking Oil 2L", category: "Groceries", qty: 1, unitCents: 500 },
      { id: "s2", name: "Rice 5kg", category: "Groceries", qty: 2, unitCents: 1000 },
    ],
    subtotalCents: 2500, discountCents: 0, totalCents: 2500, method: "Cash",
    backpayEarnedCents: 75, backpayRedeemedCents: 0, balanceAfterCents: 610,
    redemptionRefs: [], goldDropEntry: "active",
    expiresAt: "2027-01-22T08:42:00.000Z", createdAt: "2026-11-23T08:42:00.000Z", status: "Completed",
  },
  {
    key: "seed-122", receiptNo: "R-000122", ref: "TRX-20261123-002",
    phone: "+263774449876", customerName: "Joseph Makoni", registered: false,
    items: [
      { id: "s3", name: "Bread", category: "Bakery", qty: 2, unitCents: 100 },
      { id: "s4", name: "Sugar 2kg", category: "Groceries", qty: 1, unitCents: 300 },
    ],
    subtotalCents: 500, discountCents: 0, totalCents: 500, method: "EcoCash",
    backpayEarnedCents: 15, backpayRedeemedCents: 0, balanceAfterCents: 120,
    redemptionRefs: [], goldDropEntry: "pending",
    expiresAt: "2027-01-22T07:15:00.000Z", createdAt: "2026-11-23T07:15:00.000Z", status: "Completed",
  },
  {
    key: "seed-121", receiptNo: "R-000121", ref: "TRX-20261122-005",
    phone: "+263779876543", customerName: "Tendai Moyo", registered: true,
    items: [{ id: "s5", name: "Haircut", category: "Services", qty: 1, unitCents: 800 }],
    subtotalCents: 800, discountCents: 0, totalCents: 800, method: "Card",
    backpayEarnedCents: 24, backpayRedeemedCents: 0, balanceAfterCents: 210,
    redemptionRefs: [], goldDropEntry: "active",
    expiresAt: "2027-01-21T14:05:00.000Z", createdAt: "2026-11-22T14:05:00.000Z", status: "Completed",
  },
  {
    key: "seed-120", receiptNo: "R-000120", ref: "TRX-20261122-004",
    phone: "+263775551234", customerName: "Precious Chikwanha", registered: true,
    items: [
      { id: "s6", name: "Washing Powder 1kg", category: "Household", qty: 1, unitCents: 400 },
      { id: "s7", name: "Cooking Oil 2L", category: "Groceries", qty: 1, unitCents: 500 },
    ],
    subtotalCents: 900, discountCents: 50, totalCents: 850, method: "Cash",
    backpayEarnedCents: 25, backpayRedeemedCents: 0, balanceAfterCents: 675,
    redemptionRefs: [], goldDropEntry: "active",
    expiresAt: "2027-01-21T10:20:00.000Z", createdAt: "2026-11-22T10:20:00.000Z", status: "Reversed",
  },
];

// Used by the Analytics and BackPay sample pages (upgraded in later stages)
export const MOCK_STATS = [
  { label: "Sales today", value: "$184.50" },
  { label: "Receipts today", value: "23" },
  { label: "Repeat customers", value: "38%" },
  { label: "Sign-up rate", value: "41%" },
  { label: "BackPay issued", value: "$42.10" },
  { label: "BackPay redeemed", value: "$12.40" },
];

export const MOCK_RECEIPTS = [
  { no: "R-000123", phone: "+26377 *** 567", totalCents: 2500, backpayCents: 75, registered: true, time: "10:42" },
  { no: "R-000122", phone: "+26371 *** 904", totalCents: 1200, backpayCents: 36, registered: false, time: "10:15" },
  { no: "R-000121", phone: "+26378 *** 221", totalCents: 4800, backpayCents: 144, registered: true, time: "09:58" },
  { no: "R-000120", phone: "+26373 *** 618", totalCents: 650, backpayCents: 19, registered: false, time: "09:30" },
];