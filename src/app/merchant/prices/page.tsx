"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATALOGUE,
  ELIGIBILITY,
  INITIAL_OFFERS,
  TODAY,
  discountPct,
  historyFor,
  statusOf,
  type Eligibility,
  type Offer,
  type OfferStatus,
} from "@/lib/prices-demo";

type Tab = "All Offers" | "Active" | "Scheduled" | "Paused" | "Expired";
const TABS: Tab[] = ["All Offers", "Active", "Scheduled", "Paused", "Expired"];

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const toCents = (s: string) => Math.round(parseFloat(s) * 100);

const STATUS_CLS: Record<OfferStatus, string> = {
  Active: "bg-brand-green/10 text-brand-green",
  Scheduled: "bg-brand-blue/10 text-brand-blue",
  Paused: "bg-amber-100 text-amber-700",
  Expired: "bg-surface-alt text-muted",
  "Limit reached": "bg-surface-alt text-muted",
};

const tabOf = (s: OfferStatus): Tab =>
  s === "Active" ? "Active" : s === "Scheduled" ? "Scheduled" : s === "Paused" ? "Paused" : "Expired";

const TILE = ["bg-brand-green", "bg-brand-blue", "bg-amber-500", "bg-rose-500", "bg-teal-600", "bg-indigo-500"];
const tileCls = (category: string) =>
  TILE[[...category].reduce((n, ch) => n + ch.charCodeAt(0), 0) % TILE.length];

