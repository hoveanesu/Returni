import Link from "next/link";
import { ButtonLink, Card, CtaBand, PageHero, Section } from "@/components/site/Blocks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "About",
  description:
    "RETURNi is a customer retention and engagement platform that helps merchants build lasting relationships with customers.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About RETURNi"
        title="Helping businesses build customers who come back."
        text="RETURNi is a customer retention and engagement platform. It gives merchants smart digital receipts, BackPay rewards, promotions and Gold Drop, so that each purchase can lead to the next."
      />

      <Section title="What RETURNi is">
        <div className="max-w-3xl space-y-4 text-muted">
          <p>
            RETURNi connects merchants and customers through the moment that already
            happens every day: a purchase. After the sale, the customer receives a smart
            receipt, earns BackPay on qualifying purchases and can take part in Gold Drop.
            The merchant gets a practical way to stay in touch and to reward the customers
            who return.
          </p>
          <p>
            RETURNi is a practical business growth and customer retention service, powered
            by technology and intelligent automation. It is not only a points application.
          </p>
        </div>
      </Section>

      <Section title="Why RETURNi exists" tone="tint">
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="The retention problem">
            <p>
              Many businesses work hard to attract a customer, then have no simple way to
              bring that customer back. The sale ends and the relationship goes quiet.
            </p>
          </Card>
          <Card title="Why repeat purchases matter">
            <p>
              Customers who come back are usually easier to serve than new ones. Repeat
              purchases help a business plan, grow and keep its regulars.
            </p>
          </Card>
          <Card title="Why digital receipts help">
            <p>
              A digital receipt reaches the customer after they leave. It is a natural
              place to show rewards earned and reasons to return.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="How BackPay and Gold Drop help">
        <div className="max-w-3xl space-y-4 text-muted">
          <p>
            <b className="text-brand-navy">BackPay</b> rewards qualifying purchases with a
            balance that customers can use to unlock eligible offers, under each
            merchant’s rules.
          </p>
          <p>
            <b className="text-brand-navy">Gold Drop</b> adds an extra reason to buy:
            eligible purchases can enter a draw. It is separate from BackPay, and the two
            are never combined.
          </p>
        </div>
      </Section>

      <Section tone="tint">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-sage/60 bg-white p-6">
            <h2 className="text-xl font-bold text-brand-navy">Our mission</h2>
            <p className="mt-3 text-muted">
              To make every purchase more valuable by helping businesses build meaningful,
              lasting relationships with their customers.
            </p>
          </div>
          <div className="rounded-2xl border border-sage/60 bg-white p-6">
            <h2 className="text-xl font-bold text-brand-navy">Our vision</h2>
            <p className="mt-3 text-muted">
              To become a leading customer retention and engagement infrastructure
              connecting merchants and customers across Africa.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Where RETURNi is today">
        <div className="max-w-3xl space-y-4 text-muted">
          <p>
            RETURNi is a developing business and platform. We are building it in stages,
            starting with the merchant tools and smart receipts, and we are preparing to
            bring on participating merchants.
          </p>
          <p>
            We will describe our progress as it happens. To meet the people behind RETURNi,
            see our{" "}
            <Link className="font-semibold text-brand-green underline" href="/leadership">
              leadership page
            </Link>
            .
          </p>
        </div>
      </Section>

      <CtaBand title="Talk to us about RETURNi">
        <ButtonLink href="/contact?topic=merchant" variant="light">
          Join as a Merchant
        </ButtonLink>
        <ButtonLink href="/contact" variant="light">
          Contact us
        </ButtonLink>
      </CtaBand>
    </>
  );
}