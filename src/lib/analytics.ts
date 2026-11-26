import type { Store } from "./engine";
import type { Transaction } from "./types";

// Days are counted in Harare time, not the browser's time zone
const dayFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Harare",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const dayKey = (d: Date | string) => dayFmt.format(new Date(d)); // YYYY-MM-DD

function shiftKey(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export type DayPoint = {
  key: string;
  label: string; // DD/MM
  salesCents: number;
  count: number;
  repeatPct: number | null; // null = no data for that day
  newCustomers: number;
};

export type Analytics = {
  salesTodayCents: number;
  salesWeekCents: number;
  salesMonthCents: number;
  txMonth: number;
  avgTxCents: number;
  totalCustomers: number;
  newCustomers: number; // customers with 1 purchase
  returningCustomers: number; // customers with 2+ purchases
  repeatRatePct: number;
  backpayIssuedMonthCents: number;
  backpayRedeemedMonthCents: number;
  liabilityCents: number;
  redemptionsMonth: number;
  goldConfirmedMonth: number;
  goldHeldMonth: number;
  sampleTx: number;
  totalTx: number;
  days: DayPoint[];
};

export function computeAnalytics(store: Store, now: Date): Analytics {
  const today = dayKey(now);
  const dow = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  const weekStart = shiftKey(today, -((dow + 6) % 7)); // weeks start on Monday
  const month = today.slice(0, 7);

  type Row = { t: Transaction; day: string };
  const rows: Row[] = store.transactions
    .filter((t) => t.status === "Completed")
    .map((t) => ({ t, day: dayKey(t.createdAt) }));

  const sum = (r: Row[]) => r.reduce((s, x) => s + x.t.totalCents, 0);
  const todayRows = rows.filter((r) => r.day === today);
  const weekRows = rows.filter((r) => r.day >= weekStart && r.day <= today);
  const monthRows = rows.filter((r) => r.day.startsWith(month));

  const total = store.customers.length;
  const returning = store.customers.filter((c) => c.purchases >= 2).length;
  const newer = store.customers.filter((c) => c.purchases <= 1).length;

  const redemptionsMonth = store.redemptions.filter((r) =>
    dayKey(r.createdAt).startsWith(month)
  );

  const days: DayPoint[] = Array.from({ length: 14 }, (_, i) => {
    const key = shiftKey(today, i - 13);
    const dayRows = rows.filter((r) => r.day === key);
    const flagged = dayRows.filter((r) => r.t.repeatCustomer !== undefined);
    return {
      key,
      label: `${key.slice(8, 10)}/${key.slice(5, 7)}`,
      salesCents: sum(dayRows),
      count: dayRows.length,
      repeatPct: flagged.length
        ? Math.round(
            (100 * flagged.filter((r) => r.t.repeatCustomer).length) /
              flagged.length
          )
        : null,
      newCustomers: store.customers.filter(
        (c) => c.firstSeenAt && dayKey(c.firstSeenAt) === key
      ).length,
    };
  });

  return {
    salesTodayCents: sum(todayRows),
    salesWeekCents: sum(weekRows),
    salesMonthCents: sum(monthRows),
    txMonth: monthRows.length,
    avgTxCents: monthRows.length ? Math.round(sum(monthRows) / monthRows.length) : 0,
    totalCustomers: total,
    newCustomers: newer,
    returningCustomers: returning,
    repeatRatePct: total ? Math.round((100 * returning) / total) : 0,
    backpayIssuedMonthCents: monthRows.reduce(
      (s, r) => s + r.t.backpayEarnedCents,
      0
    ),
    backpayRedeemedMonthCents: redemptionsMonth.reduce(
      (s, r) => s + r.costCents,
      0
    ),
    liabilityCents: store.customers.reduce((s, c) => s + c.backpayCents, 0),
    redemptionsMonth: redemptionsMonth.length,
    goldConfirmedMonth: monthRows.filter((r) => r.t.goldDropEntry === "active").length,
    goldHeldMonth: monthRows.filter((r) => r.t.goldDropEntry === "pending").length,
    sampleTx: store.transactions.filter((t) => t.key.startsWith("seed-")).length,
    totalTx: store.transactions.length,
    days,
  };
}