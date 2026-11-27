import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CONTACT } from "@/lib/site";

const col = "space-y-2 text-sm";
const link = "text-muted hover:text-brand-green";

export function SiteFooter() {
  return (
    <footer className="border-t border-sage/60 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <Logo width={130} />
          <p className="mt-3 text-sm font-semibold text-brand-navy">
            Every purchase deserves more.
          </p>
          <p className="mt-2 text-xs text-muted">
            RETURNi is a developing platform. Merchant and customer services are being
            introduced in stages.
          </p>
        </div>

        <nav aria-label="Company" className={col}>
          <p className="font-semibold text-brand-navy">Company</p>
          <Link className={`block ${link}`} href="/about">About</Link>
          <Link className={`block ${link}`} href="/leadership">Leadership</Link>
          <Link className={`block ${link}`} href="/contact">Contact</Link>
        </nav>

        <nav aria-label="Product" className={col}>
          <p className="font-semibold text-brand-navy">Explore</p>
          <Link className={`block ${link}`} href="/merchants">For merchants</Link>
          <Link className={`block ${link}`} href="/customers">For customers</Link>
          <Link className={`block ${link}`} href="/how-it-works">How it works</Link>
          <Link className={`block ${link}`} href="/privacy">Privacy Policy</Link>
          <Link className={`block ${link}`} href="/terms">Terms and Conditions</Link>
        </nav>

        <div className={col}>
          <p className="font-semibold text-brand-navy">Contact</p>
          {CONTACT.phones.map((p) => (
            <a key={p.href} className={`block ${link}`} href={p.href}>
              {p.display}
            </a>
          ))}
          <a className={`block break-all ${link}`} href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </div>
      </div>
      <div className="border-t border-sage/60 py-4 text-center text-xs text-muted">
        © 2026 RETURNi. All rights reserved.
      </div>
    </footer>
  );
}