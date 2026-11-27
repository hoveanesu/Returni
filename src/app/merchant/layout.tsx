import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MerchantNav } from "@/components/MerchantNav";
import { StoreProvider } from "@/components/StoreProvider";
import { MOCK_MERCHANT } from "@/lib/mock";
export const metadata = {
  title: "Merchant portal",
  robots: { index: false, follow: false },
};

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-sage/60 bg-surface p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:self-start md:overflow-y-auto md:border-b-0 md:border-r md:p-5">
        <div className="flex items-center justify-between md:block">
          <Link href="/">
            <Logo width={140} />
          </Link>
          <div className="text-right md:mt-4 md:text-left">
            <p className="text-sm font-semibold">{MOCK_MERCHANT.name}</p>
            <p className="text-xs text-muted">{MOCK_MERCHANT.branch}</p>
          </div>
        </div>
        <div className="mt-4">
          <MerchantNav />
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 inline-block rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-brand-blue">
            Demo data: saved in this browser only
          </p>
          <StoreProvider>{children}</StoreProvider>
        </div>
      </main>
    </div>
  );
}
