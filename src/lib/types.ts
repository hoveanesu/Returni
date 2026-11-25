export type Product = {
    id: string;
    name: string;
    category: string;
    priceCents: number;
  };
  
  export type SaleItem = {
    id: string; // unique line id
    name: string;
    category: string;
    qty: number;
    unitCents: number;
    redemptionRef?: string; // set when this line was unlocked with BackPay
  };
  
  export type Customer = {
    phone: string;
    name: string;
    registered: boolean;
    backpayCents: number;
    purchases: number;
    totalSpendCents: number;
  };
  
  export type Offer = {
    id: string;
    name: string;
    standardCents: number;
    returniCents: number;
    backpayCostCents: number;
    active: boolean;
  };
  
  export type Redemption = {
    ref: string;
    key: string; // idempotency key: the same key can never be charged twice
    phone: string;
    offerId: string;
    offerName: string;
    costCents: number;
    returniCents: number;
    createdAt: string;
  };
  
  export type RedeemResult =
    | { ok: true; redemption: Redemption }
    | { ok: false; error: string };
  
  export type LedgerEntry = {
    id: string;
    phone: string;
    type: "earn" | "redeem";
    amountCents: number; // positive = credit, negative = debit
    ref: string;
    createdAt: string;
  };
  
  export type GoldDropStatus = "active" | "pending" | "none";
  
  export type Transaction = {
    key: string; // idempotency key for the sale
    receiptNo: string;
    ref: string;
    phone: string;
    customerName: string;
    registered: boolean;
    items: SaleItem[];
    subtotalCents: number;
    discountCents: number;
    totalCents: number;
    method: string;
    backpayEarnedCents: number;
    backpayRedeemedCents: number;
    balanceAfterCents: number;
    redemptionRefs: string[];
    goldDropEntry: GoldDropStatus;
    expiresAt: string | null;
    createdAt: string;
    status: "Completed" | "Reversed";
  };
  
  export type ReceiptData = {
    merchant: string;
    branch: string;
    receiptNo: string;
    ref: string;
    dateTime: string;
    customerName: string;
    phone: string;
    registered: boolean;
    items: SaleItem[];
    subtotalCents: number;
    discountCents: number;
    totalCents: number;
    method: string;
    backpayEarnedCents: number;
    backpayRedeemedCents: number;
    balanceAfterCents: number;
    expiresAt: string | null;
    redemptionRefs: string[];
    goldDropEntry: GoldDropStatus;
    isPreview?: boolean;
  };