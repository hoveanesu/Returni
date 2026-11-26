"use client";

import { useState } from "react";
import { BarChart } from "@/components/BarChart";
import { useStore } from "@/components/StoreProvider";
import { computeAnalytics } from "@/lib/analytics";
import { usd } from "@/lib/format";
import { btnGhost, cardCls } from "@/lib/ui";

function Kpi({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className={cardCls}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cardCls}>
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function AnalyticsInner() {
  const { store, reset } = useStore();
  const [now] = useState(() => new Date());
  const a = computeAnalytics(store, now);
  const newPct = a.totalCustomers
    ? Math.round((100 * a.newCustomers) / a.totalCustomers)
    : 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted">
            Track your performance and customer growth
          </p>
        </div>
        <button
          className={btnGhost}
          onClick={() => {
            if (
              window.confirm(
                "Reset demo data? This removes the sales you recorded here and restores the sample data."
              )
            )
              reset();
          }}
        >
          Reset demo data
        </button>
      </div>

      {a.sampleTx > 0 && (
        <p className="mb-5 rounded-xl bg-surface-alt px-4 py-3 text-sm text-brand-blue">
          {a.sampleTx} of {a.totalTx} recorded transactions are sample data, so
          these figures are not real business results. Sales you record on the
          Record Sale screen are added automatically.
        </p>
      )}

      <h2 className="mb-2 text-sm font-semibold text-muted">Sales</h2>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Sales today" value={usd(a.salesTodayCents)} />
        <Kpi label="Sales this week" value={usd(a.salesWeekCents)} note="Since Monday" />
        <Kpi label="Sales this month" value={usd(a.salesMonthCents)} />
        <Kpi
          label="Transactions this month"
          value={String(a.txMonth)}
          note={`Average ${usd(a.avgTxCents)} each`}
        />
      </div>

      <h2 className="mb-2 text-sm font-semibold text-muted">Customers</h2>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total customers" value={String(a.totalCustomers)} />
        <Kpi label="New customers" value={String(a.newCustomers)} note="1 purchase so far" />
        <Kpi
          label="Returning customers"
          value={String(a.returningCustomers)}
          note="2 or more purchases"
        />
        <Kpi
          label="Repeat purchase rate"
          value={`${a.repeatRatePct}%`}
          note="Returning ÷ all customers"
        />
      </div>

      <h2 className="mb-2 text-sm font-semibold text-muted">Rewards</h2>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="BackPay issued" value={usd(a.backpayIssuedMonthCents)} note="This month" />
        <Kpi label="BackPay redeemed" value={usd(a.backpayRedeemedMonthCents)} note="This month" />
        <Kpi
          label="Outstanding BackPay"
          value={usd(a.liabilityCents)}
          note="Owed to all customers"
        />
        <Kpi
          label="RETURNi Prices redemptions"
          value={String(a.redemptionsMonth)}
          note="This month"
        />
        <Kpi
          label="Gold Drop entries"
          value={String(a.goldConfirmedMonth + a.goldHeldMonth)}
          note={`${a.goldConfirmedMonth} confirmed · ${a.goldHeldMonth} held, this month`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Sales per day (last 14 days)">
          <BarChart
            ariaLabel="Sales per day for the last 14 days"
            data={a.days.map((d) => ({ label: d.label, value: d.salesCents }))}
            format={usd}
            emptyText="No sales in the last 14 days."
          />
        </ChartCard>

        <ChartCard title="Transactions per day (last 14 days)">
          <BarChart
            ariaLabel="Transactions per day for the last 14 days"
            data={a.days.map((d) => ({ label: d.label, value: d.count }))}
            emptyText="No transactions in the last 14 days."
          />
        </ChartCard>

        <ChartCard title="New customers per day">
          <BarChart
            ariaLabel="New customers per day for the last 14 days"
            data={a.days.map((d) => ({ label: d.label, value: d.newCustomers }))}
            emptyText="No new customers recorded yet. Customers added through new sales appear here."
          />
        </ChartCard>

        <ChartCard title="Repeat purchases (% of sales)">
          <BarChart
            ariaLabel="Share of sales from returning customers per day"
            data={a.days.map((d) => ({ label: d.label, value: d.repeatPct }))}
            max={100}
            format={(n) => `${n}%`}
            emptyText="No data yet. Sales you record from now on show whether the customer was new or returning."
          />
        </ChartCard>

        <ChartCard title="Customer mix">
          {a.totalCustomers === 0 ? (
            <p className="rounded-xl bg-surface-alt p-6 text-center text-sm text-muted">
              No customers yet.
            </p>
          ) : (
            <div>
              <div className="flex h-4 overflow-hidden rounded-full bg-surface-alt">
                <div className="bg-brand-blue" style={{ width: `${newPct}%` }} />
                <div className="bg-brand-green" style={{ width: `${100 - newPct}%` }} />
              </div>
              <p className="mt-3 text-sm">
                <span className="mr-4">
                  <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-brand-blue" />
                  New {a.newCustomers}
                </span>
                <span>
                  <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-brand-green" />
                  Returning {a.returningCustomers}
                </span>
              </p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Campaign performance">
          <p className="rounded-xl bg-surface-alt p-6 text-center text-sm text-muted">
            Promotions arrive in Stage 8. Campaign results will appear here once
            real campaigns exist.
          </p>
        </ChartCard>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { loaded } = useStore();
  if (!loaded) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-2 text-sm text-muted">Loading…</p>
      </div>
    );
  }
  return <AnalyticsInner />;
}