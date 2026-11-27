import { ButtonLink, Card, CtaBand, PageHero, Section, Tag } from "@/components/site/Blocks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "How it Works",
  description:
    "See how a purchase becomes a smart receipt, BackPay rewards and Gold Drop entries with RETURNi.",
  path: "/how-it-works",
});

const flow = [
  { title: "Merchant transaction", text: "A participating merchant records the customer’s purchase." },
  { title: "RETURNi processes it", text: "RETURNi checks and saves the purchase information." },
  {
    title: "Customer gets a smart receipt",
    text: "The receipt is created from the saved purchase and names the merchant.",
    tag: "WhatsApp delivery being activated",
  },
  { title: "Rewards are applied", text: "BackPay is earned, and eligible promotions apply." },
  { title: "Gold Drop entry", text: "Eligible purchases enter Gold Drop." },
  { title: "Customer keeps engaging", text: "The customer returns to participating merchants." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From a purchase to a reason to come back."
        text="One connected flow links the merchant, the receipt, the rewards and the customer."
      />

      <Section title="The RETURNi flow">
        <ol className="mx-auto max-w-2xl">
          {flow.map((s, i) => (
            <li key={s.title}>
              <div className="rounded-2xl border border-sage/60 bg-white p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-brand-navy">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted">{s.text}</p>
                    {s.tag && (
                      <p className="mt-2">
                        <Tag tone="amber">{s.tag}</Tag>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {i < flow.length - 1 && (
                <div aria-hidden="true" className="py-1 text-center text-xl text-brand-green">
                  ↓
                </div>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Two sides of the same purchase" tone="tint">
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="What the customer sees">
            <ul className="list-disc space-y-1 pl-5">
              <li>A receipt naming the merchant, items and total.</li>
              <li>BackPay earned and its expiry date.</li>
              <li>Gold Drop entry confirmation, when eligible.</li>
            </ul>
          </Card>
          <Card title="What the merchant sees">
            <ul className="list-disc space-y-1 pl-5">
              <li>The sale and the rewards it earned.</li>
              <li>The status of the receipt message.</li>
              <li>Only its own customers and sales, never other merchants’.</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="Built on consent and clear records">
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="One RETURNi sender">
            <p>
              Customers hear from RETURNi in one place, and each message says which
              merchant it is about.
            </p>
          </Card>
          <Card title="Consent first">
            <p>
              Receipts need the customer’s agreement. Promotions need separate agreement.
              Replying STOP opts out.
            </p>
          </Card>
          <Card title="Traceable rewards">
            <p>
              Every BackPay credit and redemption is recorded, so balances can be explained.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Where things stand today" tone="tint">
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Merchant portal" tag={<Tag tone="amber">In development</Tag>}>
            <p>Built and tested with sample data.</p>
          </Card>
          <Card title="WhatsApp receipts" tag={<Tag tone="amber">Upcoming</Tag>}>
            <p>Waiting for RETURNi’s WhatsApp Business account to be activated.</p>
          </Card>
          <Card title="Gold Drop draws" tag={<Tag tone="amber">Upcoming</Tag>}>
            <p>Starting with the first campaign.</p>
          </Card>
        </div>
      </Section>

      <CtaBand title="Want RETURNi in your business?">
        <ButtonLink href="/contact?topic=merchant" variant="light">
          Join as a Merchant
        </ButtonLink>
      </CtaBand>
    </>
  );
}