import { ButtonLink, Card, CtaBand, PageHero, Section } from "@/components/site/Blocks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "For Customers",
  description:
    "Your purchases should give you more. Get smart receipts, earn BackPay and take part in Gold Drop with participating RETURNi merchants.",
  path: "/customers",
});

export default function CustomersPage() {
  return (
    <>
      <PageHero
        eyebrow="For customers"
        title="Your purchases should give you more."
        text="With participating RETURNi merchants, an everyday purchase can come with a clear receipt, a reward and a chance to win."
      />

      <Section title="What you get">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card title="Digital purchase receipts">
            <p>Receive a clear receipt that names the merchant and lists what you bought.</p>
          </Card>
          <Card title="BackPay rewards">
            <p>See the BackPay you earn from qualifying purchases.</p>
          </Card>
          <Card title="Qualifying offers">
            <p>Unlock eligible offers with your BackPay, under each merchant’s rules.</p>
          </Card>
          <Card title="Expiry information">
            <p>See when your BackPay expires, so you can use it in time.</p>
          </Card>
          <Card title="Gold Drop">
            <p>Eligible purchases from participating merchants give you draw entries.</p>
          </Card>
          <Card title="Important updates">
            <p>Get important RETURNi updates about your account and rewards.</p>
          </Card>
        </div>
      </Section>

      <Section
        title="BackPay and Gold Drop are different"
        intro="They are never combined, and one does not change the other."
        tone="tint"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-brand-green bg-white p-6">
            <h3 className="text-xl font-bold text-brand-green">BackPay</h3>
            <p className="mt-2 text-sm text-muted">
              BackPay is RETURNi’s reward mechanism. It gives you value for qualifying
              purchases. You can build up a balance and use it to unlock eligible offers
              according to the applicable merchant’s rules.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
              <li>It is a reward balance, not cash and not airtime.</li>
              <li>Rules can differ between merchants.</li>
              <li>It can expire, and the expiry date is shown to you.</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6">
            <h3 className="text-xl font-bold text-amber-800">Gold Drop</h3>
            <p className="mt-2 text-sm text-amber-900/80">
              Gold Drop gives customers who purchase from participating RETURNi merchants
              opportunities to be selected for rewards.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900/80">
              <li>
                At first, a campaign may offer airtime vouchers through weekly draws.
                Future rewards depend on campaign rules and available funding.
              </li>
              <li>Entries come from eligible purchases. They are not a balance.</li>
              <li>Taking part does not guarantee a reward.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="You stay in control">
        <div className="max-w-3xl space-y-3 text-muted">
          <p>
            RETURNi sends you receipts and reward updates on WhatsApp only when you have
            agreed to receive them. Promotional messages need your separate agreement.
          </p>
          <p>You can reply STOP to a RETURNi message to opt out.</p>
        </div>
      </Section>

      <CtaBand
        title="Discover participating RETURNi merchants"
        text="Participating merchants will be shown as they join. Ask your favourite shop about RETURNi, or contact us."
      >
        <ButtonLink href="/contact?topic=customer" variant="light">
          Contact us
        </ButtonLink>
      </CtaBand>
    </>
  );
}