// DEMO DATA ONLY. Replaced by database values when Supabase is connected.

export type Eligibility =
  | "All customers"
  | "Registered customers only"
  | "Frequent customers (10+ purchases)";

export const ELIGIBILITY: Eligibility[] = [
  "All customers",
  "Registered customers only",
  "Frequent customers (10+ purchases)",
];

export type Offer = {
  id: string;
  product: string;
  category: string;
  standardCents: number;
  returniCents: number;
  backpayCents: number; // BackPay used when a customer unlocks this price
  eligibility: Eligibility;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  limit: number | null; // null = no limit
  redeemed: number;
  active: boolean; // merchant's on/off switch
};

export type OfferStatus = "Active" | "Scheduled" | "Paused" | "Expired" | "Limit reached";

// A fixed "today" so the demo looks the same on the server and in the browser
export const TODAY = "2026-11-25";

export function statusOf(o: Offer): OfferStatus {
  if (o.end < TODAY) return "Expired";
  if (o.limit !== null && o.redeemed >= o.limit) return "Limit reached";
  if (!o.active) return "Paused";
  if (o.start > TODAY) return "Scheduled";
  return "Active";
}

export const discountPct = (o: Pick<Offer, "standardCents" | "returniCents">) =>
  Math.round((1 - o.returniCents / o.standardCents) * 1000) / 10;

export const CATALOGUE = [
  { name: "Cooking Oil 2L", category: "Groceries", priceCents: 500 },
  { name: "Rice 5kg", category: "Groceries", priceCents: 1000 },
  { name: "Sugar 2kg", category: "Groceries", priceCents: 300 },
  { name: "Bread", category: "Bakery", priceCents: 100 },
  { name: "Washing Powder 1kg", category: "Household", priceCents: 400 },
  { name: "Haircut", category: "Services", priceCents: 800 },
];

export const INITIAL_OFFERS: Offer[] = [
  { id: "o1", product: "Cooking Oil 2L", category: "Groceries", standardCents: 500, returniCents: 450, backpayCents: 100, eligibility: "All customers", start: "2026-11-01", end: "2026-11-30", limit: 100, redeemed: 38, active: true },
  { id: "o2", product: "Rice 5kg", category: "Groceries", standardCents: 1000, returniCents: 875, backpayCents: 150, eligibility: "Registered customers only", start: "2026-11-01", end: "2026-11-30", limit: 60, redeemed: 21, active: true },
  { id: "o3", product: "Sugar 2kg", category: "Groceries", standardCents: 300, returniCents: 260, backpayCents: 120, eligibility: "All customers", start: "2026-11-01", end: "2026-11-30", limit: null, redeemed: 14, active: true },
  { id: "o4", product: "Washing Powder 1kg", category: "Household", standardCents: 400, returniCents: 350, backpayCents: 200, eligibility: "Registered customers only", start: "2026-11-01", end: "2026-11-30", limit: 40, redeemed: 9, active: true },
  { id: "o5", product: "Bread", category: "Bakery", standardCents: 100, returniCents: 85, backpayCents: 50, eligibility: "All customers", start: "2026-11-01", end: "2026-11-30", limit: null, redeemed: 57, active: true },
  { id: "o6", product: "Haircut", category: "Services", standardCents: 800, returniCents: 600, backpayCents: 500, eligibility: "Frequent customers (10+ purchases)", start: "2026-11-15", end: "2026-12-31", limit: 25, redeemed: 4, active: true },
  { id: "o7", product: "Christmas Hamper", category: "Groceries", standardCents: 4500, returniCents: 3800, backpayCents: 600, eligibility: "All customers", start: "2026-12-01", end: "2026-12-24", limit: 30, redeemed: 0, active: true },
  { id: "o8", product: "School Stationery Pack", category: "Stationery", standardCents: 2000, returniCents: 1700, backpayCents: 300, eligibility: "All customers", start: "2026-09-01", end: "2026-10-15", limit: 50, redeemed: 31, active: true },
  { id: "o9", product: "Laundry Soap Bar", category: "Household", standardCents: 150, returniCents: 130, backpayCents: 40, eligibility: "All customers", start: "2026-11-01", end: "2026-11-30", limit: null, redeemed: 6, active: false },
  { id: "o10", product: "Fresh Milk 1L", category: "Groceries", standardCents: 200, returniCents: 170, backpayCents: 60, eligibility: "All customers", start: "2026-11-10", end: "2026-11-30", limit: 20, redeemed: 20, active: true },
];

export type RedemptionRow = {
  ref: string;
  customer: string;
  date: string;
  backpayCents: number;
};

const NAMES = ["Anesu Hove", "Tendai Moyo", "Precious Chikwanha", "Sharon Ncube", "Rudo Chigumba"];

// Deterministic sample history (real history comes from the BackPay ledger)
export function historyFor(o: Offer): RedemptionRow[] {
  const n = Math.min(5, o.redeemed);
  return Array.from({ length: n }, (_, i) => ({
    ref: `RDM-${(4000 + i * 37 + o.product.length * 11).toString(36).toUpperCase()}`,
    customer: NAMES[(i + o.product.length) % NAMES.length],
    date: `2026-11-${String(24 - i * 2).padStart(2, "0")}`,
    backpayCents: o.backpayCents,
  }));
}