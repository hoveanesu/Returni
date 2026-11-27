import { after, NextResponse } from "next/server";
import { MOCK_MERCHANT } from "@/lib/mock";
import { DEMO_MERCHANT_ID, guardSending, loadService } from "@/lib/messaging/runtime";
import type { ReceiptEvent } from "@/lib/messaging/types";
import { normalizeMsisdn } from "@/lib/messaging/util";

const WORDING =
  "Customer agrees to receive their receipt and RETURNi rewards via WhatsApp";

const str = (v: unknown) => (typeof v === "string" ? v : "");
const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : NaN);

export async function POST(req: Request) {
  const blocked = guardSending(req);
  if (blocked) return blocked;
  const loaded = loadService();
  if (loaded.error) return loaded.error;
  const svc = loaded.svc;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const b = raw as Record<string, unknown>;

  const phone = normalizeMsisdn(str(b.customerPhone));
  if (!phone) {
    return NextResponse.json(
      { ok: false, error: "The WhatsApp number is not valid." },
      { status: 400 }
    );
  }

  // Consent is recorded only if the customer has never been asked before.
  // A customer who replied STOP is never re-subscribed by a checkbox.
  if (b.consent === true && svc.consent.status(phone, "transactional") === "none") {
    svc.consent.grant(phone, "transactional", "record_sale_checkbox", WORDING, Date.now());
  }

  const items = Array.isArray(b.items)
    ? b.items.map((i) => {
        const r = (i ?? {}) as Record<string, unknown>;
        return { name: str(r.name), qty: int(r.qty), unitCents: int(r.unitCents) };
      })
    : [];

  const event: ReceiptEvent = {
    kind: "receipt",
    transactionId: str(b.transactionId),
    merchantId: DEMO_MERCHANT_ID,
    merchantName: MOCK_MERCHANT.name,
    branch: MOCK_MERCHANT.branch,
    customerPhone: phone,
    customerName: str(b.customerName) || undefined,
    receiptNo: str(b.receiptNo),
    dateText: str(b.dateText),
    items,
    totalCents: int(b.totalCents),
    backpayEarnedCents: int(b.backpayEarnedCents),
    goldDrop: b.goldDrop === "active" || b.goldDrop === "pending" ? b.goldDrop : "none",
  };

  const r = svc.enqueue(event);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.detail }, { status: 422 });
  }

  // Send after the response, so Record Sale never waits on WhatsApp
  after(async () => {
    await svc.processQueue();
  });

  return NextResponse.json({
    ok: true,
    messageId: r.message.id,
    status: r.message.status,
    created: r.created,
  });
}