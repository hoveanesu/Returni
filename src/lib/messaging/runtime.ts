import { ConsentLedger } from "./consent";
import { CloudApiProvider, DevProvider } from "./provider";
import { MemoryMessageStore } from "./store";
import { MessagingService } from "./service";
import type { WhatsAppProvider } from "./types";

export const DEMO_MERCHANT_ID = "demo-store";
export const SENDER_ID = "RETURNi-central";

// globalThis keeps ONE service even though Next compiles each route separately
const g = globalThis as unknown as { __returniMessaging?: MessagingService };

function buildProvider(): WhatsAppProvider {
  if (process.env.WHATSAPP_PROVIDER !== "cloud") return new DevProvider();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION;
  if (!accessToken || !phoneNumberId || !apiVersion) {
    throw new Error(
      "WHATSAPP_PROVIDER=cloud needs WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_API_VERSION in .env.local"
    );
  }
  return new CloudApiProvider({
    accessToken,
    phoneNumberId,
    apiVersion,
    sendMode: process.env.WHATSAPP_SEND_MODE === "text" ? "text" : "template",
  });
}

export function getMessaging(): MessagingService {
  if (!g.__returniMessaging) {
    g.__returniMessaging = new MessagingService({
      store: new MemoryMessageStore(),
      consent: new ConsentLedger(),
      provider: buildProvider(),
      senderId: SENDER_ID,
    });
  }
  return g.__returniMessaging;
}

export function loadService():
  | { svc: MessagingService; error?: undefined }
  | { svc?: undefined; error: Response } {
  try {
    return { svc: getMessaging() };
  } catch (e) {
    return {
      error: Response.json(
        { ok: false, error: e instanceof Error ? e.message : "Messaging is not configured." },
        { status: 500 }
      ),
    };
  }
}

// Stopgap until staff sign-in exists: when REAL sending is on, only accept
// requests that come from this computer.
export function guardSending(req: Request): Response | null {
  if (process.env.WHATSAPP_PROVIDER !== "cloud") return null;
  const host = (req.headers.get("host") ?? "").split(":")[0];
  const local = host === "localhost" || host === "127.0.0.1";
  if (process.env.NODE_ENV === "production" || !local) {
    return Response.json(
      {
        ok: false,
        error:
          "Real WhatsApp sending is only allowed from localhost until staff sign-in is added.",
      },
      { status: 403 }
    );
  }
  return null;
}