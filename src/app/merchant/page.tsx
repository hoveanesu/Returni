"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { Modal } from "@/components/Modal";
import { Receipt } from "@/components/Receipt";
import { RedeemModal } from "@/components/RedeemModal";
import { RecentTransactions } from "@/components/RecentTransactions";
import { ReceiptMessageStatus } from "@/components/ReceiptMessageStatus";
import { queueReceipt, type QueueResult } from "@/lib/messaging/client";
import { fmtDateTime, usd } from "@/lib/format";
import { BACKPAY_RULES, CATALOG, MOCK_MERCHANT, PAYMENT_METHODS } from "@/lib/mock";
import { lineTotal, newKey, receiptFromTx } from "@/lib/sale";
import {
  completeSale,
  computeSale,
  findCustomer,
  nextReceiptNo,
  normalizePhone,
  redeemOffer,
  validateSale,
} from "@/lib/engine";
import { btnGhost, btnPrimary, cardCls, inputCls } from "@/lib/ui";
import type { ReceiptData, RedeemResult, SaleItem } from "@/lib/types";

function RecordSaleInner() {
  // Shared demo store (also read by Analytics and Gold Drop)
  const { store, storeRef, commit } = useStore();

  // Sale form
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discountStr, setDiscountStr] = useState("");
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [refInput, setRefInput] = useState("");
  const [saleKey, setSaleKey] = useState(newKey);

  // Add-item controls
  const [productId, setProductId] = useState(CATALOG[0].id);
  const [addQty, setAddQty] = useState(1);
  const [custom, setCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [showRedeem, setShowRedeem] = useState(false);
  const [preview, setPreview] = useState<ReceiptData | null>(null);
  const [done, setDone] = useState<ReceiptData | null>(null);
  const [msg, setMsg] = useState<QueueResult | null>(null);

  const normPhone = normalizePhone(phone);
  const customer = normPhone ? findCustomer(store, normPhone) : null;
  const hasRedeemed = items.some((i) => i.redemptionRef);
  const discountCents = Math.max(0, Math.round((parseFloat(discountStr) || 0) * 100));
  const calc = computeSale(
    store,
    { phone: normPhone ?? "", items, discountCents },
    customer?.registered ?? false
  );

  const status = !phone.trim()
    ? { text: "Enter the customer's WhatsApp number", cls: "text-muted" }
    : !normPhone
      ? { text: "Number not valid yet", cls: "text-red-600" }
      : customer?.registered
        ? { text: "Existing customer · Registered", cls: "text-brand-green" }
        : customer
          ? { text: "Existing customer · Not registered yet", cls: "text-brand-blue" }
          : { text: "New customer", cls: "text-brand-blue" };

  /* ---- phone ---- */
  function onPhone(v: string) {
    setPhone(v);
    const n = normalizePhone(v);
    const c = n ? findCustomer(storeRef.current, n) : null;
    if (c?.registered) setConsent(true);
  }

  /* ---- items ---- */
  function addItem() {
    setError("");
    let itemName = "";
    let category = "";
    let unit = 0;
    if (custom) {
      itemName = customName.trim();
      category = customCategory.trim() || "General";
      unit = Math.round(parseFloat(customPrice) * 100);
      if (!itemName || !Number.isFinite(unit) || unit <= 0) {
        setError("Enter an item name and a price above zero.");
        return;
      }
    } else {
      const p = CATALOG.find((x) => x.id === productId);
      if (!p) {
        setError("Choose a product or service.");
        return;
      }
      itemName = p.name;
      category = p.category;
      unit = p.priceCents;
    }
    const q = Math.min(999, Math.max(1, Math.floor(addQty) || 1));
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => !i.redemptionRef && i.name === itemName && i.unitCents === unit
      );
      if (idx >= 0) {
        return prev.map((i, n) =>
          n === idx ? { ...i, qty: Math.min(999, i.qty + q) } : i
        );
      }
      return [...prev, { id: newKey(), name: itemName, category, qty: q, unitCents: unit }];
    });
    setAddQty(1);
    setCustomName("");
    setCustomCategory("");
    setCustomPrice("");
  }

  function changeQty(id: string, delta: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && !i.redemptionRef
          ? { ...i, qty: Math.min(999, Math.max(1, i.qty + delta)) }
          : i
      )
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id || i.redemptionRef));
  }

  /* ---- redemption ---- */
  function handleRedeem(key: string, p: string, offerId: string): RedeemResult {
    const { store: next, result } = redeemOffer(storeRef.current, {
      key,
      phone: p,
      offerId,
    });
    if (result.ok) {
      commit(next);
      const r = result.redemption;
      setPhone((prev) => (normalizePhone(prev) === r.phone ? prev : r.phone));
      setConsent(true);
      setItems((prev) =>
        prev.some((i) => i.redemptionRef === r.ref)
          ? prev
          : [
              ...prev,
              {
                id: newKey(),
                name: `${r.offerName} (RETURNi Price)`,
                category:
                  CATALOG.find((c) => c.name === r.offerName)?.category ??
                  "RETURNi Price",
                qty: 1,
                unitCents: r.returniCents,
                redemptionRef: r.ref,
              },
            ]
      );
    }
    return result;
  }

  /* ---- receipt preview and completion ---- */
  const buildInput = () => ({
    phone: normPhone ?? "",
    name,
    consent,
    items,
    discountCents,
    method,
    ref: refInput,
    key: saleKey,
  });

  function openPreview() {
    setError("");
    const input = buildInput();
    const problem = validateSale(storeRef.current, input);
    if (problem) {
      setError(problem);
      return;
    }
    const c = computeSale(storeRef.current, input, customer?.registered ?? false);
    setPreview({
      merchant: MOCK_MERCHANT.name,
      branch: MOCK_MERCHANT.branch,
      receiptNo: nextReceiptNo(storeRef.current),
      ref: refInput.trim() || "Assigned when the sale is completed",
      dateTime: fmtDateTime(new Date()),
      customerName: customer?.name ?? (name.trim() || "New customer"),
      phone: normPhone ?? phone,
      registered: customer?.registered ?? false,
      items,
      subtotalCents: c.subtotalCents,
      discountCents: c.discountCents,
      totalCents: c.totalCents,
      method,
      backpayEarnedCents: c.earnedCents,
      backpayRedeemedCents: c.redeemedCents,
      balanceAfterCents: c.balanceAfterCents,
      expiresAt: c.expiresAt,
      redemptionRefs: c.redemptionRefs,
      goldDropEntry: c.goldDrop,
      isPreview: true,
    });
  }

  function handleComplete() {
    setError("");
    const { store: next, result } = completeSale(storeRef.current, buildInput());
    if (!result.ok) {
      setPreview(null);
      setError(result.error);
      return;
    }
    commit(next);
    setPreview(null);
    setDone(receiptFromTx(result.tx));
    // Queue the WhatsApp receipt. The sale is already saved, so a messaging
    // problem never undoes it.
    setMsg(null);
    void queueReceipt(result.tx, consent).then(setMsg);
    // Reset the form for the next sale
    setPhone("");
    setName("");
    setConsent(false);
    setItems([]);
    setDiscountStr("");
    setMethod(PAYMENT_METHODS[0]);
    setRefInput("");
    setSaleKey(newKey());
  }

  function clearSale() {
    // Redeemed items stay: that BackPay is already spent
    setItems((prev) => prev.filter((i) => i.redemptionRef));
    setDiscountStr("");
    setError("");
  }

  const canSubmit = items.length > 0 && !!normPhone && consent;

  return (
    <div>
      <h1 className="text-2xl font-bold">Record Sale</h1>
      <p className="mb-5 text-sm text-muted">
        Capture a sale and send a smart receipt to your customer
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* LEFT: customer + items */}
        <div className="space-y-5">
          <section className={cardCls}>
            <h2 className="mb-3 text-base font-semibold">Customer Details</h2>
            <label className="block text-sm font-medium">
              Customer WhatsApp number
              <input
                className={`${inputCls} mt-1`}
                value={phone}
                onChange={(e) => onPhone(e.target.value)}
                placeholder="+263 77 123 4567"
                inputMode="tel"
                disabled={hasRedeemed}
              />
            </label>
            <p className={`mt-1.5 text-xs font-medium ${status.cls}`}>{status.text}</p>

            {customer && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-alt px-3 py-2 text-sm">
                <span className="font-semibold">{customer.name}</span>
                <span className="text-muted">
                  {customer.purchases} purchases · BackPay{" "}
                  <b className="text-brand-green">{usd(customer.backpayCents)}</b>
                </span>
              </div>
            )}

            {!customer && normPhone && (
              <label className="mt-3 block text-sm font-medium">
                Customer name (optional)
                <input
                  className={`${inputCls} mt-1`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="New customer"
                />
              </label>
            )}

            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-brand-green"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                Customer agrees to receive their receipt and RETURNi rewards via
                WhatsApp
              </span>
            </label>
          </section>

          <section className={cardCls}>
            <h2 className="mb-3 text-base font-semibold">Items Purchased</h2>

            {items.length === 0 ? (
              <p className="rounded-xl bg-surface-alt p-5 text-center text-sm text-muted">
                No items yet. Add the first item below.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[460px] text-left text-sm">
                  <thead className="text-xs text-muted">
                    <tr>
                      <th className="pb-2 font-medium">Item</th>
                      <th className="pb-2 text-center font-medium">Qty</th>
                      <th className="pb-2 text-right font-medium">Unit price</th>
                      <th className="pb-2 text-right font-medium">Total</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id} className="border-t border-sage/40">
                        <td className="py-2">
                          <p className="font-medium">{i.name}</p>
                          <p className="text-xs text-muted">
                            {i.redemptionRef
                              ? `Unlocked with BackPay · ${i.redemptionRef}`
                              : i.category}
                          </p>
                        </td>
                        <td className="py-2 text-center">
                          {i.redemptionRef ? (
                            <span>1</span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <button
                                aria-label={`Decrease ${i.name}`}
                                className="h-7 w-7 rounded-lg border border-sage/70 hover:bg-surface-alt"
                                onClick={() => changeQty(i.id, -1)}
                              >
                                −
                              </button>
                              <span className="w-7 text-center">{i.qty}</span>
                              <button
                                aria-label={`Increase ${i.name}`}
                                className="h-7 w-7 rounded-lg border border-sage/70 hover:bg-surface-alt"
                                onClick={() => changeQty(i.id, 1)}
                              >
                                +
                              </button>
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-right">{usd(i.unitCents)}</td>
                        <td className="py-2 text-right font-medium">
                          {usd(lineTotal(i))}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          {i.redemptionRef ? (
                            <span className="text-xs text-muted" title="Already redeemed">
                              Locked
                            </span>
                          ) : (
                            <button
                              aria-label={`Remove ${i.name}`}
                              className="text-sm text-red-600 hover:underline"
                              onClick={() => removeItem(i.id)}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add item */}
            <div className="mt-4 rounded-xl border border-dashed border-sage p-3">
              <div className="flex flex-wrap items-end gap-2">
                {!custom ? (
                  <label className="min-w-[180px] flex-1 text-xs font-medium">
                    Product or service
                    <select
                      className={`${inputCls} mt-1`}
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    >
                      {CATALOG.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {usd(p.priceCents)} ({p.category})
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <>
                    <label className="min-w-[140px] flex-1 text-xs font-medium">
                      Item name
                      <input
                        className={`${inputCls} mt-1`}
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                      />
                    </label>
                    <label className="w-32 text-xs font-medium">
                      Category
                      <input
                        className={`${inputCls} mt-1`}
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="General"
                      />
                    </label>
                    <label className="w-24 text-xs font-medium">
                      Price ($)
                      <input
                        className={`${inputCls} mt-1`}
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        inputMode="decimal"
                        placeholder="0.00"
                      />
                    </label>
                  </>
                )}
                <label className="w-20 text-xs font-medium">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={999}
                    className={`${inputCls} mt-1`}
                    value={addQty}
                    onChange={(e) => setAddQty(parseInt(e.target.value, 10) || 1)}
                  />
                </label>
                <button className={btnGhost} onClick={addItem}>
                  + Add item
                </button>
              </div>
              <button
                className="mt-2 text-xs font-medium text-brand-blue underline"
                onClick={() => setCustom((v) => !v)}
              >
                {custom ? "Choose from catalogue instead" : "Item not listed? Add a custom item"}
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-sm font-medium">
                Discount ($)
                <input
                  className={`${inputCls} mt-1`}
                  value={discountStr}
                  onChange={(e) => setDiscountStr(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                />
              </label>
              <label className="text-sm font-medium">
                Payment method
                <select
                  className={`${inputCls} mt-1`}
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Transaction ref (optional)
                <input
                  className={`${inputCls} mt-1`}
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="Auto-generated"
                />
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT: summary */}
        <aside className="h-fit space-y-3 rounded-2xl border border-sage/60 bg-surface-alt p-5 lg:sticky lg:top-6">
          <h2 className="text-base font-semibold">Transaction Summary</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{usd(calc.subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Discount</span>
              <span>-{usd(calc.discountCents)}</span>
            </div>
            <div className="flex justify-between border-t border-sage/60 pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{usd(calc.totalCents)}</span>
            </div>
          </div>

          <div className="space-y-1.5 rounded-xl bg-surface p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">BackPay earned ({BACKPAY_RULES.ratePct}%)</span>
              <span className="font-semibold text-brand-green">
                +{usd(calc.earnedCents)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Current balance</span>
              <span>{usd(calc.balanceBeforeCents)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>New balance</span>
              <span>{usd(calc.balanceAfterCents)}</span>
            </div>
            <p className="pt-1 text-xs text-muted">
              {calc.expiresAt
                ? `Expires ${new Date(calc.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                : "No BackPay on this sale yet"}
            </p>
            {calc.belowMinimum && (
              <p className="text-xs text-brand-blue">
                Minimum qualifying purchase is {usd(BACKPAY_RULES.minPurchaseCents)}.
              </p>
            )}
            {calc.capped && (
              <p className="text-xs text-brand-blue">
                Reward capped at {usd(BACKPAY_RULES.maxRewardCents)} per sale.
              </p>
            )}
            {calc.redeemedCents > 0 && (
              <p className="text-xs text-muted">
                Includes {usd(calc.redeemedCents)} BackPay already redeemed on this sale.
              </p>
            )}
          </div>

          <button
            className="w-full rounded-xl border-2 border-brand-green bg-surface px-4 py-3 text-sm font-bold text-brand-green hover:bg-white"
            onClick={() => setShowRedeem(true)}
          >
            Redeem BackPay
          </button>
          <button className={`${btnPrimary} w-full`} disabled={!canSubmit} onClick={openPreview}>
            Preview &amp; complete sale
          </button>
          <button
            className={`${btnGhost} w-full`}
            disabled={items.length === 0}
            onClick={clearSale}
          >
            Clear sale
          </button>
          {!canSubmit && (
            <p className="text-xs text-muted">
              To complete a sale: add an item, enter a valid number and tick the
              consent box.
            </p>
          )}
        </aside>
      </div>

      <RecentTransactions transactions={store.transactions} />

      {showRedeem && (
        <RedeemModal
          store={store}
          initialPhone={phone}
          lockPhone={hasRedeemed}
          onClose={() => setShowRedeem(false)}
          onRedeem={handleRedeem}
        />
      )}

      {preview && (
        <Modal title="Receipt preview" onClose={() => setPreview(null)}>
          <Receipt data={preview} />
          <div className="mt-4 flex gap-2">
            <button className={btnPrimary} onClick={handleComplete}>
              Complete sale
            </button>
            <button className={btnGhost} onClick={() => setPreview(null)}>
              Back to edit
            </button>
          </div>
        </Modal>
      )}

      {done && (
        <Modal title="Sale completed" onClose={() => setDone(null)}>
                    <ReceiptMessageStatus result={msg} />
          <Receipt data={done} />
          <button className={`${btnPrimary} mt-4 w-full`} onClick={() => setDone(null)}>
            Record another sale
          </button>
        </Modal>
      )}
    </div>
  );
}

export default function RecordSalePage() {
  const { loaded } = useStore();

  if (!loaded) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Record Sale</h1>
        <p className="mt-2 text-sm text-muted">Loading…</p>
      </div>
    );
  }
  return <RecordSaleInner />;
}