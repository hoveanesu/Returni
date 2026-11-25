import { fmtDate, usd } from "@/lib/format";
import { BACKPAY_RULES } from "@/lib/mock";
import type { ReceiptData } from "@/lib/types";

export function Receipt({ data }: { data: ReceiptData }) {
  const row = "flex justify-between gap-3";
  const rule = "my-3 border-t border-dashed border-sage";

  const goldDrop =
    data.goldDropEntry === "active"
      ? `Gold Drop: ${data.isPreview ? "1 entry will be" : "1 entry"} confirmed for this purchase.`
      : data.goldDropEntry === "pending"
        ? "Gold Drop: your entry is held until you register your RETURNi account."
        : `Gold Drop: purchases from ${usd(BACKPAY_RULES.goldDropMinCents)} qualify for an entry.`;

  return (
    <div className="rounded-xl border border-dashed border-sage bg-white p-4 text-sm text-brand-navy">
      {data.isPreview && (
        <p className="mb-3 rounded-lg bg-surface-alt px-3 py-1.5 text-center text-xs font-semibold text-brand-blue">
          PREVIEW: this sale is not saved yet
        </p>
      )}

      <div className="text-center">
        <p className="text-base font-bold">{data.merchant}</p>
        <p className="text-xs text-muted">{data.branch}</p>
      </div>

      <div className={rule} />
      <div className="space-y-0.5 text-xs">
        <div className={row}>
          <span className="text-muted">Receipt</span>
          <span className="font-semibold">{data.receiptNo}</span>
        </div>
        <div className={row}>
          <span className="text-muted">Reference</span>
          <span>{data.ref}</span>
        </div>
        <div className={row}>
          <span className="text-muted">Date</span>
          <span>{data.dateTime}</span>
        </div>
        <div className={row}>
          <span className="text-muted">Customer</span>
          <span>
            {data.customerName} · {data.phone}
          </span>
        </div>
      </div>

      <div className={rule} />
      <ul className="space-y-2">
        {data.items.map((i) => (
          <li key={i.id} className={row}>
            <span>
              {i.qty} × {i.name}
              <span className="block text-xs text-muted">
                @ {usd(i.unitCents)}
                {i.redemptionRef && ` · RETURNi Price (ref ${i.redemptionRef})`}
              </span>
            </span>
            <span className="font-medium">{usd(i.qty * i.unitCents)}</span>
          </li>
        ))}
      </ul>

      <div className={rule} />
      <div className="space-y-1">
        <div className={row}>
          <span className="text-muted">Subtotal</span>
          <span>{usd(data.subtotalCents)}</span>
        </div>
        {data.discountCents > 0 && (
          <div className={row}>
            <span className="text-muted">Discount</span>
            <span>-{usd(data.discountCents)}</span>
          </div>
        )}
        <div className={`${row} text-base font-bold`}>
          <span>Total</span>
          <span>{usd(data.totalCents)}</span>
        </div>
        <div className={row}>
          <span className="text-muted">Paid by</span>
          <span>{data.method}</span>
        </div>
      </div>

      <div className={rule} />
      <div className="space-y-1">
        <div className={row}>
          <span className="text-muted">BackPay earned</span>
          <span className="font-semibold text-brand-green">
            +{usd(data.backpayEarnedCents)}
          </span>
        </div>
        {data.backpayRedeemedCents > 0 && (
          <div className={row}>
            <span className="text-muted">BackPay redeemed</span>
            <span>-{usd(data.backpayRedeemedCents)}</span>
          </div>
        )}
        {data.redemptionRefs.length > 0 && (
          <p className="text-xs text-muted">
            Redemption ref: {data.redemptionRefs.join(", ")}
          </p>
        )}
        <div className={`${row} font-semibold`}>
          <span>BackPay balance</span>
          <span>{usd(data.balanceAfterCents)}</span>
        </div>
        <p className="text-xs text-muted">
          {data.expiresAt
            ? `Rewards from this purchase expire on ${fmtDate(data.expiresAt)}.`
            : "No BackPay earned on this purchase."}
        </p>
      </div>

      <div className={rule} />
      <p className="text-xs">{goldDrop}</p>
      <p className="mt-2 text-xs">
        RETURNi Prices: use your BackPay to unlock better prices at participating
        merchants. Ask in store.
      </p>
      <p className="mt-2 text-xs">
        {data.registered
          ? "Your RETURNi account is active."
          : "Register your RETURNi account to unlock your rewards:"}{" "}
        <span className="font-semibold text-brand-blue">
          https://returni.example/join
        </span>{" "}
        <span className="text-muted">(sample link)</span>
      </p>
    </div>
  );
}