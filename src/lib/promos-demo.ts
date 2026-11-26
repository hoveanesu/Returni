// DEMO DATA ONLY. Replaced by database values when Supabase is connected.

export type PromoType = "BackPay Boost" | "RETURNi Prices" | "Limited-time discount";
export const PROMO_TYPES: PromoType[] = ["BackPay Boost", "RETURNi Prices", "Limited-time discount"];

export type Audience = "All customers" | "New" | "Returning" | "Frequent" | "Inactive";
export const AUDIENCES: Audience[] = ["All customers", "New", "Returning", "Frequent", "Inactive"];

export type PromoStatus = "Draft" | "Scheduled" | "Active" | "Paused" | "Completed";

// A fixed "today" so the demo looks the same on the server and in the browser
export const TODAY = "2026-11-25";
export const BASE_RATE_PCT = 3; // this merchant's normal BackPay rate
export const MAX_RATE_PCT = 10; // platform limit

export type Promotion = {
  id: string;
  name: string;
  description: string;
  type: PromoType;
  boostPct: number | null;
  discountPct: number | null;
  products: string;
  audience: Audience;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  budgetCents: number;
  spentCents: number;
  message: string;
  draft: boolean;
  paused: boolean;
  reached: number;
  delivered: number;
  engaged: number;
  redemptions: number;
  repeatPurchases: number;
  salesCents: number;
};

export function statusOf(p: Promotion): PromoStatus {
  if (p.draft) return "Draft";
  if (p.paused) return "Paused";
  if (p.end < TODAY) return "Completed";
  if (p.start > TODAY) return "Scheduled";
  return "Active";
}

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: "pr1",
    name: "BackPay Boost",
    description: "Customers earn extra BackPay on every purchase this week.",
    type: "BackPay Boost",
    boostPct: 10,
    discountPct: null,
    products: "All products",
    audience: "All customers",
    start: "2026-11-20",
    end: "2026-11-30",
    budgetCents: 15000,
    spentCents: 3840,
    message: "Earn 10% BackPay on your next purchase at Demo Store until 30 Nov! Reply STOP to opt out.",
    draft: false,
    paused: false,
    reached: 24,
    delivered: 23,
    engaged: 16,
    redemptions: 11,
    repeatPurchases: 8,
    salesCents: 41260,
  },
  {
    id: "pr2",
    name: "Weekend Special",
    description: "Returning customers can unlock RETURNi Prices on selected groceries.",
    type: "RETURNi Prices",
    boostPct: null,
    discountPct: null,
    products: "Selected grocery items",
    audience: "Returning",
    start: "2026-11-21",
    end: "2026-11-30",
    budgetCents: 8000,
    spentCents: 2150,
    message: "Unlock exclusive RETURNi Prices on selected groceries at Demo Store until 30 Nov. Use your BackPay in store. Reply STOP to opt out.",
    draft: false,
    paused: false,
    reached: 10,
    delivered: 10,
    engaged: 7,
    redemptions: 5,
    repeatPurchases: 4,
    salesCents: 14600,
  },
  {
    id: "pr3",
    name: "Frequent Shopper Thank You",
    description: "A short-term discount for your most loyal customers.",
    type: "Limited-time discount",
    boostPct: null,
    discountPct: 8,
    products: "All products",
    audience: "Frequent",
    start: "2026-11-23",
    end: "2026-11-27",
    budgetCents: 6000,
    spentCents: 1420,
    message: "Thank you for shopping with us! Enjoy 8% off all products at Demo Store until 27 Nov. Reply STOP to opt out.",
    draft: false,
    paused: false,
    reached: 6,
    delivered: 6,
    engaged: 5,
    redemptions: 3,
    repeatPurchases: 3,
    salesCents: 9880,
  },
  {
    id: "pr4",
    name: "Christmas Hamper Early Bird",
    description: "Early access to RETURNi Prices on Christmas hampers.",
    type: "RETURNi Prices",
    boostPct: null,
    discountPct: null,
    products: "Christmas Hamper",
    audience: "All customers",
    start: "2026-12-01",
    end: "2026-12-24",
    budgetCents: 20000,
    spentCents: 0,
    message: "Christmas hampers are here! Unlock your RETURNi Price at Demo Store with your BackPay. Reply STOP to opt out.",
    draft: false,
    paused: false,
    reached: 0,
    delivered: 0,
    engaged: 0,
    redemptions: 0,
    repeatPurchases: 0,
    salesCents: 0,
  },
  {
    id: "pr5",
    name: "We Miss You",
    description: "A BackPay boost to bring back customers who haven't visited in 30+ days.",
    type: "BackPay Boost",
    boostPct: 8,
    discountPct: null,
    products: "All products",
    audience: "Inactive",
    start: "2026-11-01",
    end: "2026-11-15",
    budgetCents: 5000,
    spentCents: 3360,
    message: "We miss you at Demo Store! Earn 8% BackPay on your next visit until 15 Nov. Reply STOP to opt out.",
    draft: false,
    paused: false,
    reached: 4,
    delivered: 4,
    engaged: 2,
    redemptions: 2,
    repeatPurchases: 2,
    salesCents: 5820,
  },
  {
    id: "pr6",
    name: "New Customer Welcome",
    description: "A small welcome discount for first-time customers.",
    type: "Limited-time discount",
    boostPct: null,
    discountPct: 5,
    products: "All products",
    audience: "New",
    start: "2026-12-01",
    end: "2026-12-31",
    budgetCents: 4000,
    spentCents: 0,
    message: "Welcome to Demo Store! Enjoy 5% off your next visit. Reply STOP to opt out.",
    draft: true,
    paused: false,
    reached: 0,
    delivered: 0,
    engaged: 0,
    redemptions: 0,
    repeatPurchases: 0,
    salesCents: 0,
  },
];