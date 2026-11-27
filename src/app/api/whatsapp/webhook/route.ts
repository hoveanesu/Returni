import { NextRequest, NextResponse } from "next/server";
import { loadService } from "@/lib/messaging/runtime";
import { parseWebhook, verifySignature } from "@/lib/messaging/webhook";

// Meta calls this once when you set the webhook up
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === token) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Delivery updates and customer replies (STOP)
export async function POST(req: NextRequest) {
  const raw = await req.text(); // the signature is checked against the raw body
  const secret = process.env.WHATSAPP_APP_SECRET ?? "";
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"), secret)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }
  const loaded = loadService();
  if (loaded.error) return loaded.error;
  loaded.svc.processWebhook(parseWebhook(json));
  return NextResponse.json({ ok: true });
}