"use client";

import { useEffect, useMemo, useState } from "react";
import { CUSTOMERS } from "@/lib/customers-demo";
import {
  AUDIENCES,
  BASE_RATE_PCT,
  INITIAL_PROMOTIONS,
  MAX_RATE_PCT,
  PROMO_TYPES,
  statusOf,
  type Audience,
  type PromoStatus,
  type PromoType,
  type Promotion,
} from "@/lib/promos-demo";

type Tab = "All" | PromoStatus;
const TABS: Tab[] = ["All", "Active", "Scheduled", "Draft", "Paused", "Completed"];

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const STATUS_CLS: Record<PromoStatus, string> = {
  Active: "bg-brand-green/10 text-brand-green",
  Scheduled: "bg-brand-blue/10 text-brand-blue",
  Draft: "bg-surface-alt text-muted",
  Paused: "bg-amber-100 text-amber-700",
  Completed: "bg-surface-alt text-muted",
};

const THEME: Record<PromoType, { bg: string; fg: string; icon: keyof typeof ICONS }> = {
  "BackPay Boost": { bg: "linear-gradient(120deg, #166534 0%, #2f7d32 100%)", fg: "#ffffff", icon: "cart" },
  "RETURNi Prices": { bg: "linear-gradient(120deg, #fde68a 0%, #fbbf24 100%)", fg: "#191a2e", icon: "tag" },
  "Limited-time discount": { bg: "linear-gradient(120deg, #0b3b7e 0%, #1d4ed8 100%)", fg: "#ffffff", icon: "percent" },
};

