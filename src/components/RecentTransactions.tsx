"use client";

import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import { Receipt } from "./Receipt";
import { fmtDateTime, usd } from "@/lib/format";
import { receiptFromTx } from "@/lib/sale";
import { btnGhost, btnPrimary, cardCls, inputCls } from "@/lib/ui";
import type { Transaction } from "@/lib/types";

type Filter = "All" | "Completed" | "Reversed";

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const cls =
    status === "Completed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [view, setView] = useState<{
    tx: Transaction;
    mode: "receipt" | "details";
  } | null>(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return transactions.filter((t) => {
      if (filter !== "All" && t.status !== filter) return false;
      if (!s) return true;
      return (
        t.receiptNo.toLowerCase().includes(s) ||
        t.customerName.toLowerCase().includes(s) ||
        t.phone.replace(/\s/g, "").includes(s.replace(/\s/g, "")) ||
        t.ref.toLowerCase().includes(s)
      );
    });
  }, [transactions, q, filter]);

  return (
    <section className={`${cardCls} mt-6`} aria-label="Recent transactions">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <div className="flex gap-2">
          <input
            className={`${inputCls} sm:w-64`}
            placeholder="Search receipt, customer, phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search transactions"
          />
          <select
            className={`${inputCls} w-auto`}
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            aria-label="Filter by status"
          >
            <option>All</option>
            <option>Completed</option>
            <option>Reversed</option>
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl bg-surface-alt p-6 text-center text-sm text-muted">
          {transactions.length === 0
            ? "No transactions yet. Record your first sale above."
            : "No transactions match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="pb-2 font-medium">Receipt</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 text-right font-medium">Total</th>
                <th className="pb-2 text-right font-medium">BackPay</th>
                <th className="pb-2 pl-4 font-medium">Date &amp; time</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((t) => (
                <tr key={t.key} className="border-t border-sage/40">
                  <td className="py-2.5 font-medium">{t.receiptNo}</td>
                  <td className="py-2.5">{t.customerName}</td>
                  <td className="py-2.5 text-right">{usd(t.totalCents)}</td>
                  <td className="py-2.5 text-right text-brand-green">
                    +{usd(t.backpayEarnedCents)}
                  </td>
                  <td className="py-2.5 pl-4 text-xs text-muted">
                    {fmtDateTime(t.createdAt)}
                  </td>
                  <td className="py-2.5">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="space-x-3 py-2.5 text-right text-xs font-semibold">
                    <button
                      className="text-brand-green underline"
                      onClick={() => setView({ tx: t, mode: "receipt" })}
                    >
                      Receipt
                    </button>
                    <button
                      className="text-brand-blue underline"
                      onClick={() => setView({ tx: t, mode: "details" })}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">
        Showing {Math.min(rows.length, 20)} of {rows.length}
      </p>

      {view?.mode === "receipt" && (
        <Modal title={`Receipt ${view.tx.receiptNo}`} onClose={() => setView(null)}>
          <Receipt data={receiptFromTx(view.tx)} />
          <button className={`${btnGhost} mt-4 w-full`} onClick={() => setView(null)}>
            Close
          </button>
        </Modal>
      )}

      {view?.mode === "details" && (
        <Modal title="Transaction details" onClose={() => setView(null)}>
          <dl className="space-y-2 text-sm">
            {[
              ["Receipt", view.tx.receiptNo],
              ["Reference", view.tx.ref],
              ["Status", view.tx.status],
              ["Customer", `${view.tx.customerName} (${view.tx.phone})`],
              ["Account", view.tx.registered ? "Registered" : "Not registered"],
              ["Payment method", view.tx.method],
              ["Items", String(view.tx.items.reduce((n, i) => n + i.qty, 0))],
              ["Subtotal", usd(view.tx.subtotalCents)],
              ["Discount", usd(view.tx.discountCents)],
              ["Total", usd(view.tx.totalCents)],
              ["BackPay earned", usd(view.tx.backpayEarnedCents)],
              ["BackPay redeemed", usd(view.tx.backpayRedeemedCents)],
              ["Balance after", usd(view.tx.balanceAfterCents)],
              [
                "Redemption refs",
                view.tx.redemptionRefs.length
                  ? view.tx.redemptionRefs.join(", ")
                  : "None",
              ],
              [
                "Gold Drop entry",
                view.tx.goldDropEntry === "active"
                  ? "Confirmed"
                  : view.tx.goldDropEntry === "pending"
                    ? "Held until registration"
                    : "Not eligible",
              ],
              ["Date & time", fmtDateTime(view.tx.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-sage/30 pb-1.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex gap-2">
            <button
              className={btnPrimary}
              onClick={() => setView({ tx: view.tx, mode: "receipt" })}
            >
              View receipt
            </button>
            <button className={btnGhost} onClick={() => setView(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}