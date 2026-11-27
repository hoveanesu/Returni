import { fmtDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export type QueueResult =
  | { ok: true; messageId: string; status: string; created: boolean }
  | { ok: false; error: string };

// Called AFTER the sale is saved. A failure here never undoes the sale.
export async function queueReceipt(tx: Transaction, consent: boolean): Promise<QueueResult> {
  try {
    const res = await fetch("/api/messaging/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId: tx.key,
        receiptNo: tx.receiptNo,
        dateText: fmtDate(tx.createdAt),
        customerName: tx.customerName === "New customer" ? "" : tx.customerName,
        customerPhone: tx.phone,
        items: tx.items.map((i) => ({ name: i.name, qty: i.qty, unitCents: i.unitCents })),
        totalCents: tx.totalCents,
        backpayEarnedCents: tx.backpayEarnedCents,
        goldDrop: tx.goldDropEntry,
        consent,
      }),
    });
    const j = (await res.json()) as {
      ok?: boolean;
      error?: string;
      messageId?: string;
      status?: string;
      created?: boolean;
    };
    if (res.ok && j.ok && j.messageId) {
      return { ok: true, messageId: j.messageId, status: j.status ?? "queued", created: !!j.created };
    }
    return { ok: false, error: j.error ?? "The messaging service refused the request." };
  } catch {
    return { ok: false, error: "Could not reach the messaging service." };
  }
}