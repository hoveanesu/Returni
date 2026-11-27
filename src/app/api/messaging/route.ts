import { after, NextResponse } from "next/server";
import { DEMO_MERCHANT_ID, guardSending, loadService } from "@/lib/messaging/runtime";
import type { OutboundMessage } from "@/lib/messaging/types";
import { maskPhone } from "@/lib/messaging/util";

function dto(m: OutboundMessage) {
  return {
    id: m.id,
    // For receipts, params[3] is the receipt number (see templates.ts)
    label: m.category === "receipt" ? `Receipt ${m.params[3] ?? ""}`.trim() : "Promotion",
    status: m.status,
    attempts: m.attempts,
    createdAt: m.createdAt,
    phone: maskPhone(m.customerPhone),
    failureCode: m.failureCode,
    failureReason: m.failureReason,
    simulated: m.simulated,
    resendOf: m.resendOf,
    body: m.bodyPreview,
  };
}

export async function POST(req: Request) {
  const blocked = guardSending(req);
  if (blocked) return blocked;
  const loaded = loadService();
  if (loaded.error) return loaded.error;
  const svc = loaded.svc;

  let body: { action?: unknown; messageId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const id = typeof body.messageId === "string" ? body.messageId : "";

  switch (body.action) {
    case "list":
      return NextResponse.json({
        ok: true,
        provider: { name: svc.provider.name, simulated: svc.provider.simulated },
        senderId: svc.senderId,
        messages: svc.listForMerchant(DEMO_MERCHANT_ID).map(dto),
      });

    case "status": {
      const m = svc.getForMerchant(DEMO_MERCHANT_ID, id);
      if (!m) return NextResponse.json({ ok: false, error: "Message not found." }, { status: 404 });
      return NextResponse.json({ ok: true, message: dto(m) });
    }

    case "process": {
      const summary = await svc.processQueue();
      return NextResponse.json({ ok: true, summary });
    }

    case "resend": {
      const r = svc.resend(DEMO_MERCHANT_ID, id, "merchant-portal-user");
      if (!r.ok) return NextResponse.json({ ok: false, error: r.detail }, { status: 409 });
      after(async () => {
        await svc.processQueue();
      });
      return NextResponse.json({ ok: true, messageId: r.message.id });
    }

    default:
      return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  }
}