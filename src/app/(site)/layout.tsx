import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RETURNi | Every purchase deserves more.",
    template: "%s | RETURNi",
  },
  description:
    "RETURNi helps businesses turn everyday purchases into lasting customer relationships with smart receipts, BackPay rewards, merchant promotions and Gold Drop.",
  applicationName: "RETURNi",
  openGraph: {
    siteName: "RETURNi",
    type: "website",
    images: [{ url: "/logo.jpeg", width: 1080, height: 687, alt: "RETURNi logo" }],
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}