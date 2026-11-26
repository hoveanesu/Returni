"use client";

import { useEffect, useState } from "react";
import { normalizePhone } from "@/lib/engine";
import { usd } from "@/lib/format";
import { BACKPAY_RULES } from "@/lib/mock";
import { newKey } from "@/lib/sale";
import {
  CATEGORIES,
  PERMISSIONS,
  ROLES,
  useSettings,
  type Branch,
  type Role,
  type Settings,
  type StaffMember,
} from "@/lib/settings";
import { btnGhost, btnPrimary, cardCls, inputCls } from "@/lib/ui";

const TABS = [
  "Business Profile",
  "Branches",
  "Staff",
  "Receipt Settings",
  "Notifications",
  "Security",
  "Integrations",
] as const;
type Tab = (typeof TABS)[number];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand-green" : "bg-sage"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function StatusRow({
  name,
  status,
  note,
}: {
  name: string;
  status: string;
  note: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-sage/40 py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted">{note}</p>
      </div>
      <span className="shrink-0 rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-semibold text-muted">
        {status}
      </span>
    </div>
  );
}

function SettingsInner({
  initial,
  save,
}: {
  initial: Settings;
  save: (s: Settings) => boolean;
}) {
  const [draft, setDraft] = useState<Settings>(initial);
  const [lastSaved, setLastSaved] = useState<Settings>(initial);
  const [tab, setTab] = useState<Tab>("Business Profile");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(lastSaved);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const p = draft.profile;
  const setProfile = (v: Partial<Settings["profile"]>) =>
    setDraft((d) => ({ ...d, profile: { ...d.profile, ...v } }));
  const setReceipt = (v: Partial<Settings["receipt"]>) =>
    setDraft((d) => ({ ...d, receipt: { ...d.receipt, ...v } }));
  const setNotif = (v: Partial<Settings["notifications"]>) =>
    setDraft((d) => ({ ...d, notifications: { ...d.notifications, ...v } }));
  const setSec = (v: Partial<Settings["security"]>) =>
    setDraft((d) => ({ ...d, security: { ...d.security, ...v } }));
  const updBranch = (id: string, v: Partial<Branch>) =>
    setDraft((d) => ({
      ...d,
      branches: d.branches.map((b) => (b.id === id ? { ...b, ...v } : b)),
    }));
  const updStaff = (id: string, v: Partial<StaffMember>) =>
    setDraft((d) => ({
      ...d,
      staff: d.staff.map((s) => (s.id === id ? { ...s, ...v } : s)),
    }));

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) {
      setMsg({ ok: false, text: "Logo must be a PNG, JPEG or WebP image." });
      return;
    }
    if (f.size > 300 * 1024) {
      setMsg({ ok: false, text: "Logo is too large. Use an image under 300 KB." });
      return;
    }
    const r = new FileReader();
    r.onload = () => setProfile({ logoDataUrl: String(r.result) });
    r.readAsDataURL(f);
    setMsg(null);
  }

  function validate(): string | null {
    if (!p.name.trim()) return "Business name is required (Business Profile tab).";
    if (p.whatsapp.trim() && !normalizePhone(p.whatsapp))
      return "The business WhatsApp number is not valid (Business Profile tab).";
    if (draft.branches.some((b) => !b.name.trim()))
      return "Every branch needs a name (Branches tab).";
    if (!draft.branches.some((b) => b.active))
      return "Keep at least one branch active (Branches tab).";
    if (draft.staff.some((s) => !s.name.trim()))
      return "Every staff member needs a name (Staff tab).";
    if (!draft.staff.some((s) => s.role === "Owner" && s.active))
      return "Keep at least one active Owner account (Staff tab).";
    return null;
  }

  function handleSave() {
    const problem = validate();
    if (problem) {
      setMsg({ ok: false, text: problem });
      return;
    }
    if (save(draft)) {
      setLastSaved(draft);
      setMsg({ ok: true, text: "Settings saved in this browser." });
    } else {
      setMsg({
        ok: false,
        text: "Could not save. Browser storage may be full: try a smaller logo.",
      });
    }
  }

  const firstBranch = draft.branches.find((b) => b.active)?.name ?? "";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted">
            Manage your merchant account and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs font-medium text-brand-blue">Unsaved changes</span>
          )}
          <button className={btnPrimary} onClick={handleSave} disabled={!dirty}>
            Save changes
          </button>
        </div>
      </div>

      {msg && (
        <p
          role={msg.ok ? "status" : "alert"}
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div
        role="tablist"
        aria-label="Settings sections"
        className="mb-5 flex gap-1 overflow-x-auto border-b border-sage/60"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t
                ? "border-brand-green text-brand-green"
                : "border-transparent text-muted hover:text-brand-navy"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ---------- Business Profile ---------- */}
      {tab === "Business Profile" && (
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <section className={cardCls}>
            <h2 className="mb-4 text-base font-semibold">Business Profile</h2>
            <div className="grid gap-5 sm:grid-cols-[130px_1fr]">
              <div className="text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-sage/60 bg-surface-alt">
                  {p.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.logoDataUrl}
                      alt="Business logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-muted">No logo</span>
                  )}
                </div>
                <label
                  className={`${btnGhost} mt-3 inline-block cursor-pointer text-xs focus-within:ring-2 focus-within:ring-brand-green/30`}
                >
                  {p.logoDataUrl ? "Change logo" : "Upload logo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={onLogo}
                  />
                </label>
                {p.logoDataUrl && (
                  <button
                    className="mt-2 block w-full text-xs text-red-600 hover:underline"
                    onClick={() => setProfile({ logoDataUrl: null })}
                  >
                    Remove logo
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <Field label="Business name *">
                  <input
                    className={inputCls}
                    value={p.name}
                    onChange={(e) => setProfile({ name: e.target.value })}
                  />
                </Field>
                <Field label="Business category">
                  <select
                    className={inputCls}
                    value={p.category}
                    onChange={(e) => setProfile({ category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Business description">
                  <textarea
                    className={inputCls}
                    rows={3}
                    value={p.description}
                    onChange={(e) => setProfile({ description: e.target.value })}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="WhatsApp number">
                    <input
                      className={inputCls}
                      inputMode="tel"
                      placeholder="+263 77 123 4567"
                      value={p.whatsapp}
                      onChange={(e) => setProfile({ whatsapp: e.target.value })}
                    />
                  </Field>
                  <Field label="Contact number">
                    <input
                      className={inputCls}
                      inputMode="tel"
                      placeholder="+263 4 123 456"
                      value={p.phone}
                      onChange={(e) => setProfile({ phone: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Email">
                  <input
                    className={inputCls}
                    type="email"
                    value={p.email}
                    onChange={(e) => setProfile({ email: e.target.value })}
                  />
                </Field>
                <Field label="Business address">
                  <input
                    className={inputCls}
                    value={p.address}
                    onChange={(e) => setProfile({ address: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className={`${cardCls} h-fit`}>
            <h2 className="mb-1 text-base font-semibold">BackPay Configuration</h2>
            <p className="mb-3 text-xs text-muted">
              Current rules, read-only here. Editing them comes in Stage 4 (BackPay),
              because changing a rule has to change every calculation.
            </p>
            <div className="space-y-2 text-sm">
              {[
                ["BackPay", "Enabled"],
                ["Reward percentage", `${BACKPAY_RULES.ratePct}%`],
                ["Minimum purchase", usd(BACKPAY_RULES.minPurchaseCents)],
                ["Maximum reward per sale", usd(BACKPAY_RULES.maxRewardCents)],
                ["Reward expiry", `${BACKPAY_RULES.expiryDays} days`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between rounded-xl bg-surface-alt px-3 py-2"
                >
                  <span className="text-muted">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-surface-alt px-3 py-2 text-xs text-brand-blue">
              Customers earn {BACKPAY_RULES.ratePct}% BackPay on qualifying purchases.
            </p>
          </section>
        </div>
      )}

      {/* ---------- Branches ---------- */}
      {tab === "Branches" && (
        <section className={cardCls}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Branches</h2>
            <button
              className={btnGhost}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  branches: [
                    ...d.branches,
                    { id: newKey(), name: "", address: "", phone: "", active: true },
                  ],
                }))
              }
            >
              + Add branch
            </button>
          </div>
          <div className="space-y-3">
            {draft.branches.map((b, n) => (
              <div key={b.id} className="rounded-xl border border-sage/60 p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Branch name *">
                    <input
                      className={inputCls}
                      value={b.name}
                      onChange={(e) => updBranch(b.id, { name: e.target.value })}
                    />
                  </Field>
                  <Field label="Location / address">
                    <input
                      className={inputCls}
                      value={b.address}
                      onChange={(e) => updBranch(b.id, { address: e.target.value })}
                    />
                  </Field>
                  <Field label="Branch contact">
                    <input
                      className={inputCls}
                      inputMode="tel"
                      value={b.phone}
                      onChange={(e) => updBranch(b.id, { phone: e.target.value })}
                    />
                  </Field>
                </div>
                <Toggle
                  label={`Branch ${n + 1} is ${b.active ? "active" : "inactive"}`}
                  checked={b.active}
                  onChange={(v) => updBranch(b.id, { active: v })}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Branches can be switched off but not deleted, so past sales keep their branch.
          </p>
        </section>
      )}

      {/* ---------- Staff ---------- */}
      {tab === "Staff" && (
        <div className="space-y-5">
          <section className={cardCls}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Staff accounts</h2>
              <button
                className={btnGhost}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    staff: [
                      ...d.staff,
                      { id: newKey(), name: "", phone: "", role: "Cashier", active: true },
                    ],
                  }))
                }
              >
                + Add staff
              </button>
            </div>
            <div className="space-y-3">
              {draft.staff.map((s) => (
                <div key={s.id} className="rounded-xl border border-sage/60 p-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Name *">
                      <input
                        className={inputCls}
                        value={s.name}
                        onChange={(e) => updStaff(s.id, { name: e.target.value })}
                      />
                    </Field>
                    <Field label="WhatsApp / phone">
                      <input
                        className={inputCls}
                        inputMode="tel"
                        value={s.phone}
                        onChange={(e) => updStaff(s.id, { phone: e.target.value })}
                      />
                    </Field>
                    <Field label="Role">
                      <select
                        className={inputCls}
                        value={s.role}
                        onChange={(e) => updStaff(s.id, { role: e.target.value as Role })}
                      >
                        {ROLES.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Toggle
                    label={`Account access is ${s.active ? "on" : "off"}`}
                    checked={s.active}
                    onChange={(v) => updStaff(s.id, { active: v })}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={cardCls}>
            <h2 className="mb-1 text-base font-semibold">Roles and permissions</h2>
            <p className="mb-3 text-xs text-muted">
              Recorded now. Enforcement starts when staff sign-in is built.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="pb-2 font-medium">Permission</th>
                    {ROLES.map((r) => (
                      <th key={r} className="pb-2 text-center font-medium">
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((perm) => (
                    <tr key={perm.label} className="border-t border-sage/40">
                      <td className="py-2">{perm.label}</td>
                      {ROLES.map((r) => (
                        <td key={r} className="py-2 text-center">
                          {perm.roles.includes(r) ? (
                            <span className="font-semibold text-brand-green" aria-label="Allowed">
                              ✓
                            </span>
                          ) : (
                            <span className="text-muted" aria-label="Not allowed">
                              –
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ---------- Receipt Settings ---------- */}
      {tab === "Receipt Settings" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={cardCls}>
            <h2 className="mb-3 text-base font-semibold">Receipt Settings</h2>
            <div className="space-y-3">
              <Field label="Receipt footer message">
                <textarea
                  className={inputCls}
                  rows={3}
                  value={draft.receipt.footer}
                  onChange={(e) => setReceipt({ footer: e.target.value })}
                />
              </Field>
              <Field label="Merchant contact line">
                <input
                  className={inputCls}
                  placeholder="e.g. Call us on +263 4 123 456"
                  value={draft.receipt.contactLine}
                  onChange={(e) => setReceipt({ contactLine: e.target.value })}
                />
              </Field>
            </div>
            <div className="mt-2 divide-y divide-sage/40">
              <Toggle
                label="Show branch name"
                checked={draft.receipt.showBranch}
                onChange={(v) => setReceipt({ showBranch: v })}
              />
              <Toggle
                label="Show BackPay balance"
                checked={draft.receipt.showBackPayBalance}
                onChange={(v) => setReceipt({ showBackPayBalance: v })}
              />
              <Toggle
                label="Show customer registration link"
                checked={draft.receipt.showRegistrationLink}
                onChange={(v) => setReceipt({ showRegistrationLink: v })}
              />
            </div>
            <p className="mt-3 text-xs text-muted">
              Receipts on the Record Sale screen do not use these yet. They will once
              settings are saved in the database.
            </p>
          </section>

          <section className={cardCls}>
            <h2 className="mb-3 text-base font-semibold">Preview</h2>
            <div className="rounded-xl border border-dashed border-sage bg-white p-4 text-center text-sm">
              {p.logoDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.logoDataUrl}
                  alt=""
                  className="mx-auto mb-2 h-12 object-contain"
                />
              )}
              <p className="font-bold">{p.name || "Business name"}</p>
              {draft.receipt.showBranch && firstBranch && (
                <p className="text-xs text-muted">{firstBranch}</p>
              )}
              <div className="my-3 border-t border-dashed border-sage" />
              <p className="text-xs text-muted">Items, total and payment appear here</p>
              {draft.receipt.showBackPayBalance && (
                <p className="mt-2 text-xs font-semibold text-brand-green">
                  BackPay balance: $0.00
                </p>
              )}
              <div className="my-3 border-t border-dashed border-sage" />
              {draft.receipt.contactLine && (
                <p className="text-xs">{draft.receipt.contactLine}</p>
              )}
              <p className="mt-1 text-xs">{draft.receipt.footer}</p>
              {draft.receipt.showRegistrationLink && (
                <p className="mt-2 text-xs text-brand-blue">
                  Register your RETURNi account to unlock your rewards
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ---------- Notifications ---------- */}
      {tab === "Notifications" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={cardCls}>
            <h2 className="mb-1 text-base font-semibold">Customer messaging</h2>
            <p className="mb-2 text-xs text-muted">
              Only customers who agreed to WhatsApp messages are contacted.
            </p>
            <div className="divide-y divide-sage/40">
              <Toggle
                label="Send receipts on WhatsApp"
                checked={draft.notifications.whatsappReceipts}
                onChange={(v) => setNotif({ whatsappReceipts: v })}
              />
              <Toggle
                label="BackPay earned alerts"
                checked={draft.notifications.rewardAlerts}
                onChange={(v) => setNotif({ rewardAlerts: v })}
              />
              <Toggle
                label="BackPay expiry reminders"
                checked={draft.notifications.expiryReminders}
                onChange={(v) => setNotif({ expiryReminders: v })}
              />
              <Toggle
                label="Promotional messages"
                hint="Off by default. Needs separate customer consent."
                checked={draft.notifications.promotionalMessages}
                onChange={(v) => setNotif({ promotionalMessages: v })}
              />
            </div>
          </section>
          <section className={cardCls}>
            <h2 className="mb-2 text-base font-semibold">Merchant alerts</h2>
            <div className="divide-y divide-sage/40">
              <Toggle
                label="Alert me when a new customer joins"
                checked={draft.notifications.newCustomerAlert}
                onChange={(v) => setNotif({ newCustomerAlert: v })}
              />
              <Toggle
                label="Alert me about large BackPay redemptions"
                checked={draft.notifications.largeRedemptionAlert}
                onChange={(v) => setNotif({ largeRedemptionAlert: v })}
              />
            </div>
            <p className="mt-3 text-xs text-muted">
              Preferences are saved. Messages are not sent until WhatsApp is connected.
            </p>
          </section>
        </div>
      )}

      {/* ---------- Security ---------- */}
      {tab === "Security" && (
        <section className={`${cardCls} max-w-xl`}>
          <h2 className="mb-3 text-base font-semibold">Security</h2>
          <Field label="Sign staff out after">
            <select
              className={inputCls}
              value={draft.security.sessionTimeoutMin}
              onChange={(e) => setSec({ sessionTimeoutMin: Number(e.target.value) })}
            >
              {[15, 30, 60, 120].map((m) => (
                <option key={m} value={m}>
                  {m} minutes of inactivity
                </option>
              ))}
            </select>
          </Field>
          <div className="mt-2 divide-y divide-sage/40">
            <Toggle
              label="Require manager approval to reverse a sale"
              checked={draft.security.requireApprovalForReversal}
              onChange={(v) => setSec({ requireApprovalForReversal: v })}
            />
            <Toggle
              label="Hide customer phone numbers from cashiers"
              checked={draft.security.maskPhonesForCashiers}
              onChange={(v) => setSec({ maskPhonesForCashiers: v })}
            />
          </div>
          <p className="mt-3 rounded-xl bg-surface-alt px-3 py-2 text-xs text-brand-blue">
            These options are saved but not enforced yet. Sign-in, passwords and
            enforcement arrive with the backend.
          </p>
        </section>
      )}

      {/* ---------- Integrations ---------- */}
      {tab === "Integrations" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={cardCls}>
            <h2 className="mb-2 text-base font-semibold">Integrations</h2>
            <StatusRow
              name="WhatsApp Business API"
              status="Not connected"
              note="Receipts are simulated. Nothing is sent."
            />
            <StatusRow
              name="SMS / OTP provider"
              status="Not connected"
              note="Needed for customer registration codes."
            />
            <StatusRow
              name="Payment integrations"
              status="Not connected"
              note="EcoCash, card and bank payments are recorded by hand."
            />
            <StatusRow
              name="POS integration"
              status="Planned"
              note="Future release."
            />
          </section>
          <section className={cardCls}>
            <h2 className="mb-2 text-base font-semibold">Account</h2>
            <StatusRow
              name="Subscription"
              status="Pilot"
              note="Billing is not set up yet."
            />
            <StatusRow
              name="API access"
              status="Not available"
              note="API keys are created once the backend exists."
            />
            <p className="mt-3 rounded-xl bg-surface-alt px-3 py-2 text-xs text-brand-blue">
              Integration passwords and keys are never entered in this page. They
              will be stored securely on the server.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { saved, save, loaded } = useSettings();
  if (!loaded) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-muted">Loading…</p>
      </div>
    );
  }
  return <SettingsInner initial={saved} save={save} />;
}