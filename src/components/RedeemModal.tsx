"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { usd } from "@/lib/format";
import { newKey } from "@/lib/sale";
import { OFFERS } from "@/lib/mock";
import {
  findCustomer,
  normalizePhone,
  offerEligibility,
  resolveCustomerInput,
  type Store,
} from "@/lib/engine";
import { btnGhost, btnPrimary, inputCls } from "@/lib/ui";
import type { Offer, RedeemResult, Redemption } from "@/lib/types";

type Step = "find" | "offers" | "confirm" | "done";

export function RedeemModal({
  store,
  initialPhone,
  lockPhone,
  onClose,
  onRedeem,
}: {
  store: Store;
  initialPhone: string;
  lockPhone: boolean; // true when this sale already has a redeemed item
  onClose: () => void;
  onRedeem: (key: string, phone: string, offerId: string) => RedeemResult;
}) {
  const [input, setInput] = useState(initialPhone);
  const [found, setFound] = useState<string | null>(() => {
    const n = normalizePhone(initialPhone);
    return n && findCustomer(store, n) ? n : null;
  });
  const [step, setStep] = useState<Step>(found ? "offers" : "find");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [key, setKey] = useState("");
  const [done, setDone] = useState<Redemption | null>(null);
  const [error, setError] = useState("");

  const customer = found ? findCustomer(store, found) : null;

  function lookup() {
    setError("");
    const phone = resolveCustomerInput(input);
    if (!phone) {
      setError("Enter a valid WhatsApp number or redemption code.");
      return;
    }
    if (lockPhone && phone !== normalizePhone(initialPhone)) {
      setError("This sale already has a redeemed item for another customer.");
      return;
    }
    if (!findCustomer(store, phone)) {
      setError(
        "No RETURNi customer found for this number. Record a sale for them first."
      );
      return;
    }
    setFound(phone);
    setStep("offers");
  }

  function choose(o: Offer) {
    setOffer(o);
    setKey(newKey()); // one key per redemption attempt: double-clicks cannot double-charge
    setError("");
    setStep("confirm");
  }

  function confirm() {
    if (!found || !offer) return;
    const res = onRedeem(key, found, offer.id);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(res.redemption);
    setStep("done");
  }

  const activeOffers = OFFERS.filter((o) => o.active);

  return (
    <Modal title="Redeem BackPay" onClose={onClose} wide>
      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "find" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Customer WhatsApp number or redemption code
            <input
              className={`${inputCls} mt-1`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              placeholder="+263 77 123 4567 or BP-7X2K-9F"
              autoFocus
            />
          </label>
          <p className="text-xs text-muted">
            Camera scanning of codes comes with the mobile version. For now, type
            the code. Demo code: BP-7X2K-9F.
          </p>
          <button className={btnPrimary} onClick={lookup}>
            Find customer
          </button>
        </div>
      )}

      {step === "offers" && customer && (
        <div className="space-y-4">
          <div className="rounded-xl bg-surface-alt p-3">
            <p className="font-semibold">{customer.name}</p>
            <p className="text-xs text-muted">
              {customer.phone} ·{" "}
              {customer.registered ? "Registered" : "Not registered"}
            </p>
            <p className="mt-2 text-sm">
              Available BackPay:{" "}
              <span className="text-lg font-bold text-brand-green">
                {usd(customer.backpayCents)}
              </span>
            </p>
          </div>

          <p className="text-sm font-medium">Available RETURNi Prices</p>
          <ul className="space-y-2">
            {activeOffers.map((o) => {
              const el = offerEligibility(customer, o);
              return (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-sage/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.name}</p>
                    <p className="text-xs text-muted">
                      <span className="line-through">{usd(o.standardCents)}</span>{" "}
                      <span className="font-semibold text-brand-green">
                        {usd(o.returniCents)}
                      </span>{" "}
                      · costs {usd(o.backpayCostCents)} BackPay
                    </p>
                    {!el.ok && (
                      <p className="mt-0.5 text-xs text-red-600">{el.reason}</p>
                    )}
                  </div>
                  <button
                    className={btnPrimary}
                    disabled={!el.ok}
                    onClick={() => choose(o)}
                  >
                    Select
                  </button>
                </li>
              );
            })}
          </ul>

          {!lockPhone && (
            <button
              className="text-sm font-medium text-brand-blue underline"
              onClick={() => {
                setFound(null);
                setStep("find");
              }}
            >
              Use a different customer
            </button>
          )}
        </div>
      )}

      {step === "confirm" && customer && offer && (
        <div className="space-y-4">
          <div className="space-y-2 rounded-xl bg-surface-alt p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Offer</span>
              <span className="font-semibold">{offer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">RETURNi Price</span>
              <span className="font-semibold text-brand-green">
                {usd(offer.returniCents)}{" "}
                <span className="font-normal text-muted line-through">
                  {usd(offer.standardCents)}
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">BackPay to deduct</span>
              <span className="font-semibold">-{usd(offer.backpayCostCents)}</span>
            </div>
            <div className="flex justify-between border-t border-sage/60 pt-2">
              <span className="text-muted">Balance after</span>
              <span className="font-semibold">
                {usd(customer.backpayCents)} →{" "}
                {usd(customer.backpayCents - offer.backpayCostCents)}
              </span>
            </div>
          </div>
          <p className="text-sm">
            Ask <b>{customer.name}</b> to confirm they want to use{" "}
            {usd(offer.backpayCostCents)} of their BackPay for this price. This
            cannot be undone.
          </p>
          <div className="flex gap-2">
            <button className={btnPrimary} onClick={confirm}>
              Confirm redemption
            </button>
            <button className={btnGhost} onClick={() => setStep("offers")}>
              Back
            </button>
          </div>
        </div>
      )}

      {step === "done" && done && customer && (
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold text-brand-green">
            Redemption successful
          </p>
          <div className="rounded-2xl bg-surface-alt p-5">
            <p className="text-xs text-muted">Unlocked RETURNi Price</p>
            <p className="mt-1 text-lg font-bold">{done.offerName}</p>
            <p className="text-3xl font-bold text-brand-green">
              {usd(done.returniCents)}
            </p>
            <p className="mt-3 text-xs text-muted">Redemption reference</p>
            <p className="font-mono text-sm font-semibold">{done.ref}</p>
          </div>
          <p className="text-sm">
            {usd(done.costCents)} BackPay deducted. New balance:{" "}
            <b>{usd(customer.backpayCents)}</b>.
          </p>
          <p className="text-xs text-muted">
            The item was added to the current sale at the RETURNi Price.
          </p>
          <button className={btnPrimary} onClick={onClose}>
            Back to sale
          </button>
        </div>
      )}
    </Modal>
  );
}