const ICONS = {
  tag: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  cart: (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  percent: (
    <>
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  plus: <path d="M5 12h14M12 5v14" />,
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

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: keyof typeof ICONS;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-sage/60 bg-surface p-4 shadow-sm">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted">{label}</p>
        <p className="text-xl font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-navy/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-xl sm:rounded-2xl ${
          wide ? "sm:max-w-xl" : "sm:max-w-md"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full px-2 py-1 text-xl leading-none text-muted hover:bg-surface-alt"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-sage bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/30";

function OfferForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Offer | null;
  onSave: (o: Offer) => void;
  onClose: () => void;
}) {
  const [product, setProduct] = useState(initial?.product ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [standard, setStandard] = useState(initial ? (initial.standardCents / 100).toFixed(2) : "");
  const [returni, setReturni] = useState(initial ? (initial.returniCents / 100).toFixed(2) : "");
  const [backpay, setBackpay] = useState(initial ? (initial.backpayCents / 100).toFixed(2) : "1.00");
  const [eligibility, setEligibility] = useState<Eligibility>(initial?.eligibility ?? "All customers");
  const [start, setStart] = useState(initial?.start ?? TODAY);
  const [end, setEnd] = useState(initial?.end ?? "2026-12-31");
  const [limit, setLimit] = useState(initial?.limit != null ? String(initial.limit) : "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  function onProduct(v: string) {
    setProduct(v);
    const m = CATALOGUE.find((c) => c.name.toLowerCase() === v.trim().toLowerCase());
    if (m) {
      setCategory(m.category);
      if (!standard) setStandard((m.priceCents / 100).toFixed(2));
    }
  }

  const s = toCents(standard);
  const r = toCents(returni);
  const preview =
    Number.isFinite(s) && Number.isFinite(r) && s > 0 && r > 0 && r < s
      ? `${discountPct({ standardCents: s, returniCents: r })}% off`
      : null;

  function save() {
    const bp = toCents(backpay);
    if (!product.trim()) return setError("Enter the product or service name.");
    if (!category.trim()) return setError("Enter a category.");
    if (!Number.isFinite(s) || s <= 0) return setError("Enter the normal price in USD.");
    if (!Number.isFinite(r) || r <= 0) return setError("Enter the RETURNi Price in USD.");
    if (r >= s) return setError("The RETURNi Price must be lower than the normal price.");
    if (!Number.isFinite(bp) || bp < 0) return setError("Enter the BackPay required (use 0 if none).");
    if (!start || !end) return setError("Choose a start date and an expiry date.");
    if (end < start) return setError("The expiry date must be on or after the start date.");
    const lim = limit.trim() === "" ? null : parseInt(limit, 10);
    if (lim !== null && (!Number.isFinite(lim) || lim < 1)) {
      return setError("The redemption limit must be a whole number, or leave it empty for no limit.");
    }
    const redeemed = initial?.redeemed ?? 0;
    if (lim !== null && lim < redeemed) {
      return setError(`${redeemed} customers have already redeemed this offer, so the limit can't be lower.`);
    }
    setError(null);
    onSave({
      id: initial?.id ?? `o-${Date.now()}`,
      product: product.trim(),
      category: category.trim(),
      standardCents: s,
      returniCents: r,
      backpayCents: bp,
      eligibility,
      start,
      end,
      limit: lim,
      redeemed,
      active,
    });
  }

  return (
    <Modal title={initial ? "Edit offer" : "Create offer"} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Product or service
            <input
              className={`${inputCls} mt-1`}
              list="catalogue"
              value={product}
              onChange={(e) => onProduct(e.target.value)}
              placeholder="Choose or type a name"
            />
            <datalist id="catalogue">
              {CATALOGUE.map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>
          </label>
          <label className="text-sm font-medium">
            Category
            <input className={`${inputCls} mt-1`} value={category} onChange={(e) => setCategory(e.target.value)} />
          </label>
          <label className="text-sm font-medium">
            Normal price (USD)
            <input className={`${inputCls} mt-1`} inputMode="decimal" value={standard} onChange={(e) => setStandard(e.target.value)} placeholder="0.00" />
          </label>
          <label className="text-sm font-medium">
            RETURNi Price (USD)
            <input className={`${inputCls} mt-1`} inputMode="decimal" value={returni} onChange={(e) => setReturni(e.target.value)} placeholder="0.00" />
          </label>
        </div>

        {preview && (
          <p className="rounded-xl bg-brand-green/10 px-3 py-2 text-sm font-medium text-brand-green">
            Customers save {preview}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            BackPay required to unlock (USD)
            <input className={`${inputCls} mt-1`} inputMode="decimal" value={backpay} onChange={(e) => setBackpay(e.target.value)} />
            <span className="mt-1 block text-xs font-normal text-muted">
              This amount is used from the customer&apos;s BackPay when they redeem.
            </span>
          </label>
          <label className="text-sm font-medium">
            Who can redeem
            <select className={`${inputCls} mt-1`} value={eligibility} onChange={(e) => setEligibility(e.target.value as Eligibility)}>
              {ELIGIBILITY.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Start date
            <input type="date" className={`${inputCls} mt-1`} value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="text-sm font-medium">
            Expiry date
            <input type="date" className={`${inputCls} mt-1`} value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <label className="text-sm font-medium">
            Redemption limit
            <input className={`${inputCls} mt-1`} inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Leave empty for no limit" />
          </label>
          <label className="flex items-center gap-3 self-end rounded-xl border border-sage px-3 py-2.5 text-sm font-medium">
            <input type="checkbox" className="h-5 w-5 accent-brand-green" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Offer is switched on
          </label>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-sage px-4 py-2.5 text-sm font-semibold hover:bg-surface-alt">
            Cancel
          </button>
          <button onClick={save} className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95">
            {initial ? "Save changes" : "Create offer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function PricesPage() {
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [tab, setTab] = useState<Tab>("All Offers");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<{ offer: Offer | null } | null>(null);
  const [history, setHistory] = useState<Offer | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const stats = useMemo(() => {
    const active = offers.filter((o) => statusOf(o) === "Active");
    const products = new Set(active.map((o) => o.product.toLowerCase()));
    const avg = active.length
      ? Math.round((active.reduce((n, o) => n + discountPct(o), 0) / active.length) * 10) / 10
      : 0;
    const next = active.length ? active.map((o) => o.end).sort()[0] : null;
    return { count: active.length, products: products.size, avg, next };
  }, [offers]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers.filter((o) => {
      if (tab !== "All Offers" && tabOf(statusOf(o)) !== tab) return false;
      if (!q) return true;
      return o.product.toLowerCase().includes(q) || o.category.toLowerCase().includes(q);
    });
  }, [offers, tab, query]);

  const tabCount = (t: Tab) =>
    t === "All Offers" ? offers.length : offers.filter((o) => tabOf(statusOf(o)) === t).length;

  function saveOffer(o: Offer) {
    const exists = offers.some((x) => x.id === o.id);
    setOffers((prev) => (exists ? prev.map((x) => (x.id === o.id ? o : x)) : [o, ...prev]));
    setForm(null);
    notify(exists ? "Offer updated (demo: not saved to a database)" : "Offer created (demo: not saved to a database)");
  }

  function toggle(o: Offer) {
    setOffers((prev) => prev.map((x) => (x.id === o.id ? { ...x, active: !x.active } : x)));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">RETURNi Prices</h1>
            <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-brand-blue">
              Demo data
            </span>
          </div>
          <p className="text-sm text-muted">Offer exclusive prices to your RETURNi customers.</p>
        </div>
        <button
          onClick={() => setForm({ offer: null })}
          className="flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          <Icon name="plus" size={16} /> Create Offer
        </button>
      </div>

      {toast && (
        <p role="status" className="rounded-xl bg-brand-green/10 px-4 py-3 text-sm text-brand-green">
          {toast}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="tag" label="Active Offers" value={String(stats.count)} tone="bg-brand-green/10 text-brand-green" />
        <StatCard icon="cart" label="Products Covered" value={String(stats.products)} tone="bg-brand-blue/10 text-brand-blue" />
        <StatCard icon="percent" label="Avg. Discount" value={`${stats.avg}%`} tone="bg-brand-green/10 text-brand-green" />
        <StatCard icon="calendar" label="Next Expiry" value={stats.next ? fmtDay(stats.next) : "None"} tone="bg-brand-blue/10 text-brand-blue" />
      </div>

      <div className="rounded-2xl border border-sage/60 bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-sage/40 px-4 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Offer status" className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap border-b-2 px-3 pb-3 text-sm font-medium ${
                  tab === t ? "border-brand-green text-brand-green" : "border-transparent text-muted hover:text-brand-navy"
                }`}
              >
                {t} <span className="text-xs">({tabCount(t)})</span>
              </button>
            ))}
          </div>
          <label className="pb-3 sm:w-56">
            <span className="sr-only">Search offers</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search offers..."
              className={inputCls}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-surface-alt/60 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Normal Price</th>
                <th className="px-4 py-3 font-medium">RETURNi Price</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">BackPay Required</th>
                <th className="px-4 py-3 font-medium">Redeemed</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Expiry</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const st = statusOf(o);
                const canToggle = st !== "Expired" && st !== "Limit reached";
                return (
                  <tr key={o.id} className="border-t border-sage/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${tileCls(o.category)}`}
                        >
                          {o.product[0].toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium">{o.product}</p>
                          <p className="text-xs text-muted">{o.category} · {o.eligibility}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{usd(o.standardCents)}</td>
                    <td className="px-4 py-3 font-semibold">{usd(o.returniCents)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                        {discountPct(o)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{usd(o.backpayCents)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {o.redeemed}
                      {o.limit !== null ? ` / ${o.limit}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[st]}`}>
                        {st}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtDay(o.end)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setForm({ offer: o })}
                          className="rounded-lg border border-sage px-2.5 py-1 text-xs font-semibold hover:bg-surface-alt"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggle(o)}
                          disabled={!canToggle}
                          className="rounded-lg border border-sage px-2.5 py-1 text-xs font-semibold hover:bg-surface-alt disabled:opacity-40"
                        >
                          {o.active ? "Pause" : "Resume"}
                        </button>
                        <button
                          onClick={() => setHistory(o)}
                          className="rounded-lg border border-sage px-2.5 py-1 text-xs font-semibold hover:bg-surface-alt"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="font-medium">No offers here yet</p>
            <p className="mt-1 text-sm text-muted">
              {query ? "Try a different search." : "Create an offer to give customers a reason to come back."}
            </p>
            {!query && (
              <button
                onClick={() => setForm({ offer: null })}
                className="mt-3 rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
              >
                Create Offer
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted">
        You choose which products or services to offer, and each offer has its own BackPay requirement.
        Customers unlock a RETURNi Price at the till using the Redeem BackPay button. Offers can't be
        redeemed after their expiry date or once the limit is reached.
      </p>

      {form && (
        <OfferForm initial={form.offer} onSave={saveOffer} onClose={() => setForm(null)} />
      )}

      {history && (
        <Modal title={`Redemptions: ${history.product}`} onClose={() => setHistory(null)} wide>
          {historyFor(history).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No one has redeemed this offer yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="pb-2">Reference</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">BackPay used</th>
                  </tr>
                </thead>
                <tbody>
                  {historyFor(history).map((r) => (
                    <tr key={r.ref} className="border-t border-sage/40">
                      <td className="py-2">{r.ref}</td>
                      <td className="py-2">{r.customer}</td>
                      <td className="py-2">{fmtDay(r.date)}</td>
                      <td className="py-2">{usd(r.backpayCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-muted">
            Demo data. {history.redeemed} redemptions in total. Real history comes from the BackPay ledger.
          </p>
        </Modal>
      )}
    </div>
  );
}