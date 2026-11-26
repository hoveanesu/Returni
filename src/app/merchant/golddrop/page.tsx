"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { fmtDateTime, usd } from "@/lib/format";
import {
  buildEntries,
  countdown,
  goldSummary,
  type EntryStatus,
} from "@/lib/golddrop";
import { BACKPAY_RULES } from "@/lib/mock";
import { cardCls, inputCls } from "@/lib/ui";

type Filter = "All" | EntryStatus;

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className={cardCls}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

function Badge({ status }: { status: EntryStatus }) {
  const cls =
    status === "Confirmed"
      ? "bg-green-100 text-green-800"
      : status === "Held"
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

function GoldDropInner() {
  const { store } = useStore();
  const [now, setNow] = useState(() => new Date());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const entries = useMemo(() => buildEntries(store), [store]);
  const s = goldSummary(entries, now);
  const c = countdown(s.drawAt, now);

  const rows = entries.filter((e) => {
    if (filter !== "All" && e.status !== filter) return false;
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return (
      e.entryNo.toLowerCase().includes(t) ||
      e.customer.toLowerCase().includes(t) ||
      e.receiptNo.toLowerCase().includes(t) ||
      e.phone.replace(/\s/g, "").includes(t.replace(/\s/g, ""))
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Gold Drop</h1>
      <p className="mb-5 text-sm text-muted">
        Every purchase gives your customers a chance to win
      </p>

      {/* Banner */}
      <div
        className="mb-5 grid gap-4 overflow-hidden rounded-2xl p-5 sm:grid-cols-[1fr_auto] sm:items-center"
        style={{ background: "linear-gradient(90deg,#fcd34d,#fbbf24,#eab308)" }}
      >
        <p className="text-4xl font-black tracking-tight text-amber-900 sm:text-6xl">
          GOLD DROP<span className="align-super text-lg">™</span>
        </p>
        <div className="rounded-2xl bg-brand-green p-4 text-white">
          <p className="text-xs text-white/80">Current campaign</p>
          <p className="text-lg font-bold">Weekly Gold Drop</p>
          <div className="mt-3 grid grid-cols-4 gap-2" role="timer" aria-label="Time until the draw">
            {(
              [
                ["Days", c.days],
                ["Hours", c.hours],
                ["Mins", c.mins],
                ["Secs", c.secs],
              ] as [string, number][]
            ).map(([label, v]) => (
              <div key={label} className="rounded-xl bg-white/10 px-2 py-2 text-center">
                <p className="text-2xl font-bold tabular-nums">
                  {String(v).padStart(2, "0")}
                </p>
                <p className="text-[10px] uppercase text-white/70">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/80">
            Draw closes {fmtDateTime(s.drawAt)}
          </p>
        </div>
      </div>

      <p className="mb-5 rounded-xl bg-surface-alt px-4 py-3 text-sm text-brand-blue">
        Entries are created from the sales recorded in this portal. Sample sales
        are included until you reset demo data. The draw schedule is a demo
        setting.
      </p>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Entries in this draw" value={String(s.currentConfirmed)} note="Confirmed" />
        <Stat
          label="Held entries (this draw)"
          value={String(s.currentHeld)}
          note="Waiting for customer to register"
        />
        <Stat
          label="Participating customers"
          value={String(s.participants)}
          note="With a confirmed entry, this draw"
        />
        <Stat
          label="Total entries, all draws"
          value={String(s.totalConfirmed)}
          note={`Confirmed · ${s.totalHeld} held`}
        />
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <section className={cardCls}>
          <h2 className="mb-3 text-base font-semibold">Campaign</h2>
          <dl className="space-y-2 text-sm">
            {[
              ["Current draw closes", fmtDateTime(s.drawAt)],
              ["Upcoming draw", fmtDateTime(s.upcomingAt)],
              ["Entry rule", `1 entry per purchase of ${usd(BACKPAY_RULES.goldDropMinCents)} or more`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-sage/30 pb-1.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            Entries are held until the customer registers, and voided if the sale
            is reversed. Gold Drop is separate from BackPay.
          </p>
        </section>

        <section className={cardCls}>
          <h2 className="mb-3 text-base font-semibold">Prizes and winners</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Prize details</p>
              <p className="text-muted">No prize details have been published yet.</p>
            </div>
            <div>
              <p className="font-medium">Previous winners</p>
              <p className="text-muted">
                No draws have been run yet. Winners appear here only after an
                audited draw. Nothing is announced in this demo.
              </p>
            </div>
            <div>
              <p className="font-medium">Prize fulfilment</p>
              <p className="text-muted">
                Tracking starts once a winner is confirmed.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className={cardCls} aria-label="Entry history">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Entry history</h2>
          <div className="flex gap-2">
            <input
              className={`${inputCls} sm:w-64`}
              placeholder="Search entry, customer, receipt"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search entries"
            />
            <select
              className={`${inputCls} w-auto`}
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              aria-label="Filter by status"
            >
              <option>All</option>
              <option>Confirmed</option>
              <option>Held</option>
              <option>Void</option>
            </select>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-xl bg-surface-alt p-6 text-center text-sm text-muted">
            {entries.length === 0
              ? "No entries yet. Eligible sales create entries automatically."
              : "No entries match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="pb-2 font-medium">Entry ID</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 text-right font-medium">Purchase</th>
                  <th className="pb-2 pl-4 font-medium">Date &amp; time</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 25).map((e) => (
                  <tr key={e.entryNo} className="border-t border-sage/40">
                    <td className="py-2.5 font-medium">{e.entryNo}</td>
                    <td className="py-2.5">{e.customer}</td>
                    <td className="py-2.5 text-right">{usd(e.amountCents)}</td>
                    <td className="py-2.5 pl-4 text-xs text-muted">
                      {fmtDateTime(e.createdAt)}
                    </td>
                    <td className="py-2.5">
                      <Badge status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          Showing {Math.min(rows.length, 25)} of {rows.length}
        </p>
      </section>
    </div>
  );
}

export default function GoldDropPage() {
  const { loaded } = useStore();
  if (!loaded) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Gold Drop</h1>
        <p className="mt-2 text-sm text-muted">Loading…</p>
      </div>
    );
  }
  return <GoldDropInner />;
}