const ICONS = {
  megaphone: (
    <>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  trend: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  plus: <path d="M5 12h14M12 5v14" />,
  cart: (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  tag: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  percent: (
    <>
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
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
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
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
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
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

const audienceSize = (a: Audience) =>
  a === "All customers" ? CUSTOMERS.length : CUSTOMERS.filter((c) => c.segment === a).length;

function headline(p: Promotion): string {
  if (p.type === "BackPay Boost") return `Earn ${p.boostPct ?? ""}% BackPay on your next purchase!`;
  if (p.type === "Limited-time discount") return `${p.discountPct ?? ""}% off ${p.products.toLowerCase()}`;
  return p.name;
}

function suggest(type: PromoType, boost: string, discount: string, end: string, products: string): string {
  const until = end ? ` until ${fmtDay(end)}` : "";
  if (type === "BackPay Boost") {
    return `Earn ${boost || "10"}% BackPay on your next purchase at Demo Store${until}! Reply STOP to opt out.`;
  }
  if (type === "Limited-time discount") {
    return `${discount || "10"}% off ${products || "selected items"} at Demo Store${until}. Reply STOP to opt out.`;
  }
  return `Unlock exclusive RETURNi Prices on ${products || "selected products"} at Demo Store${until}. Use your BackPay in store. Reply STOP to opt out.`;
}

function PromoForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Promotion | null;
  onSave: (p: Promotion) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<PromoType>(initial?.type ?? "BackPay Boost");
  const [boost, setBoost] = useState(initial?.boostPct != null ? String(initial.boostPct) : "");
  const [discount, setDiscount] = useState(initial?.discountPct != null ? String(initial.discountPct) : "");
  const [products, setProducts] = useState(initial?.products ?? "All products");
  const [audience, setAudience] = useState<Audience>(initial?.audience ?? "All customers");
  const [start, setStart] = useState(initial?.start ?? "");
  const [end, setEnd] = useState(initial?.end ?? "");
  const [budget, setBudget] = useState(initial ? (initial.budgetCents / 100).toFixed(2) : "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [error, setError] = useState<string | null>(null);

  const editingLive = initial !== null && !initial.draft;

  function submit(launch: boolean) {
    const boostN = parseFloat(boost);
    const discN = parseFloat(discount);
    const budgetC = Math.round(parseFloat(budget) * 100);

    if (!name.trim()) return setError("Give the promotion a name.");
    if (launch) {
      if (type === "BackPay Boost" && !(boostN > BASE_RATE_PCT && boostN <= MAX_RATE_PCT)) {
        return setError(
          `A BackPay boost must be higher than your normal rate (${BASE_RATE_PCT}%) and no more than the platform limit (${MAX_RATE_PCT}%).`
        );
      }
      if (type === "Limited-time discount" && !(discN >= 1 && discN <= 90)) {
        return setError("Enter a discount between 1% and 90%.");
      }
      if (!products.trim()) return setError("Say which products or services this applies to.");
      if (!start || !end) return setError("Choose a start date and an end date.");
      if (end < start) return setError("The end date must be on or after the start date.");
      if (!Number.isFinite(budgetC) || budgetC <= 0) return setError("Enter a promotion budget in USD.");
      if (!message.trim()) return setError("Write the WhatsApp message customers will receive.");
      if (message.length > 400) return setError("Keep the WhatsApp message under 400 characters.");
    }
    setError(null);
    onSave({
      id: initial?.id ?? `pr-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      type,
      boostPct: type === "BackPay Boost" && Number.isFinite(boostN) ? boostN : null,
      discountPct: type === "Limited-time discount" && Number.isFinite(discN) ? discN : null,
      products: products.trim() || "All products",
      audience,
      start,
      end,
      budgetCents: Number.isFinite(budgetC) ? budgetC : 0,
      spentCents: initial?.spentCents ?? 0,
      message: message.trim(),
      draft: !launch,
      paused: initial?.paused ?? false,
      reached: initial?.reached ?? 0,
      delivered: initial?.delivered ?? 0,
      engaged: initial?.engaged ?? 0,
      redemptions: initial?.redemptions ?? 0,
      repeatPurchases: initial?.repeatPurchases ?? 0,
      salesCents: initial?.salesCents ?? 0,
    });
  }

  return (
    <Modal title={initial ? "Edit promotion" : "New promotion"} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Promotion name
            <input className={`${inputCls} mt-1`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend Special" />
          </label>
          <label className="text-sm font-medium">
            Promotion type
            <select className={`${inputCls} mt-1`} value={type} onChange={(e) => setType(e.target.value as PromoType)}>
              {PROMO_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium">
          Description
          <input className={`${inputCls} mt-1`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short summary for your own reference" />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          {type === "BackPay Boost" && (
            <label className="text-sm font-medium">
              Boosted BackPay rate (%)
              <input className={`${inputCls} mt-1`} inputMode="decimal" value={boost} onChange={(e) => setBoost(e.target.value)} placeholder={`Above ${BASE_RATE_PCT}, up to ${MAX_RATE_PCT}`} />
            </label>
          )}
          {type === "Limited-time discount" && (
            <label className="text-sm font-medium">
              Discount (%)
              <input className={`${inputCls} mt-1`} inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="1 to 90" />
            </label>
          )}
          {type === "RETURNi Prices" && (
            <p className="self-end rounded-xl bg-surface-alt px-3 py-2.5 text-xs text-muted sm:col-span-1">
              Uses the offers you set up in RETURNi Prices. Customers unlock them with BackPay.
            </p>
          )}
          <label className="text-sm font-medium">
            Eligible products or services
            <input className={`${inputCls} mt-1`} value={products} onChange={(e) => setProducts(e.target.value)} />
          </label>
          <label className="text-sm font-medium">
            Customer segment
            <select className={`${inputCls} mt-1`} value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
              {AUDIENCES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs font-normal text-muted">
              About {audienceSize(audience)} customers. Only those who agreed to WhatsApp messages are contacted.
            </span>
          </label>
          <label className="text-sm font-medium">
            Promotion budget (USD)
            <input className={`${inputCls} mt-1`} inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00" />
          </label>
          <label className="text-sm font-medium">
            Start date
            <input type="date" className={`${inputCls} mt-1`} value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="text-sm font-medium">
            End date
            <input type="date" className={`${inputCls} mt-1`} value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="promo-message" className="text-sm font-medium">
              WhatsApp message
            </label>
            <button
              type="button"
              onClick={() => setMessage(suggest(type, boost, discount, end, products))}
              className="text-xs font-semibold text-brand-green hover:underline"
            >
              Use suggested message
            </button>
          </div>
          <textarea
            id="promo-message"
            rows={3}
            className={`${inputCls} mt-1`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">
            {message.length}/400 characters. Demo: nothing is sent to real customers.
          </p>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-sage px-4 py-2.5 text-sm font-semibold hover:bg-surface-alt">
            Cancel
          </button>
          {editingLive ? (
            <button onClick={() => submit(true)} className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95">
              Save changes
            </button>
          ) : (
            <>
              <button onClick={() => submit(false)} className="rounded-xl border border-brand-green px-4 py-2.5 text-sm font-semibold text-brand-green hover:bg-brand-green/10">
                Save as draft
              </button>
              <button onClick={() => submit(true)} className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95">
                Launch promotion
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

function PromoCard({ p, onOpen }: { p: Promotion; onOpen: () => void }) {
  const t = THEME[p.type];
  return (
    <div className="relative overflow-hidden rounded-2xl p-5" style={{ background: t.bg, color: t.fg }}>
      <span className="pointer-events-none absolute -bottom-4 -right-2 opacity-20">
        <Icon name={t.icon} size={120} />
      </span>
      <p className="relative max-w-[80%] text-xl font-bold leading-snug">{headline(p)}</p>
      <p className="relative mt-1 max-w-[80%] text-sm opacity-90">{p.description}</p>
      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">
          Active · Ends {fmtDay(p.end)}
        </span>
        <button
          onClick={onOpen}
          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-navy hover:bg-white/90"
        >
          View results
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-alt p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [tab, setTab] = useState<Tab>("All");
  const [form, setForm] = useState<{ promo: Promotion | null } | null>(null);
  const [view, setView] = useState<Promotion | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  const active = promos.filter((p) => statusOf(p) === "Active");

  const stats = useMemo(() => {
    const reach = promos.reduce((n, p) => n + p.reached, 0);
    const withData = promos.filter((p) => p.delivered > 0);
    const avg = withData.length
      ? Math.round((withData.reduce((n, p) => n + p.engaged / p.delivered, 0) / withData.length) * 100)
      : 0;
    return { reach, avg };
  }, [promos]);

  const rows = promos.filter((p) => tab === "All" || statusOf(p) === tab);
  const tabCount = (t: Tab) => (t === "All" ? promos.length : promos.filter((p) => statusOf(p) === t).length);

  function save(p: Promotion) {
    const exists = promos.some((x) => x.id === p.id);
    setPromos((prev) => (exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]));
    setForm(null);
    notify(
      p.draft
        ? "Draft saved (demo: not saved to a database)"
        : "Promotion saved. Demo: no WhatsApp messages were sent."
    );
  }

  function togglePause(p: Promotion) {
    setPromos((prev) => prev.map((x) => (x.id === p.id ? { ...x, paused: !x.paused } : x)));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-rose-500">
                <Icon name="megaphone" size={24} />
              </span>
              Promotions
            </h1>
            <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-brand-blue">
              Demo data
            </span>
          </div>
          <p className="text-sm text-muted">Create and manage campaigns to engage your customers.</p>
        </div>
        <button
          onClick={() => setForm({ promo: null })}
          className="flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          <Icon name="plus" size={16} /> New Promotion
        </button>
      </div>

      {toast && (
        <p role="status" className="rounded-xl bg-brand-green/10 px-4 py-3 text-sm text-brand-green">
          {toast}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon="play" label="Active Campaigns" value={String(active.length)} tone="bg-brand-green/10 text-brand-green" />
        <StatCard icon="users" label="Total Reach" value={String(stats.reach)} sub="customer contacts" tone="bg-brand-blue/10 text-brand-blue" />
        <StatCard icon="trend" label="Avg. Engagement" value={`${stats.avg}%`} sub="of delivered messages" tone="bg-indigo-100 text-indigo-600" />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Promotions</h2>
          <button onClick={() => setTab("All")} className="text-xs font-semibold text-brand-green hover:underline">
            View All →
          </button>
        </div>
        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sage bg-surface px-4 py-8 text-center">
            <p className="font-medium">No active promotions</p>
            <p className="mt-1 text-sm text-muted">Launch a promotion to give customers a reason to return.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((p) => (
              <PromoCard key={p.id} p={p} onOpen={() => setView(p)} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-sage/60 bg-surface shadow-sm">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold">All campaigns</h2>
        </div>
        <div role="tablist" aria-label="Campaign status" className="mt-2 flex gap-1 overflow-x-auto border-b border-sage/40 px-4">
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-surface-alt/60 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Audience</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Budget used</th>
                <th className="px-4 py-3 font-medium">Reached</th>
                <th className="px-4 py-3 font-medium">Redemptions</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const st = statusOf(p);
                const canPause = st === "Active" || st === "Scheduled" || st === "Paused";
                return (
                  <tr key={p.id} className="border-t border-sage/40">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted">{p.type}</td>
                    <td className="px-4 py-3">{p.audience}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {p.start ? `${fmtDay(p.start)} – ${fmtDay(p.end)}` : "Not set"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {usd(p.spentCents)} / {usd(p.budgetCents)}
                    </td>
                    <td className="px-4 py-3">{p.reached}</td>
                    <td className="px-4 py-3">{p.redemptions}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[st]}`}>{st}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setView(p)} className="rounded-lg border border-sage px-2.5 py-1 text-xs font-semibold hover:bg-surface-alt">
                          View
                        </button>
                        {st !== "Completed" && (
                          <button onClick={() => setForm({ promo: p })} className="rounded-lg border border-sage px-2.5 py-1 text-xs font-semibold hover:bg-surface-alt">
                            Edit
                          </button>
                        )}
                        {canPause && (
                          <button onClick={() => togglePause(p)} className="rounded-lg border border-sage px-2.5 py-1 text-xs font-semibold hover:bg-surface-alt">
                            {st === "Paused" ? "Resume" : "Pause"}
                          </button>
                        )}
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
            <p className="font-medium">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted">No campaigns match this tab.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted">
        WhatsApp messages in this demo are simulated. Real sending needs a connected WhatsApp Business
        account and only reaches customers who agreed to receive messages. BackPay boosts stay within
        the platform limit of {MAX_RATE_PCT}%.
      </p>

      {form && <PromoForm initial={form.promo} onSave={save} onClose={() => setForm(null)} />}

      {view && (
        <Modal title={view.name} onClose={() => setView(null)} wide>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-0.5 font-medium ${STATUS_CLS[statusOf(view)]}`}>{statusOf(view)}</span>
            <span className="text-muted">
              {view.type} · {view.audience} · {view.start ? `${fmtDay(view.start)} – ${fmtDay(view.end)}` : "Dates not set"}
            </span>
          </div>

          {view.delivered === 0 && view.reached === 0 ? (
            <p className="mt-4 rounded-xl bg-surface-alt px-4 py-3 text-sm text-muted">
              No results yet. Performance appears once the campaign has started.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Customers reached" value={String(view.reached)} />
              <Metric label="Messages delivered" value={`${view.delivered} (${pct(view.delivered, view.reached)})`} />
              <Metric label="Customer engagement" value={pct(view.engaged, view.delivered)} />
              <Metric label="Offer redemptions" value={String(view.redemptions)} />
              <Metric label="Repeat purchases" value={String(view.repeatPurchases)} />
              <Metric label="Sales linked to campaign" value={usd(view.salesCents)} />
            </div>
          )}

          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted">
              <span>Budget used</span>
              <span>
                {usd(view.spentCents)} of {usd(view.budgetCents)}
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface-alt">
              <div
                className="h-2 rounded-full bg-brand-green"
                style={{ width: `${view.budgetCents > 0 ? Math.min(100, (view.spentCents / view.budgetCents) * 100) : 0}%` }}
              />
            </div>
          </div>

          <h3 className="mb-1 mt-5 text-sm font-semibold">WhatsApp message</h3>
          <p className="rounded-xl bg-surface-alt p-3 text-sm">{view.message || "No message written yet."}</p>
          <p className="mt-3 text-xs text-muted">Demo data. Real results come from delivery reports and sales records.</p>
        </Modal>
      )}
    </div>
  );
}