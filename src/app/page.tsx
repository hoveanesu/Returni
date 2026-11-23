import Link from "next/link";
import { Logo } from "@/components/Logo";
import { card } from "@/lib/ui";

const areas = [
  { href: "/merchant", title: "Merchant", text: "Record a sale, set BackPay, see your results.", ready: true },
  { href: "/join", title: "Customer sign-up", text: "The page customers open from the link in their receipt.", ready: true },
  { href: "#", title: "Customer dashboard", text: "BackPay, offers and Gold Drop entries. Coming next.", ready: false },
  { href: "#", title: "Admin", text: "Merchants, settings and the weekly draw. Coming next.", ready: false },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Logo className="text-2xl" />
      <h1 className="mt-8 text-4xl font-bold tracking-tight">Every Purchase Deserves More</h1>
      <p className="mt-3 text-muted">
        Smart Receipts on WhatsApp, BackPay rewards, RETURNi Prices and the weekly Gold Drop.
      </p>
      <p className="mt-4 inline-block rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-brand-blue">
        Demo mode: all numbers on these screens are sample data
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {areas.map((a) =>
          a.ready ? (
            <Link key={a.title} href={a.href} className={`${card} block hover:border-brand-green`}>
              <h2 className="text-lg font-semibold">{a.title}</h2>
              <p className="mt-1 text-sm text-muted">{a.text}</p>
            </Link>
          ) : (
            <div key={a.title} className={`${card} opacity-60`}>
              <h2 className="text-lg font-semibold">{a.title}</h2>
              <p className="mt-1 text-sm text-muted">{a.text}</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}