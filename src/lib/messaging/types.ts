export type MessageCategory = "receipt" | "promotion";
export type ConsentCategory = "transactional" | "marketing";

export type MessageStatus =
  | "queued" // waiting to be sent
  | "sending" // claimed by a worker
  | "sent" // accepted by the WhatsApp provider
  | "delivered" // delivered to the customer's phone
  | "read"
  | "failed" // permanent failure or retries used up
  | "blocked"; // not sent on purpose (for example no consent)

export type ReceiptItem = { name: string; qty: number; unitCents: number };

export type ReceiptEvent = {
  kind: "receipt";
  transactionId: string; // the central transaction reference
  merchantId: string;
  merchantName: string;
  branch?: string;
  customerPhone: string;
  customerName?: string;
  receiptNo: string;
  dateText: string;
  items: ReceiptItem[];
  totalCents: number;
  backpayEarnedCents: number;
  goldDrop: "active" | "pending" | "none";
};

export type PromotionEvent = {
  kind: "promotion";
  promotionId: string;
  merchantId: string;
  merchantName: string;
  customerPhone: string;
  customerName?: string;
  headline: string;
  endsText: string;
};

export type MessagingEvent = ReceiptEvent | PromotionEvent;

export type OutboundMessage = {
  id: string;
  idempotencyKey: string;
  category: MessageCategory;
  consentCategory: ConsentCategory;
  templateId: string;
  language: string;
  merchantId: string;
  merchantName: string;
  customerPhone: string;
  transactionId: string | null;
  campaignId: string | null;
  senderId: string; // the central RETURNi sender
  params: string[];
  bodyPreview: string;
  status: MessageStatus;
  attempts: number;
  nextAttemptAt: number | null;
  lockedAt: number | null;
  providerMessageId: string | null;
  simulated: boolean;
  failureCode: string | null;
  failureReason: string | null;
  resendOf: string | null;
  createdAt: number;
  sentAt: number | null;
  deliveredAt: number | null;
  readAt: number | null;
};

export type MessageEventRow = {
  id: string;
  messageId: string;
  type: string;
  at: number;
  detail?: string;
};

export type ConsentEntry = {
  phone: string;
  category: ConsentCategory;
  status: "granted" | "withdrawn";
  at: number;
  source: string;
  wording: string;
};

export type ProviderSend = {
  to: string; // E.164
  templateId: string;
  language: string;
  params: string[];
  bodyPreview: string;
  messageId: string; // our internal id
};

export type ProviderResult =
  | { ok: true; providerMessageId: string; simulated: boolean }
  | { ok: false; kind: "temporary" | "permanent"; code: string; reason: string };

export interface WhatsAppProvider {
  readonly name: string;
  readonly simulated: boolean;
  send(input: ProviderSend): Promise<ProviderResult>;
}

export type StatusUpdate = {
  providerMessageId: string;
  status: "sent" | "delivered" | "read" | "failed";
  at: number; // epoch ms
  eventId?: string;
  errorCode?: string;
  errorTitle?: string;
};

export type EnqueueResult =
  | { ok: true; created: boolean; message: OutboundMessage }
  | {
      ok: false;
      reason: "invalid_phone" | "invalid_event" | "not_found" | "not_resendable";
      detail: string;
    };