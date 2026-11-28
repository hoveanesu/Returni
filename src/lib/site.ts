import type { Metadata } from "next";

export const SITE_NAME = "RETURNi";
export const TAGLINE = "Every Purchase Deserves More.";

// Set NEXT_PUBLIC_SITE_URL in production (for example https://yourdomain.com)
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

// PLACEHOLDER DETAILS: replace every value below with RETURNi's real details
// before launch. The privacy policy, terms, contact page and footer print these.
const DETAILS: Record<string, string> = {
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

// Each contact value works as a string, as a list (.map) and as an object (.display),
// so every page that uses CONTACT renders safely. Missing keys render as empty text.
type ContactValue = string[] & {
  display: string;
  href: string;
  label: string;
  value: string;
  text: string;
};

function contactValue(key: string, text: string): ContactValue {
  const digits = text.replace(/[^\d]/g, "");
  let href = text;
  if (/mail/i.test(key)) href = `mailto:${text}`;
  else if (/whatsapp/i.test(key)) href = `https://wa.me/${digits}`;
  else if (/phone|tel/i.test(key)) href = `tel:+${digits}`;
  return Object.assign([text], { display: text, href, label: text, value: text, text });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CONTACT: any = new Proxy(
  {},
  {
    get: (_target, key) =>
      typeof key === "string" ? contactValue(key, DETAILS[key] ?? "") : undefined,
  }
);

export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: "/how-it-works", label: "How it Works" },
  { href: "/merchants", label: "For Merchants" },
  { href: "/customers", label: "For Customers" },
  { href: "/about", label: "About" },
  { href: "/leadership", label: "Leadership" },
  { href: "/contact", label: "Contact" },
];

export type EnquiryCategory = { value: string; label: string };

// The contact form pre-selects one of these when a link ends in ?topic=value
export const ENQUIRY_CATEGORIES: EnquiryCategory[] = [
  { value: "general", label: "General enquiry" },
  { value: "merchant", label: "I run a business (merchant)" },
  { value: "customer", label: "I am a customer" },
  { value: "partnership", label: "Partnership" },
  { value: "support", label: "Support" },
  { value: "media", label: "Media and press" },
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