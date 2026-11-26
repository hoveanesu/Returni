export type BarPoint = { label: string; value: number | null };

export function BarChart({
  data,
  format = (n: number) => String(n),
  max,
  emptyText,
  ariaLabel,
}: {
  data: BarPoint[];
  format?: (n: number) => string;
  max?: number;
  emptyText: string;
  ariaLabel: string;
}) {
  const peak = max ?? Math.max(0, ...data.map((d) => d.value ?? 0));

  if (peak === 0) {
    return (
      <p className="rounded-xl bg-surface-alt p-6 text-center text-sm text-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="flex h-36 items-end gap-1">
        {data.map((d) => {
          const h =
            d.value == null ? 0 : Math.max(2, Math.round((d.value / peak) * 100));
          return (
            <div
              key={d.label}
              className="flex h-full flex-1 items-end"
              title={`${d.label}: ${d.value == null ? "no data" : format(d.value)}`}
            >
              <div
                className="w-full rounded-t bg-brand-green"
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-muted">
            {i % 2 === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}