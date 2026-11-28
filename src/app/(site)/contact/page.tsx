import { ContactForm } from "@/components/site/ContactForm";
import { PageHero, container } from "@/components/site/Blocks";
import { CONTACT, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact",
  description:
    "Contact RETURNi for merchant partnership enquiries, general questions and customer support.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to RETURNi."
        text="Merchant partnerships, general questions or customer support: send us a message or contact us directly."
      />
      <div className={`${container} grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_1.2fr]`}>
        <div className="space-y-4">
          <div className="rounded-2xl border border-sage/60 bg-white p-6">
            <h2 className="font-semibold text-brand-navy">Call us</h2>
            <ul className="mt-3 space-y-2">
              {CONTACT.phones.map((p) => (
                <li key={p.href}>
                  <a className="font-semibold text-brand-green hover:underline" href={p.href}>
                    {p.display}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-sage/60 bg-white p-6">
            <h2 className="font-semibold text-brand-navy">Email us</h2>
            <a
              className="mt-3 block break-all font-semibold text-brand-green hover:underline"
              href={`mailto:${CONTACT.email}`}
            >
              {CONTACT.email}
            </a>
          </div>
          <div className="rounded-2xl border border-sage/60 bg-surface-alt p-6 text-sm text-muted">
            <h2 className="font-semibold text-brand-navy">What can we help with?</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Merchant partnership enquiries</li>
              <li>General enquiries</li>
              <li>Customer support</li>
            </ul>
          </div>
        </div>
        <ContactForm />
      </div>
    </>
  );
}