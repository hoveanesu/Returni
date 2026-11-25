import {
    BACKPAY_RULES,
    CUSTOMERS,
    DEMO_CODES,
    INITIAL_TRANSACTIONS,
    OFFERS,
    PAYMENT_METHODS,
  } from "./mock";
  import { addDays, usd } from "./format";
  import {
    calcBackPay,
    newKey,
    newRef,
    qualifyingOf,
    rawBackPay,
    receiptNoOf,
    subtotalOf,
  } from "./sale";
  import type {
    Customer,
    GoldDropStatus,
    LedgerEntry,
    Offer,
    RedeemResult,
    Redemption,
    SaleItem,
    Transaction,
  } from "./types";
  
  export type Store = {
    customers: Customer[];
    transactions: Transaction[]; // newest first
    redemptions: Redemption[];
    ledger: LedgerEntry[];
  };
  
  export function createStore(): Store {
    return {
      customers: CUSTOMERS.map((c) => ({ ...c })),
      transactions: [...INITIAL_TRANSACTIONS],
      redemptions: [],
      ledger: [],
    };
  }
  
  /* ---------- Customer lookup ---------- */
  
  export function normalizePhone(input: string): string | null {
    const digits = input.replace(/\D/g, "");
    let national = digits;
    if (digits.startsWith("263")) national = digits.slice(3);
    else if (digits.startsWith("0")) national = digits.slice(1);
    return national.length === 9 ? `+263${national}` : null;
  }
  
  // Accepts a WhatsApp number OR a redemption code
  export function resolveCustomerInput(input: string): string | null {
    const code = input.trim().toUpperCase();
    if (DEMO_CODES[code]) return DEMO_CODES[code];
    return normalizePhone(input);
  }
  
  export function findCustomer(store: Store, phone: string): Customer | null {
    return store.customers.find((c) => c.phone === phone) ?? null;
  }
  
  /* ---------- Redemption ---------- */
  
  export function offerEligibility(
    customer: Customer,
    offer: Offer
  ): { ok: boolean; reason?: string } {
    if (!offer.active) return { ok: false, reason: "Offer is not active" };
    if (!customer.registered)
      return { ok: false, reason: "Customer must register first" };
    if (customer.backpayCents < offer.backpayCostCents)
      return {
        ok: false,
        reason: `Needs ${usd(offer.backpayCostCents - customer.backpayCents)} more BackPay`,
      };
    return { ok: true };
  }
  
  export function redeemOffer(
    store: Store,
    input: { key: string; phone: string; offerId: string }
  ): { store: Store; result: RedeemResult } {
    // Idempotency: the same key can never be charged twice
    const existing = store.redemptions.find((r) => r.key === input.key);
    if (existing) return { store, result: { ok: true, redemption: existing } };
  
    const fail = (error: string) => ({
      store,
      result: { ok: false, error } as RedeemResult,
    });
  
    const customer = findCustomer(store, input.phone);
    if (!customer) return fail("Customer not found.");
    const offer = OFFERS.find((o) => o.id === input.offerId);
    if (!offer) return fail("Offer not found.");
  
    const check = offerEligibility(customer, offer);
    if (!check.ok) return fail(check.reason ?? "Not eligible.");
  
    const createdAt = new Date().toISOString();
    const redemption: Redemption = {
      ref: newRef("RDM"),
      key: input.key,
      phone: customer.phone,
      offerId: offer.id,
      offerName: offer.name,
      costCents: offer.backpayCostCents,
      returniCents: offer.returniCents,
      createdAt,
    };
    const entry: LedgerEntry = {
      id: newKey(),
      phone: customer.phone,
      type: "redeem",
      amountCents: -offer.backpayCostCents,
      ref: redemption.ref,
      createdAt,
    };
  
    return {
      store: {
        ...store,
        customers: store.customers.map((c) =>
          c.phone === customer.phone
            ? { ...c, backpayCents: c.backpayCents - offer.backpayCostCents }
            : c
        ),
        redemptions: [redemption, ...store.redemptions],
        ledger: [entry, ...store.ledger],
      },
      result: { ok: true, redemption },
    };
  }
  
  /* ---------- Sale calculation ---------- */
  
  export type SaleInput = {
    phone: string;
    items: SaleItem[];
    discountCents: number;
  };
  
  export type SaleCalc = {
    subtotalCents: number;
    discountCents: number;
    totalCents: number;
    qualifyingCents: number;
    earnedCents: number;
    capped: boolean;
    belowMinimum: boolean;
    redeemedCents: number;
    redemptionRefs: string[];
    balanceBeforeCents: number;
    balanceAfterCents: number;
    goldDrop: GoldDropStatus;
    expiresAt: string | null;
  };
  
  export function computeSale(
    store: Store,
    input: SaleInput,
    registered: boolean
  ): SaleCalc {
    const subtotalCents = subtotalOf(input.items);
    const discountCents = Math.min(
      Math.max(0, Math.round(input.discountCents || 0)),
      subtotalCents
    );
    const totalCents = subtotalCents - discountCents;
    const qualifyingCents = Math.max(0, qualifyingOf(input.items) - discountCents);
    const earnedCents = calcBackPay(qualifyingCents);
    const belowMinimum =
      qualifyingCents > 0 && qualifyingCents < BACKPAY_RULES.minPurchaseCents;
    const capped = earnedCents > 0 && rawBackPay(qualifyingCents) > earnedCents;
  
    const redemptionRefs = input.items
      .map((i) => i.redemptionRef)
      .filter((r): r is string => !!r);
    const redeemedCents = store.redemptions
      .filter((r) => redemptionRefs.includes(r.ref))
      .reduce((s, r) => s + r.costCents, 0);
  
    const customer = findCustomer(store, input.phone);
    const balanceBeforeCents = customer?.backpayCents ?? 0;
  
    const goldDrop: GoldDropStatus =
      totalCents >= BACKPAY_RULES.goldDropMinCents
        ? registered
          ? "active"
          : "pending"
        : "none";
  
    return {
      subtotalCents,
      discountCents,
      totalCents,
      qualifyingCents,
      earnedCents,
      capped,
      belowMinimum,
      redeemedCents,
      redemptionRefs,
      balanceBeforeCents,
      balanceAfterCents: balanceBeforeCents + earnedCents,
      goldDrop,
      expiresAt:
        earnedCents > 0 ? addDays(BACKPAY_RULES.expiryDays).toISOString() : null,
    };
  }
  
  export function nextReceiptNo(store: Store): string {
    const max = store.transactions.reduce(
      (m, t) => Math.max(m, parseInt(t.receiptNo.replace(/\D/g, ""), 10) || 0),
      0
    );
    return receiptNoOf(max + 1);
  }
  
  /* ---------- Sale completion ---------- */
  
  export type CompleteInput = SaleInput & {
    key: string;
    name: string;
    consent: boolean;
    method: string;
    ref: string;
  };
  
  export function validateSale(store: Store, input: CompleteInput): string | null {
    if (input.items.length === 0) return "Add at least one item.";
    if (!normalizePhone(input.phone))
      return "Enter a valid customer WhatsApp number.";
    if (!input.consent)
      return "Confirm the customer agrees to receive their receipt and rewards on WhatsApp.";
    if (!PAYMENT_METHODS.includes(input.method)) return "Choose a payment method.";
  
    for (const i of input.items) {
      if (!i.name.trim()) return "Every item needs a name.";
      if (!Number.isInteger(i.qty) || i.qty < 1 || i.qty > 999)
        return `Quantity for "${i.name}" must be a whole number from 1 to 999.`;
      if (!Number.isInteger(i.unitCents) || i.unitCents <= 0)
        return `Price for "${i.name}" must be above zero.`;
    }
  
    if (subtotalOf(input.items) < Math.round(input.discountCents || 0))
      return "The discount cannot be more than the subtotal.";
  
    const ref = input.ref.trim();
    if (ref && store.transactions.some((t) => t.ref.toLowerCase() === ref.toLowerCase()))
      return "That transaction reference is already used.";
  
    // Redeemed lines: must be real, belong to this customer, be unused and priced correctly
    for (const i of input.items) {
      if (!i.redemptionRef) continue;
      const r = store.redemptions.find((x) => x.ref === i.redemptionRef);
      if (!r) return "A redeemed item has an unknown redemption reference.";
      if (r.phone !== input.phone)
        return "A redeemed item belongs to a different customer.";
      if (store.transactions.some((t) => t.redemptionRefs.includes(r.ref)))
        return "A redemption has already been used on another sale.";
      if (i.qty !== 1 || i.unitCents !== r.returniCents)
        return "A redeemed item does not match its RETURNi Price.";
    }
    return null;
  }
  
  export type SaleResult =
    | { ok: true; tx: Transaction; duplicate: boolean }
    | { ok: false; error: string };
  
  export function completeSale(
    store: Store,
    input: CompleteInput
  ): { store: Store; result: SaleResult } {
    // Idempotency: the same sale key can never be saved or credited twice
    const dup = store.transactions.find((t) => t.key === input.key);
    if (dup) return { store, result: { ok: true, tx: dup, duplicate: true } };
  
    const error = validateSale(store, input);
    if (error) return { store, result: { ok: false, error } };
  
    const phone = normalizePhone(input.phone)!;
    const existing = findCustomer(store, phone);
    const registered = existing?.registered ?? false;
    const calc = computeSale(store, { ...input, phone }, registered);
    const now = new Date().toISOString();
  
    const tx: Transaction = {
      key: input.key,
      receiptNo: nextReceiptNo(store),
      ref: input.ref.trim() || newRef("TRX"),
      phone,
      customerName: existing?.name ?? (input.name.trim() || "New customer"),
      registered,
      items: input.items,
      subtotalCents: calc.subtotalCents,
      discountCents: calc.discountCents,
      totalCents: calc.totalCents,
      method: input.method,
      backpayEarnedCents: calc.earnedCents,
      backpayRedeemedCents: calc.redeemedCents,
      balanceAfterCents: calc.balanceAfterCents,
      redemptionRefs: calc.redemptionRefs,
      goldDropEntry: calc.goldDrop,
      expiresAt: calc.expiresAt,
      createdAt: now,
      status: "Completed",
    };
  
    const ledger = [...store.ledger];
    if (calc.earnedCents > 0) {
      ledger.unshift({
        id: newKey(),
        phone,
        type: "earn",
        amountCents: calc.earnedCents,
        ref: tx.receiptNo,
        createdAt: now,
      });
    }
  
    const customers = existing
      ? store.customers.map((c) =>
          c.phone === phone
            ? {
                ...c,
                backpayCents: c.backpayCents + calc.earnedCents,
                purchases: c.purchases + 1,
                totalSpendCents: c.totalSpendCents + calc.totalCents,
              }
            : c
        )
      : [
          ...store.customers,
          {
            phone,
            name: tx.customerName,
            registered: false,
            backpayCents: calc.earnedCents,
            purchases: 1,
            totalSpendCents: calc.totalCents,
          },
        ];
  
    return {
      store: {
        customers,
        transactions: [tx, ...store.transactions],
        redemptions: store.redemptions,
        ledger,
      },
      result: { ok: true, tx, duplicate: false },
    };
  }