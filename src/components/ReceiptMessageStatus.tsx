"use client";

import { useEffect, useState } from "react";
import type { QueueResult } from "@/lib/messaging/client";

type Live = { status: string; simulated: boolean; failureReason: string | null };
const FINAL = new Set(["sent", "delivered", "read", "failed", "blocked"]);

function describe(status: string, simulated: boolean, reason: string | null) {
  switch (status) {
    case "sent":
      return {
        tone: "ok",
        text: simulated
          ? "WhatsApp receipt sent (simulated: nothing reached WhatsApp)."
          : "WhatsApp receipt accepted by WhatsApp. Delivery is confirmed separately.",
      };
    case "delivered":
      return { tone: "ok", text: "WhatsApp receipt delivered." };
    case "read":
      return { tone: "ok", text: "WhatsApp receipt delivered and read." };
    case "blocked":
      return {
        tone: "bad",
        text: `WhatsApp receipt not sent: ${reason ?? "no consent on record"}.`,
      };
    case "failed":
      return {
        tone: "bad",
        text: `WhatsApp receipt failed${reason ? `: ${reason}` : ""}. You can resend it from Messages.`,
      };
    default:
      return { tone: "wait", text: "WhatsApp receipt queued…" };
  }
}

export function ReceiptMessageStatus({ result }: { result: QueueResult | null }) {
  const [live, setLive] = useState<Live | null>(null);
  const messageId = result && result.ok ? result.messageId : null;

  useEffect(() => {
    if (!messageId) return;
    let stop = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      tries += 1;
      try {
        const res = await fetch("/api/messaging", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", messageId }),
        });
        const j = await res.json();
        if (!stop && j.ok) {
          setLive({
            status: j.message.status,
            simulated: !!j.message.simulated,
            failureReason: j.message.failureReason ?? null,
          });
          if (FINAL.has(j.message.status)) return;
        }
      } catch {
        // try again on the next tick
      }
      if (!stop && tries < 8) timer = setTimeout(tick, 2000);
    };
    timer = setTimeout(tick, 800);
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [messageId]);

  let tone = "wait";
  let text = "Sending WhatsApp receipt…";
  if (result && !result.ok) {
    tone = "bad";
    text = `WhatsApp receipt not queued: ${result.error}`;
  } else if (result && result.ok) {
    const d = describe(live?.status ?? result.status, live?.simulated ?? true, live?.failureReason ?? null);
    tone = d.tone;
    text = d.text;
  }

  const cls =
    tone === "ok"
      ? "bg-green-50 text-green-800"
      : tone === "bad"
        ? "bg-amber-50 text-amber-800"
        : "bg-surface-alt text-brand-blue";

  return (
    <p role="status" className={`mb-3 rounded-lg px-3 py-2 text-sm ${cls}`}>
      Sale saved. {text}
    </p>
  );
}