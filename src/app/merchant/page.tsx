"use client";

import { useState } from "react";
import { MOCK_MERCHANT } from "@/lib/mock";
import { normalizeZwPhone } from "@/lib/phone";
import { usd, addDays, fmtDate } from "@/lib/format";
import { inputCls, btnPrimary, card } from "@/lib/ui";

type Result = {
  receiptNo: string;
  phone: string;
  totalCents: number;
  backpayCents: number;
  expires: string;
};

export default function RecordSalePage() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [counter, setCounter] = useState(124);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeZwPhone(phone);
    const totalCents = Math.round(parseFloat(amount) * 100);
    if (!normalized) return setError("Enter a valid Zimbabwe mobile number, for example 0771234567.");
    if (!Number.isFinite(totalCents) || totalCents <= 0) return setError("Enter the sale amount in USD.");
    if (!consent) return setError("The customer must agree to receive their receipt on WhatsApp.");
    setError(null);
    const backpayCents = Math.floor((totalCents * MOCK_MERCHANT.ratePct) / 100);
    setResult({
      receiptNo: `R-${String(counter).padStart(6, "0")}`,
      phone: normalized,
      totalCents,
      backpayCents,
      expires: fmtDate(addDays(MOCK_MERCHANT.expiryDays)),
    });
    setCounter((c) => c + 1);
  }

  function reset() {
    setPhone("");
    setAmount("");
    setConsent(true);
    setResult(null);
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className={`${card} border-brand-green`}>
          <p className="text-sm font-semibold text-brand-green">Receipt sent (demo)</p>
          <p className="mt-1 text-sm text-muted">
            {result.phone} · {result.receiptNo}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-alt p-4 text-sm leading-relaxed">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            What the customer sees on WhatsApp
          </p>
          <p>Thank you for shopping at {MOCK_MERCHANT.name}!</p>
          <p>Receipt {result.receiptNo}</p>
          <p>Total: {usd(result.totalCents)}</p>
          <p>
            You earned {usd(result.backpayCents)} BackPay and 1 Gold Drop entry.
          </p>
          <p>BackPay expires {result.expires}.</p>
          <p className="mt-2 text-brand-blue">
            Create your free account to enter this week&apos;s Gold Drop: returni.example/join
          </p>
        </div>

        <button onClick={reset} className={btnPrimary}>Record another sale</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`${card} space-y-4`}>
      <h1 className="text-xl font-semibold">Record a sale</h1>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Customer WhatsApp number</span>
        <input
          className={inputCls}
          inputMode="tel"
          placeholder="0771234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Sale amount (USD)</span>
        <input
          className={inputCls}
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 accent-brand-green"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>Customer agrees to receive their receipt and rewards on WhatsApp</span>
      </label>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button type="submit" className={btnPrimary}>Send receipt</button>
      <p className="text-center text-xs text-muted">
        BackPay rate: {MOCK_MERCHANT.ratePct}% · expires after {MOCK_MERCHANT.expiryDays} days
      </p>
    </form>
  );
}