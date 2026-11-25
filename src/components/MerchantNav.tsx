"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/merchant", label: "Record Sale", ready: true },
  { href: "/merchant/overview", label: "Analytics", ready: true },
  { href: "", label: "Settings", ready: false },
  { href: "/merchant/settings", label: "BackPay", ready: true },
  { href: "", label: "Customers", ready: false },
  { href: "", label: "RETURNi Prices", ready: false },
  { href: "", label: "Gold Drop", ready: false },
  { href: "", label: "Promotions", ready: false },
];

export function MerchantNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Merchant"
      className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
    >
      {items.map((i) => {
        const base =
          "flex items-center justify-between gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium";
        if (!i.ready) {
          return (
            <span key={i.label} className={`${base} cursor-not-allowed text-muted/70`}>
              {i.label}
              <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-semibold">
                Soon
              </span>
            </span>
          );
        }
        const active = path === i.href;
        return (
          <Link
            key={i.label}
            href={i.href}
            className={`${base} ${
              active ? "bg-brand-green text-white" : "text-brand-navy hover:bg-surface-alt"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}