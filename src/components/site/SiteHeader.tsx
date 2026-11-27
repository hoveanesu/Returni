"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { NAV } from "@/lib/site";

export function SiteHeader() {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const active = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
  const linkCls = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-semibold ${
      active(href) ? "text-brand-green" : "text-brand-navy hover:text-brand-green"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-sage/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="RETURNi home" onClick={() => setOpen(false)}>
          <Logo width={130} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={linkCls(n.href)}
            >
              {n.label.toUpperCase()}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact?topic=merchant"
            className="hidden rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:opacity-90 sm:inline-block"
          >
            Join RETURNi
          </Link>
          <button
            type="button"
            className="rounded-lg border border-sage/70 px-3 py-2 text-sm font-semibold md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-sage/60 bg-white px-4 py-3 md:hidden"
        >
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={active(n.href) ? "page" : undefined}
                  className={`block ${linkCls(n.href)}`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contact?topic=merchant"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-xl bg-brand-green px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Join RETURNi
          </Link>
        </nav>
      )}
    </header>
  );
}