import {
    ButtonLink,
    Card,
    CtaBand,
    PageHero,
    Section,
    Steps,
    Tag,
  } from "@/components/site/Blocks";
  import { pageMeta } from "@/lib/site";
  
  export const metadata = pageMeta({
    title: "For Merchants",
    description:
      "Turn every transaction into a reason to return. RETURNi gives merchants smart receipts, BackPay rewards, promotions and Gold Drop.",
    path: "/merchants",
  });
  
  export default function MerchantsPage() {
    return (
      <>
        <PageHero
          eyebrow="For merchants"
          title="Turn every transaction into a reason to return."
          text="RETURNi helps businesses of every kind keep the customers they already have, and give them reasons to come back."
        >
          <ButtonLink href="/contact?topic=merchant">Join as a Merchant</ButtonLink>
        </PageHero>
  
        <Section
          title="What RETURNi helps you do"
          intro="RETURNi is built for different industries, including grocery, clothing, food, electronics, salons and other service businesses."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card title="Retain existing customers">
              <p>Stay connected with customers after they leave your shop.</p>
            </Card>
            <Card title="Encourage repeat purchases">
              <p>Give customers a clear reason to come back and buy again.</p>
            </Card>
            <Card title="Send smart digital receipts">
              <p>Every receipt comes from the recorded sale and names your business.</p>
            </Card>
            <Card title="Offer BackPay rewards">
              <p>Set reward rules that fit your business, within RETURNi’s platform limits.</p>
            </Card>
            <Card title="Create targeted promotions">
              <p>Reach the customers who agreed to receive offers from you.</p>
            </Card>
            <Card title="Take part in Gold Drop">
              <p>Eligible purchases at your business can give customers draw entries.</p>
            </Card>
          </div>
          <p className="mt-6 max-w-3xl text-sm text-muted">
            RETURNi also helps you understand how customers engage with your rewards and
            offers. Each merchant sees only its own customers and sales.
          </p>
        </Section>
  
        <Section title="The merchant journey" tone="tint">
          <Steps
            steps={[
              { title: "Join RETURNi", text: "Tell us about your business through the contact form." },
              {
                title: "Set up your merchant profile",
                text: "Add your business details, branches, staff and receipt preferences.",
              },
              {
                title: "Record qualifying purchases",
                text: "Record each sale in the RETURNi merchant portal, with the customer’s WhatsApp number and consent.",
              },
              {
                title: "Customers receive smart receipts",
                text: "Receipts are sent through RETURNi’s central WhatsApp messaging system.",
                tag: "Upcoming: needs WhatsApp activation",
              },
              {
                title: "Customers engage",
                text: "Customers use BackPay, promotions and Gold Drop.",
                tag: "Upcoming: phased rollout",
              },
              {
                title: "Build stronger relationships",
                text: "Use what you learn to reward and reach your customers better.",
              },
            ]}
          />
        </Section>
  
        <Section title="What is ready and what is coming">
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Merchant portal" tag={<Tag tone="amber">In development</Tag>}>
              <p>
                Recording sales, BackPay, customers, analytics and settings are being built
                and tested with sample data.
              </p>
            </Card>
            <Card title="WhatsApp receipts" tag={<Tag tone="amber">Upcoming</Tag>}>
              <p>
                Live delivery starts once RETURNi’s WhatsApp Business account is activated.
                Until then, receipts are simulated in testing.
              </p>
            </Card>
            <Card title="Promotions messaging" tag={<Tag tone="amber">Upcoming</Tag>}>
              <p>Promotional messages need separate customer consent before they are sent.</p>
            </Card>
            <Card title="Gold Drop draws" tag={<Tag tone="amber">Upcoming</Tag>}>
              <p>Draws start with the first campaign. Details will be confirmed before launch.</p>
            </Card>
          </div>
        </Section>
  
        <CtaBand
          title="Interested in becoming a participating merchant?"
          text="Send us an enquiry. We will get back to you."
        >
          <ButtonLink href="/contact?topic=merchant" variant="light">
            Merchant enquiry
          </ButtonLink>
        </CtaBand>
      </>
    );
  }