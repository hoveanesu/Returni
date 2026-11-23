"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { normalizeZwPhone, maskPhone } from "@/lib/phone";
import { inputCls, btnPrimary, card } from "@/lib/ui";

type Step = "phone" | "otp" | "done";
const DEMO_CODE = "123456";

export default function JoinPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [normalized, setNormalized] = useState("");
  const [code, setCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    const n = normalizeZwPhone(phone);
    if (!n) return setError("Enter a valid Zimbabwe mobile number, for example 0771234567.");
    setError(null);
    setNormalized(n);
    setStep("otp");
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code !== DEMO_CODE) return setError("That code is not right. Try again.");
    if (!agree) return setError("Please accept the terms to continue.");
    setError(null);
    setStep("done");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <Link href="/"><Logo className="text-xl" /></Link>

      {step !== "done" && (
        <div className="mt-6 rounded-2xl bg-brand-navy p-5 text-white">
          <p className="text-sm text-sage">Gold Drop</p>
          <h1 className="mt-1 text-2xl font-bold">Enter this week&apos;s draw</h1>
          <p className="mt-2 text-sm">
            You have <strong>3 entries</strong> waiting and <strong>$0.75</strong> BackPay. Create your free account to claim them.
          </p>
        </div>
      )}

      {step === "phone" && (
        <form onSubmit={sendCode} className={`${card} mt-4 space-y-4`}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Your WhatsApp number</span>
            <input className={inputCls} inputMode="tel" placeholder="0771234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button className={btnPrimary} type="submit">Send me a code</button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verify} className={`${card} mt-4 space-y-4`}>
          <p className="text-sm">
            We sent a 6-digit code to WhatsApp on <strong>{maskPhone(normalized)}</strong>.
          </p>
          <p className="text-xs text-muted">Demo: use code {DEMO_CODE}</p>
          <input className={`${inputCls} text-center text-xl tracking-widest`} inputMode="numeric" maxLength={6} placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value)} />
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-brand-green" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I agree to the terms and to receive receipts and rewards on WhatsApp. I can reply STOP at any time.</span>
          </label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button className={btnPrimary} type="submit">Create my account</button>
        </form>
      )}

      {step === "done" && (
        <div className={`${card} mt-6 space-y-3 border-brand-green text-center`}>
          <p className="text-3xl">🎉</p>
          <h1 className="text-2xl font-bold">You&apos;re in!</h1>
          <p className="text-sm text-muted">
            Your 3 entries are now active for this week&apos;s Gold Drop. We will message you on WhatsApp if you win.
          </p>
          <Link href="/" className={`${btnPrimary} block text-center`}>Back to start</Link>
        </div>
      )}
    </main>
  );
}