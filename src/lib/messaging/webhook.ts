import { createHmac, timingSafeEqual } from "node:crypto";
import type { StatusUpdate } from "./types";

// Verifies Meta's X-Hub-Signature-256 header against the RAW request body.
export function verifySignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header || !appSecret) return false;
  const prefix = "sha256=";
  if (!header.startsWith(prefix)) return false;
  const given = Buffer.from(header.slice(prefix.length), "hex");
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest();
  if (given.length === 0 || given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}

export type InboundMessage = { from: string; id: string; text: string; at: number };
export type ParsedWebhook = { statuses: StatusUpdate[]; inbound: InboundMessage[] };

type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec => (v && typeof v === "object" ? (v as Rec) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

const STATUSES = new Set(["sent", "delivered", "read", "failed"]);

// Reads the WhatsApp Cloud API webhook payload defensively.
export function parseWebhook(body: unknown): ParsedWebhook {
  const out: ParsedWebhook = { statuses: [], inbound: [] };
  for (const entry of arr(rec(body).entry)) {
    for (const change of arr(rec(entry).changes)) {
      const value = rec(rec(change).value);
      for (const s of arr(value.statuses)) {
        const r = rec(s);
        const id = str(r.id);
        const status = str(r.status);
        if (!id || !STATUSES.has(status)) continue;
        const ts = Number(str(r.timestamp)) * 1000;
        const at = Number.isFinite(ts) && ts > 0 ? ts : Date.now();
        const firstError = rec(arr(r.errors)[0]);
        out.statuses.push({
          providerMessageId: id,
          status: status as StatusUpdate["status"],
          at,
          eventId: `${id}:${status}:${str(r.timestamp)}`,
          errorCode: str(firstError.code) || undefined,
          errorTitle: str(firstError.title) || undefined,
        });
      }
      for (const m of arr(value.messages)) {
        const r = rec(m);
        const from = str(r.from);
        if (!from) continue;
        const ts = Number(str(r.timestamp)) * 1000;
        out.inbound.push({
          from,
          id: str(r.id),
          text: str(rec(r.text).body),
          at: Number.isFinite(ts) && ts > 0 ? ts : Date.now(),
        });
      }
    }
  }
  return out;
}

export const isOptOut = (text: string) =>
  /^\s*(stop|unsubscribe|opt[\s-]?out)\s*[.!]*\s*$/i.test(text);