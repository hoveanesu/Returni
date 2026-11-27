import {
    ButtonLink,
    Card,
    CtaBand,
    Section,
    Steps,
    Tag,
    container,
  } from "@/components/site/Blocks";
  import { pageMeta } from "@/lib/site";
  
  export const metadata = pageMeta({
    title: "RETURNi | Every purchase deserves more.",
    absoluteTitle: true,
    description:
      "RETURNi helps businesses turn everyday purchases into lasting customer relationships with smart receipts, BackPay rewards, merchant promotions and Gold Drop.",
    path: "/",
  });
  
  function HeroVisual() {
    return (
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-3xl border border-sage/60 bg-white p-5 shadow-xl">
          <p className="text-xs font-semibold text-brand-blue">RETURNi | Smart Receipt</p>
          <p className="mt-1 font-bold text-brand-navy">Your Store Name</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li className="flex justify-between">
              <span>Rice 5kg</span>
              <span>$8.75</span>
            </li>
            <li className="flex justify-between">
              <span>Bread</span>
              <span>$1.00</span>
            </li>
          </ul>
          <div className="mt-3 flex justify-between border-t border-dashed border-sage pt-3 font-bold">
            <span>Total</span>
            <span>$9.75</span>
          </div>
          <div className="mt-3 rounded-xl bg-surface-alt px-3 py-2 text-sm">
            <span className="text-muted">BackPay earned </span>
            <span className="font-semibold text-brand-green">+$0.29</span>
          </div>
          <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Gold Drop: 1 entry confirmed
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          Illustration only. The names and amounts are samples.
        </p>
      </div>
    );
  }
  
  export default function HomePage() {
    return (
      <>
        <section className="bg-surface-alt">
          <div className={`${container} grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]`}>
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-green">
                Customer retention and engagement platform
              </p>
              <h1 className="text-4xl font-bold leading-tight text-brand-navy sm:text-6xl">
                Every purchase deserves more.
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
                RETURNi helps businesses turn everyday purchases into lasting customer
                relationships. Deliver smart receipts, reward customer loyalty and create
                reasons for customers to come back.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contact?topic=merchant">Join as a Merchant</ButtonLink>
                <ButtonLink href="/how-it-works" variant="ghost">
                  Discover RETURNi
                </ButtonLink>
              </div>
              <p className="mt-4 text-xs text-muted">
                RETURNi is a developing platform, being introduced in stages.
              </p>
            </div>
            <HeroVisual />
          </div>
        </section>
  
        <Section
          title="More from every purchase"
          intro="RETURNi gives businesses practical tools to stay in touch with customers after the sale, and gives customers a reason to come back."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card title="Smart Digital Receipts">
              <p>
                Every purchase becomes a clear digital record: the merchant, the items, the
                total and the rewards earned.
              </p>
            </Card>
            <Card title="BackPay Rewards">
              <p>
                Customers earn BackPay on qualifying purchases and use it to unlock eligible
                offers, under each merchant’s rules.
              </p>
            </Card>
            <Card title="Merchant Promotions">
              <p>
                Merchants create offers and campaigns for the customers who have agreed to
                hear from them.
              </p>
            </Card>
            <Card title="Gold Drop">
              <p>
                Eligible purchases give customers a chance to be selected in a draw. It is
                separate from BackPay.
              </p>
            </Card>
            <Card title="Engagement and retention">
              <p>
                Merchants can see how customers engage, which supports better decisions about
                rewards and promotions.
              </p>
            </Card>
            <Card title="Vest, RETURNi’s assistant" tag={<Tag tone="amber">Planned</Tag>}>
              <p>
                A planned intelligent assistant to help people get more from RETURNi. It is
                not available yet.
              </p>
            </Card>
          </div>
        </Section>
  
        <Section tone="tint">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-sage/60 bg-white p-6">
              <h2 className="text-xl font-bold text-brand-navy">For merchants</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                <li>Give customers a reason to return after every sale.</li>
                <li>Send smart receipts through RETURNi’s central messaging.</li>
                <li>Set reward rules that suit your business.</li>
                <li>Run promotions for customers who agreed to receive them.</li>
                <li>Keep your customer information separate from other merchants.</li>
              </ul>
              <div className="mt-5">
                <ButtonLink href="/merchants" variant="ghost">
                  Learn more for merchants
                </ButtonLink>
              </div>
            </div>
            <div className="rounded-2xl border border-sage/60 bg-white p-6">
              <h2 className="text-xl font-bold text-brand-navy">For customers</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                <li>Get a digital receipt for your purchase.</li>
                <li>See the BackPay you have earned and when it expires.</li>
                <li>Unlock eligible offers with your BackPay.</li>
                <li>Get entries into Gold Drop from eligible purchases.</li>
                <li>Choose what messages you receive, and stop them any time.</li>
              </ul>
              <div className="mt-5">
                <ButtonLink href="/customers" variant="ghost">
                  Learn more for customers
                </ButtonLink>
              </div>
            </div>
          </div>
        </Section>
  
        <Section
          title="Two different rewards"
          intro="BackPay and Gold Drop work differently and are never combined."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-brand-green bg-white p-6">
              <h3 className="text-lg font-bold text-brand-green">BackPay</h3>
              <p className="mt-2 text-sm text-muted">
                A reward balance earned from qualifying purchases. Customers use it to unlock
                eligible RETURNi offers according to each merchant’s rules. It can expire.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6">
              <h3 className="text-lg font-bold text-amber-800">Gold Drop</h3>
              <p className="mt-2 text-sm text-amber-900/80">
                A draw that eligible purchases can enter. Winners are selected under campaign
                rules. Entries are not a balance and do not add to BackPay.
              </p>
            </div>
          </div>
        </Section>
  
        <Section title="How RETURNi works" tone="tint">
          <Steps
            steps={[
              { title: "A customer buys", text: "The merchant records the purchase." },
              {
                title: "A smart receipt is sent",
                text: "RETURNi creates the receipt from the recorded purchase.",
                tag: "WhatsApp delivery being activated",
              },
              {
                title: "Rewards are applied",
                text: "BackPay is earned and eligible offers become available.",
              },
              {
                title: "Eligible purchases enter Gold Drop",
                text: "The customer keeps engaging with participating merchants.",
              },
            ]}
          />
          <div className="mt-6">
            <ButtonLink href="/how-it-works" variant="ghost">
              See the full picture
            </ButtonLink>
          </div>
        </Section>
  
        <CtaBand
          title="Ready to give your customers a reason to return?"
          text="Tell us about your business and we will get in touch."
        >
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