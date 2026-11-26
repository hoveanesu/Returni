"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CUSTOMERS,
  isoDaysAgo,
  type DemoCustomer,
  type Segment,
} from "@/lib/customers-demo";

const PAGE_SIZE = 8;

type SegmentFilter = "All" | Segment;
type RegFilter = "All" | "Registered" | "Not registered";
type SortKey = "last" | "spend" | "balance" | "name";

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Harare",
  });
const fmtPhone = (p: string) => `+263 ${p.slice(4, 6)} ${p.slice(6, 9)} ${p.slice(9)}`;
const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const agoText = (n: number) =>
  n === 0 ? "Today" : n === 1 ? "1 day ago" : `${n} days ago`;

const SEG_CLS: Record<Segment, string> = {
  New: "bg-brand-blue/10 text-brand-blue",
  Returning: "bg-brand-green/10 text-brand-green",
  Frequent: "bg-amber-100 text-amber-700",
  Inactive: "bg-surface-alt text-muted",
};

const AVATARS = [
  "bg-brand-blue",
  "bg-brand-green",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-600",
  "bg-indigo-500",
];
const avatarCls = (id: string) => AVATARS[Number(id.slice(1)) % AVATARS.length];

const STATS = (() => {
  const total = CUSTOMERS.length;
  const repeat = CUSTOMERS.filter((c) => c.purchases >= 2).length;
  return {
    total,
    newCount: CUSTOMERS.filter((c) => c.firstDaysAgo <= 30).length,
    repeat,
    repeatPct: Math.round((repeat / total) * 100),
    inactive: CUSTOMERS.filter((c) => c.segment === "Inactive").length,
  };
})();

const ICONS = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  trend: (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  repeat: (
    <>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </>
  ),
};

