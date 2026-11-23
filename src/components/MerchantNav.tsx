"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/merchant", label: "Record sale" },
  { href: "/merchant/overview", label: "Overview" },
  { href: "/merchant/settings", label: "BackPay settings" },
];

export function MerchantNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1">
      {items.map((i) => {
        const active = path === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
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