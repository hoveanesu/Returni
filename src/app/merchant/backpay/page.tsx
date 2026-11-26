"use client";

import { useState } from "react";
import { LIMITS, MOCK_MERCHANT } from "@/lib/mock";
import { usd } from "@/lib/format";
import { btnPrimary, card } from "@/lib/ui";

export default function SettingsPage() {
  const [rate, setRate] = useState(MOCK_MERCHANT.ratePct);
  const [days, setDays] = useState(MOCK_MERCHANT.expiryDays);
  const [saved, setSaved] = useState(false);

  const example = Math.floor((1000 * rate) / 100);

  return (
    <div className={`${card} space-y-6`}>
      <div>
        <h1 className="text-xl font-semibold">BackPay settings</h1>
        <p className="mt-1 text-sm text-muted">
          You decide how much BackPay your customers earn and how long it lasts, within RETURNi&apos;s limits.
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">BackPay percentage</span>
          <span className="text-2xl font-bold text-brand-green">{rate}%</span>
        </div>
        <input
          type="range"
          className="mt-2 w-full accent-brand-green"
          min={LIMITS.rateMinPct}
          max={LIMITS.rateMaxPct}
          step={0.5}
          value={rate}
          onChange={(e) => { setRate(Number(e.target.value)); setSaved(false); }}
        />
        <p className="text-xs text-muted">Allowed: {LIMITS.rateMinPct}% to {LIMITS.rateMaxPct}%</p>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">BackPay expires after</span>
          <span className="text-2xl font-bold text-brand-blue">{days} days</span>
        </div>
        <input
          type="range"
          className="mt-2 w-full accent-brand-blue"
          min={LIMITS.expiryMinDays}
          max={LIMITS.expiryMaxDays}
          step={5}
          value={days}
          onChange={(e) => { setDays(Number(e.target.value)); setSaved(false); }}
        />
        <p className="text-xs text-muted">Allowed: {LIMITS.expiryMinDays} to {LIMITS.expiryMaxDays} days</p>
      </div>

      <div className="rounded-xl bg-surface-alt p-4 text-sm">
        <p className="font-medium">Preview</p>
        <p className="mt-1">
          A customer spends <strong>$10.00</strong> and earns <strong>{usd(example)}</strong> BackPay,
          valid for <strong>{days} days</strong>.
        </p>
        <p className="mt-2 text-xs text-muted">Changes apply to future purchases only.</p>
      </div>

      {saved && <p className="rounded-xl bg-brand-green/10 px-4 py-3 text-sm text-brand-green">Saved (demo only)</p>}
      <button className={btnPrimary} onClick={() => setSaved(true)}>Save settings</button>
    </div>
  );
}