function Icon({ name, size = 20 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: keyof typeof ICONS;
  label: string;
  value: string;
  sub?: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-sage/60 bg-surface p-4 shadow-sm">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
}

function SegmentBadge({ s }: { s: Segment }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SEG_CLS[s]}`}>{s}</span>
  );
}

function CustomerDetail({ c, onClose }: { c: DemoCustomer; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const avg = Math.round(c.totalSpendCents / c.purchases);
  const stats: [string, string][] = [
    ["Total purchases", String(c.purchases)],
    ["Total spend", usd(c.totalSpendCents)],
    ["Average transaction", usd(avg)],
    ["BackPay balance", usd(c.backpayBalanceCents)],
    ["BackPay earned", usd(c.backpayEarnedCents)],
    ["BackPay redeemed", usd(c.backpayRedeemedCents)],
    ["Gold Drop entries", String(c.goldDropEntries)],
    ["RETURNi Prices used", String(c.returniPricesUsed)],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-navy/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${c.name} profile`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarCls(c.id)}`}
            >
              {initials(c.name)}
            </span>
            <div>
              <h2 className="text-lg font-semibold">{c.name}</h2>
              <p className="text-sm text-muted">{fmtPhone(c.phone)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full px-2 py-1 text-xl leading-none text-muted hover:bg-surface-alt"
          >
            ×
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <SegmentBadge s={c.segment} />
          <span
            className={`rounded-full px-2.5 py-0.5 font-medium ${
              c.registered ? "bg-brand-green/10 text-brand-green" : "bg-surface-alt text-muted"
            }`}
          >
            {c.registered ? "Account registered" : "No account yet"}
          </span>
          <span className="text-muted">
            First purchase {fmtDate(isoDaysAgo(c.firstDaysAgo))} · Last purchase{" "}
            {fmtDate(isoDaysAgo(c.lastDaysAgo))}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface-alt p-3">
              <p className="text-xs text-muted">{label}</p>
              <p className="mt-0.5 font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {!c.registered && (
          <p className="mt-3 rounded-xl bg-brand-blue/10 px-3 py-2 text-xs text-brand-blue">
            Gold Drop entries stay pending until this customer creates an account.
          </p>
        )}

        <h3 className="mb-2 mt-5 font-semibold">Recent purchases</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="pb-2">Receipt</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">BackPay earned</th>
              </tr>
            </thead>
            <tbody>
              {c.history.map((h) => (
                <tr key={h.receiptNo} className="border-t border-sage/40">
                  <td className="py-2">{h.receiptNo}</td>
                  <td className="py-2">{fmtDate(h.date)}</td>
                  <td className="py-2">{usd(h.totalCents)}</td>
                  <td className="py-2">{usd(h.backpayCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted">Demo data. Real history comes from the database.</p>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<SegmentFilter>("All");
  const [reg, setReg] = useState<RegFilter>("All");
  const [sort, setSort] = useState<SortKey>("last");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<DemoCustomer | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    const filtered = CUSTOMERS.filter((c) => {
      if (segment !== "All" && c.segment !== segment) return false;
      if (reg === "Registered" && !c.registered) return false;
      if (reg === "Not registered" && c.registered) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (digits.length > 0 && c.phone.replace(/\D/g, "").includes(digits))
      );
    });
    return [...filtered].sort((a, b) => {
      if (sort === "spend") return b.totalSpendCents - a.totalSpendCents;
      if (sort === "balance") return b.backpayBalanceCents - a.backpayBalanceCents;
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.lastDaysAgo - b.lastDaysAgo;
    });
  }, [query, segment, reg, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  function clearFilters() {
    setQuery("");
    setSegment("All");
    setReg("All");
    setSort("last");
    setPage(1);
  }

  function exportCsv() {
    const head = [
      "Name",
      "Phone",
      "Account registered",
      "Segment",
      "Total purchases",
      "Total spend (USD)",
      "BackPay balance (USD)",
      "First purchase",
      "Last purchase",
    ];
    const lines = rows.map((c) => [
      c.name,
      c.phone,
      c.registered ? "Yes" : "No",
      c.segment,
      c.purchases,
      (c.totalSpendCents / 100).toFixed(2),
      (c.backpayBalanceCents / 100).toFixed(2),
      fmtDate(isoDaysAgo(c.firstDaysAgo)),
      fmtDate(isoDaysAgo(c.lastDaysAgo)),
    ]);
    const csv = [head, ...lines]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "returni-customers-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectCls =
    "w-full rounded-xl border border-sage bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/30";

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-brand-blue">
            Demo data
          </span>
        </div>
        <p className="text-sm text-muted">Know your customers. Grow your business.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search customers</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Icon name="search" size={18} />
          </span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by phone number or name..."
            className="w-full rounded-xl border border-sage bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/30"
          />
        </label>
        <button
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="flex items-center justify-center gap-2 rounded-xl border border-sage bg-surface px-4 py-3 text-sm font-semibold hover:bg-surface-alt"
        >
          <Icon name="filter" size={16} /> Filter
        </button>
        <button
          onClick={exportCsv}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-semibold text-white hover:brightness-95"
        >
          <Icon name="download" size={16} /> Export
        </button>
      </div>

      {showFilters && (
        <div className="grid gap-3 rounded-2xl border border-sage/60 bg-surface p-4 sm:grid-cols-4">
          <label className="text-xs font-medium text-muted">
            Segment
            <select
              className={`${selectCls} mt-1`}
              value={segment}
              onChange={(e) => {
                setSegment(e.target.value as SegmentFilter);
                setPage(1);
              }}
            >
              {["All", "New", "Returning", "Frequent", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted">
            Account
            <select
              className={`${selectCls} mt-1`}
              value={reg}
              onChange={(e) => {
                setReg(e.target.value as RegFilter);
                setPage(1);
              }}
            >
              {["All", "Registered", "Not registered"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted">
            Sort by
            <select
              className={`${selectCls} mt-1`}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                setPage(1);
              }}
            >
              <option value="last">Last purchase</option>
              <option value="spend">Total spend</option>
              <option value="balance">BackPay balance</option>
              <option value="name">Name</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full rounded-xl border border-sage px-3 py-2.5 text-sm font-semibold hover:bg-surface-alt"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="users" label="Total Customers" value={String(STATS.total)} tone="bg-brand-green/10 text-brand-green" />
        <StatCard icon="trend" label="New This Month" value={String(STATS.newCount)} tone="bg-brand-blue/10 text-brand-blue" />
        <StatCard
          icon="repeat"
          label="Repeat Customers"
          value={String(STATS.repeat)}
          sub={`${STATS.repeatPct}% of customers`}
          tone="bg-indigo-100 text-indigo-600"
        />
        <StatCard icon="clock" label="Inactive (30+ days)" value={String(STATS.inactive)} tone="bg-amber-100 text-amber-600" />
      </div>

      <div className="rounded-2xl border border-sage/60 bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface-alt/60 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone Number</th>
                <th className="px-4 py-3 font-medium">Total Purchases</th>
                <th className="px-4 py-3 font-medium">Total Spend</th>
                <th className="px-4 py-3 font-medium">BackPay Balance</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Purchase</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-t border-sage/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarCls(c.id)}`}
                      >
                        {initials(c.name)}
                      </span>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{fmtPhone(c.phone)}</td>
                  <td className="px-4 py-3">{c.purchases}</td>
                  <td className="px-4 py-3">{usd(c.totalSpendCents)}</td>
                  <td className="px-4 py-3 font-medium text-brand-green">{usd(c.backpayBalanceCents)}</td>
                  <td className="px-4 py-3">
                    <SegmentBadge s={c.segment} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{agoText(c.lastDaysAgo)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(c)}
                      className="rounded-lg border border-sage px-3 py-1 text-xs font-semibold hover:bg-surface-alt"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="font-medium">No customers match your search</p>
            <p className="mt-1 text-sm text-muted">Try a different name, number or filter.</p>
            <button
              onClick={clearFilters}
              className="mt-3 rounded-xl border border-sage px-4 py-2 text-sm font-semibold hover:bg-surface-alt"
            >
              Clear search and filters
            </button>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-sage/40 px-4 py-3 text-xs text-muted sm:flex-row">
            <p>
              Showing {start + 1}-{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length} customers
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
                aria-label="Previous page"
                className="h-8 min-w-8 rounded-lg border border-sage px-2 hover:bg-surface-alt disabled:opacity-40"
              >
                ‹
              </button>
              {pageList(current, pageCount).map((p, i) =>
                p === "…" ? (
                  <span key={`gap-${i}`} className="px-1">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={p === current ? "page" : undefined}
                    className={`h-8 min-w-8 rounded-lg border px-2 ${
                      p === current
                        ? "border-brand-green bg-brand-green text-white"
                        : "border-sage hover:bg-surface-alt"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                disabled={current === pageCount}
                onClick={() => setPage(current + 1)}
                aria-label="Next page"
                className="h-8 min-w-8 rounded-lg border border-sage px-2 hover:bg-surface-alt disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted">
        Segments: New = first purchase in the last 30 days · Frequent = 10 or more purchases ·
        Inactive = no purchase in 30+ days · Returning = everyone else. You only see customers who
        have bought from your store.
      </p>

      {selected && <CustomerDetail c={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}