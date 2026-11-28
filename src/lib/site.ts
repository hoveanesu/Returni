import type { Metadata } from "next";

export const SITE_NAME = "RETURNi";
export const TAGLINE = "Every Purchase Deserves More.";

// Set NEXT_PUBLIC_SITE_URL in production (for example https://yourdomain.com)
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

// PLACEHOLDER DETAILS: replace every value below with RETURNi's real details
// before launch. The privacy policy and terms pages print these.
const CONTACT_DATA: Record<string, string> = {
  company: "RETURNi",
  legalName: "RETURNi",
  email: "hello@returni.example",
  supportEmail: "hello@returni.example",
  privacyEmail: "hello@returni.example",
  phone: "+263 00 000 0000",
  whatsapp: "+263 00 000 0000",
  address: "Harare, Zimbabwe",
  location: "Harare, Zimbabwe",
  city: "Harare",
  country: "Zimbabwe",
  hours: "Monday to Friday, 08:00 to 17:00 (CAT)",
  website: SITE_URL,
};

// A missing key returns "" instead of undefined, so a page never prints "undefined".
export const CONTACT: Record<string, string> = new Proxy(CONTACT_DATA, {
  get: (target, key) => (typeof key === "string" ? (target[key] ?? "") : undefined),
});

export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: "/how-it-works", label: "How it Works" },
  { href: "/merchants", label: "For Merchants" },
  { href: "/customers", label: "For Customers" },
  { href: "/about", label: "About" },
  { href: "/leadership", label: "Leadership" },
  { href: "/contact", label: "Contact" },
];

type PageMetaInput = {
  title: string;
  description?: string;
  path?: string;
  [key: string]: unknown;
};

export function pageMeta({ title, description, path }: PageMetaInput): Metadata {
  const full = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const desc = description ?? TAGLINE;
  return {
    title: { absolute: full },
    description: desc,
    alternates: path ? { canonical: path } : undefined,
    openGraph: {
      title: full,
      description: desc,
      siteName: SITE_NAME,
      url: path ? `${SITE_URL}${path}` : SITE_URL,
      type: "website",
    },
  };
}