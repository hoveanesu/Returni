import { LegalPage, type LegalSection } from "@/components/site/LegalPage";
import { CONTACT, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms and Conditions",
  description:
    "The terms for using RETURNi, including BackPay rules, Gold Drop eligibility and merchant and customer responsibilities. Draft terms.",
  path: "/terms",
});

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: [
      "These terms apply to your use of RETURNi, a developing customer retention and engagement platform. By using RETURNi, you agree to them.",
    ],
  },
  {
    id: "use",
    title: "Use of RETURNi",
    body: [
      "RETURNi connects participating merchants and their customers through smart receipts, BackPay, merchant promotions and Gold Drop. You must use it lawfully and as these terms allow.",
    ],
  },
  {
    id: "merchants",
    title: "Merchant responsibilities",
    body: [
      {
        list: [
          "Record only real purchases, accurately.",
          "Obtain the customer’s agreement before registering their number for receipts and rewards messages.",
          "Keep staff accounts and access secure.",
          "Honour the RETURNi Prices and promotions you publish.",
          "Follow the law that applies to your business.",
        ],
      },
    ],
  },
  {
    id: "customers",
    title: "Customer responsibilities",
    body: [
      "Give accurate information, keep your WhatsApp number up to date, and do not misuse rewards or entries.",
    ],
  },
  {
    id: "receipts",
    title: "Smart receipts",
    body: [
      "A smart receipt is a record of a purchase created from the information the merchant recorded. It is sent through WhatsApp where the customer has agreed. We cannot guarantee that every message is delivered.",
    ],
  },
  {
    id: "backpay",
    title: "BackPay",
    body: [
      "BackPay is a reward balance given for qualifying purchases at participating merchants, calculated under the applicable rules.",
      {
        list: [
          "BackPay is not cash, not airtime and not a bank deposit.",
          "It has no cash value unless RETURNi states otherwise in writing.",
          "It may be reversed if a purchase is reversed or refunded, or if it was earned in error or through misuse.",
        ],
      },
    ],
  },
  {
    id: "merchant-conditions",
    title: "Merchant-specific reward conditions",
    body: [
      "Merchants set their reward conditions within RETURNi’s platform limits. These can include the reward rate, the minimum qualifying purchase, the maximum reward, and the BackPay needed to unlock each RETURNi Price. Offers can have start and end dates and limited quantities.",
    ],
  },
  {
    id: "expiry",
    title: "Reward expiry",
    body: [
      "BackPay can expire. The expiry date is shown to the customer. Expired BackPay cannot be used.",
    ],
  },
  {
    id: "gold-drop",
    title: "Gold Drop eligibility",
    body: [
      "Gold Drop is separate from BackPay. The two are never combined, and a Gold Drop entry is not a balance.",
      {
        list: [
          "Entries come from eligible purchases at participating merchants, under the campaign rules.",
          "An entry may be held until the customer registers their RETURNi account.",
          "An entry is cancelled if the purchase behind it is reversed.",
        ],
      },
    ],
  },
  {
    id: "draws",
    title: "Gold Drop draw conditions",
    body: [
      "Draws follow the rules of each campaign. Winners are selected through a controlled process that can be checked afterwards. Taking part does not guarantee a reward.",
      "Initially, a campaign may offer airtime vouchers through weekly draws. Future rewards depend on campaign rules and available funding. Campaign details can change.",
    ],
  },
  {
    id: "distribution",
    title: "Reward distribution",
    body: [
      "Winners are contacted using their registered WhatsApp number and may be asked to confirm their identity. Rewards are given as described in the campaign rules. Campaign rules also explain what happens to rewards that are not claimed.",
    ],
  },
  {
    id: "prohibited",
    title: "Prohibited activities",
    body: [
      {
        list: [
          "Recording false or staged purchases.",
          "Creating fake accounts or entries.",
          "Trying to get BackPay or Gold Drop entries unfairly.",
          "Sending messages through RETURNi without the customer’s agreement.",
          "Interfering with the service or trying to access other people’s information.",
        ],
      },
      "We may suspend or remove access, and reverse rewards or entries, where these rules are broken.",
    ],
  },
  {
    id: "availability",
    title: "Service availability",
    body: [
      "RETURNi is being developed in stages. We aim to keep it available but do not promise uninterrupted service.",
    ],
  },
  {
    id: "changes",
    title: "Changes to the service and these terms",
    body: [
      "We may change RETURNi, its rules and these terms. We will update the date and, where the change matters, tell people affected.",
    ],
  },
  {
    id: "legal",
    title: "Liability and governing law",
    body: [
      "Terms on liability, disputes and governing law will be added after legal review.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [`Email ${CONTACT.email}, or call ${CONTACT.phones.map((p) => p.display).join(" or ")}.`],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      intro="The rules for using RETURNi, including how BackPay and Gold Drop work."
      sections={sections}
    />
  );
}