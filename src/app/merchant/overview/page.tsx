import { MOCK_STATS, MOCK_RECEIPTS } from "@/lib/mock";
import { usd } from "@/lib/format";
import { card } from "@/lib/ui";

export default function OverviewPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Overview</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MOCK_STATS.map((s) => (
          <div key={s.label} className={card}>
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className={card}>
        <h2 className="mb-3 font-semibold">Recent receipts</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="pb-2">Receipt</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">BackPay</th>
                <th className="pb-2">Account</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECEIPTS.map((r) => (
                <tr key={r.no} className="border-t border-sage/40">
                  <td className="py-2">{r.no}</td>
                  <td className="py-2">{r.phone}</td>
                  <td className="py-2">{usd(r.totalCents)}</td>
                  <td className="py-2">{usd(r.backpayCents)}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.registered ? "bg-brand-green/10 text-brand-green" : "bg-surface-alt text-muted"
                      }`}
                    >
                      {r.registered ? "Registered" : "Not yet"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}