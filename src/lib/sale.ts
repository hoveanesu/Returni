import { BACKPAY_RULES, MOCK_MERCHANT } from "./mock";
import { fmtDateTime } from "./format";
import type { ReceiptData, SaleItem, Transaction } from "./types";

export const lineTotal = (i: SaleItem) => i.qty * i.unitCents;

export const subtotalOf = (items: SaleItem[]) =>
  items.reduce((s, i) => s + lineTotal(i), 0);

// Items unlocked with BackPay do not earn BackPay again
export const qualifyingOf = (items: SaleItem[]) =>
  items.filter((i) => !i.redemptionRef).reduce((s, i) => s + lineTotal(i), 0);

export function rawBackPay(qualifyingCents: number, rules = BACKPAY_RULES): number {
  return Math.floor((qualifyingCents * rules.ratePct) / 100);
}

export function calcBackPay(qualifyingCents: number, rules = BACKPAY_RULES): number {
  if (qualifyingCents < rules.minPurchaseCents) return 0;
  return Math.min(rawBackPay(qualifyingCents, rules), rules.maxRewardCents);
}

export function newKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function newRef(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const receiptNoOf = (n: number) => `R-${String(n).padStart(6, "0")}`;

export function receiptFromTx(tx: Transaction): ReceiptData {
  return {
    merchant: MOCK_MERCHANT.name,
    branch: MOCK_MERCHANT.branch,
    receiptNo: tx.receiptNo,
    ref: tx.ref,
    dateTime: fmtDateTime(tx.createdAt),
    customerName: tx.customerName,
    phone: tx.phone,
    registered: tx.registered,
    items: tx.items,
    subtotalCents: tx.subtotalCents,
    discountCents: tx.discountCents,
    totalCents: tx.totalCents,
    method: tx.method,
    backpayEarnedCents: tx.backpayEarnedCents,
    backpayRedeemedCents: tx.backpayRedeemedCents,
    balanceAfterCents: tx.balanceAfterCents,
    expiresAt: tx.expiresAt,
    redemptionRefs: tx.redemptionRefs,
    goldDropEntry: tx.goldDropEntry,
  };
}