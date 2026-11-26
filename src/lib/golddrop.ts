import type { Store } from "./engine";

// Demo schedule: weekly draw, Sunday 18:00 Harare time (UTC+2, no daylight saving)
const DRAW_UTC_HOUR = 16;

export function nextDraw(from: Date): Date {
  const d = new Date(
    Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate(),
      DRAW_UTC_HOUR,
      0,
      0
    )
  );
  d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7)); // move to Sunday
  if (d.getTime() <= from.getTime()) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

export type EntryStatus = "Confirmed" | "Held" | "Void";

export type GoldEntry = {
  entryNo: string;
  receiptNo: string;
  phone: string;
  customer: string;
  amountCents: number;
  createdAt: string;
  status: EntryStatus;
  drawAt: string; // the draw this entry counts towards
};

// Entries are derived from recorded sales, never typed in by hand
export function buildEntries(store: Store): GoldEntry[] {
  return store.transactions
    .filter((t) => t.goldDropEntry !== "none")
    .map(
      (t): GoldEntry => ({
        entryNo: `GD-${t.receiptNo.replace(/\D/g, "").padStart(8, "0")}`,
        receiptNo: t.receiptNo,
        phone: t.phone,
        customer: t.customerName,
        amountCents: t.totalCents,
        createdAt: t.createdAt,
        status:
          t.status === "Reversed"
            ? "Void"
            : t.goldDropEntry === "active"
              ? "Confirmed"
              : "Held",
        drawAt: nextDraw(new Date(t.createdAt)).toISOString(),
      })
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function goldSummary(entries: GoldEntry[], now: Date) {
  const drawAt = nextDraw(now).toISOString();
  const upcomingAt = new Date(
    new Date(drawAt).getTime() + 7 * 24 * 3600 * 1000
  ).toISOString();
  const current = entries.filter((e) => e.drawAt === drawAt);
  const confirmed = current.filter((e) => e.status === "Confirmed");
  return {
    drawAt,
    upcomingAt,
    currentConfirmed: confirmed.length,
    currentHeld: current.filter((e) => e.status === "Held").length,
    participants: new Set(confirmed.map((e) => e.phone)).size,
    totalConfirmed: entries.filter((e) => e.status === "Confirmed").length,
    totalHeld: entries.filter((e) => e.status === "Held").length,
  };
}

export function countdown(to: string, now: Date) {
  const s = Math.floor(
    Math.max(0, new Date(to).getTime() - now.getTime()) / 1000
  );
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
  };
}