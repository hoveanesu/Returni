"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { fmtDateTime } from "@/lib/format";
import { btnGhost, btnPrimary, cardCls } from "@/lib/ui";

type Row = {
  id: string;
  label: string;
  status: string;
  attempts: number;
  createdAt: number;
  phone: string;
  failureCode: string | null;
  failureReason: string | null;
  simulated: boolean;
  resendOf: string | null;
  body: string;
};
type Info = { name: string; simulated: boolean };

async function post(body: Record<string, unknown>) {
  const res = await fetch("/api/messaging", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as Record<string, unknown>;
}

function statusText(r: Row) {
  switch (r.status) {
    case "queued":
      return "Queued";
    case "sending":
      return "Sending";
    case "sent":
      return r.simulated ? "Sent (simulated)" : "Sent";
    case "delivered":
      return "Delivered";
    case "read":
      return "Read";
    case "failed":
      return "Failed";
    case "blocked":
      return "Not sent";
    default:
      return r.status;
  }
}

function badgeCls(status: string) {
  if (status === "delivered" || status === "read") return "bg-green-100 text-green-800";
  if (status === "sent") return "bg-emerald-50 text-emerald-800";
  if (status === "failed") return "bg-red-100 text-red-700";
  if (status === "blocked") return "bg-amber-100 text-amber-800";
  return "bg-surface-alt text-brand-blue";
}

export default function MessagesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<Row | null>(null);

  const refresh = useCallback(async () => {
    try {
      const j = await post({ action: "list" });
      if (j.ok) {
        setRows(j.messages as Row[]);
        setInfo(j.provider as Info);
        setError("");
      } else {
        setError(String(j.error ?? "Could not load messages."));
      }
    } catch {
      setError("Could not reach the messaging service.");
    }
    setLoaded(true);
  }, []);

  // Runs the queue (sends due messages and retries), then reloads the list
  const runQueue = useCallback(async () => {
    try {
      await post({ action: "process" });
    } catch {
      // the refresh below reports any connection problem
    }
    await refresh();
  }, [refresh]);

  useEffect(() => {
    void runQueue();
    const t = setInterval(() => void runQueue(), 15000);
    return () => clearInterval(t);
  }, [runQueue]);

  async function resend(id: string) {
    setBusy(true);
    try {
      const j = await post({ action: "resend", messageId: id });
      if (!j.ok) setError(String(j.error ?? "Could not resend."));
    } catch {
      setError("Could not reach the messaging service.");
    }
    await refresh();
    setBusy(false);
  }

  const waiting = rows.filter((r) => r.status === "queued" || r.status === "sending").length;
  const good = rows.filter((r) => ["sent", "delivered", "read"].includes(r.status)).length;
  const problems = rows.filter((r) => r.status === "failed" || r.status === "blocked").length;

  if (!loaded) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="mt-2 text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted">WhatsApp receipts sent through RETURNi</p>
        </div>
        <button className={btnGhost} onClick={() => void runQueue()}>
          Run queue now
        </button>
      </div>

      {info &&
        (info.simulated ? (
          <p className="mb-5 rounded-xl bg-surface-alt px-4 py-3 text-sm text-brand-blue">
            Simulated provider: nothing is sent to WhatsApp.
          </p>
        ) : (
          <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Live sending ({info.name}): messages go to real phones.
          </p>
        ))}

      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          ["Waiting", waiting],
          ["Sent or delivered", good],
          ["Failed or not sent", problems],
        ].map(([label, n]) => (
          <div key={label} className={cardCls}>
            <p className="text-xs font-medium text-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold">{n}</p>
          </div>
        ))}
      </div>

      <section className={cardCls} aria-label="Message history">
        {rows.length === 0 ? (
          <p className="rounded-xl bg-surface-alt p-6 text-center text-sm text-muted">
            No messages yet. Record a sale and its WhatsApp receipt appears here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Message</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-center font-medium">Tries</th>
                  <th className="pb-2 font-medium">Detail</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-sage/40 align-top">
                    <td className="py-2.5 text-xs text-muted">
                      {fmtDateTime(new Date(r.createdAt))}
                    </td>
                    <td className="py-2.5">{r.phone}</td>
                    <td className="py-2.5 font-medium">
                      {r.label}
                      {r.resendOf && <span className="ml-1 text-xs text-muted">(resend)</span>}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeCls(r.status)}`}
                      >
                        {statusText(r)}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">{r.attempts}</td>
                    <td className="max-w-[220px] py-2.5 text-xs text-muted">
                      {r.failureReason ?? ""}
                      {r.failureCode ? ` (${r.failureCode})` : ""}
                    </td>
                    <td className="space-x-3 py-2.5 text-right text-xs font-semibold">
                      <button className="text-brand-blue underline" onClick={() => setViewing(r)}>
                        View
                      </button>
                      {(r.status === "failed" || r.status === "blocked") && (
                        <button
                          className="text-brand-green underline disabled:opacity-50"
                          disabled={busy}
                          onClick={() => void resend(r.id)}
                        >
                          Resend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          While this page is open it checks the queue every 15 seconds. Messages are held in
          server memory and clear when the server restarts.
        </p>
      </section>

      {viewing && (
        <Modal title={viewing.label} onClose={() => setViewing(null)}>
          <pre className="whitespace-pre-wrap rounded-xl bg-surface-alt p-4 font-sans text-sm">
            {viewing.body}
          </pre>
          <button className={`${btnPrimary} mt-4 w-full`} onClick={() => setViewing(null)}>
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}