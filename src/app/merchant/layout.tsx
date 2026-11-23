import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MerchantNav } from "@/components/MerchantNav";
import { MOCK_MERCHANT } from "@/lib/mock";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <header className="flex items-center justify-between">
        <Link href="/"><Logo className="text-xl" /></Link>
        <span className="text-sm text-muted">{MOCK_MERCHANT.name}</span>
      </header>
      <div className="mt-4"><MerchantNav /></div>
      <main className="mt-5">{children}</main>
    </div>
  );
}