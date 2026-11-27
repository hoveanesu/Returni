import { LegalPage, type LegalSection } from "@/components/site/LegalPage";
import { CONTACT, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description:
    "How RETURNi handles personal information, including WhatsApp messaging, BackPay records and Gold Drop participation. Draft policy.",
  path: "/privacy",
});

const contactLine = `${CONTACT.email}, or ${CONTACT.phones.map((p) => p.display).join(" / ")}`;

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About this policy",
    body: [
      "RETURNi is a developing customer retention and engagement platform. It provides smart digital receipts, BackPay rewards, merchant promotions and Gold Drop for participating merchants and their customers.",
      "This policy explains what personal information we handle and why. We handle customer information to provide RETURNi’s services.",
    ],
  },
  {
    id: "information",
    title: "Information we collect",
    body: [
      {
        list: [
          "Customer contact information: WhatsApp number, and name where given.",
          "Merchant information: business name, category, address, contact details, branches and staff names.",
          "Transaction information: the merchant, items, amounts, payment method, date and time, and receipt references.",
          "BackPay records: rewards earned, redeemed, expired, reversed or adjusted.",
          "Gold Drop participation: entries linked to eligible purchases, and draw results.",
          "Messaging records: messages sent, delivery status, consent records and opt-outs.",
          "Website enquiries: the name, email, phone number and message you send us.",
        ],
      },
    ],
  },
  {
    id: "use",
    title: "How we use information",
    body: [
      {
        list: [
          "To create and send smart receipts.",
          "To calculate, record and show BackPay.",
          "To run Gold Drop entries and draws.",
          "To send service messages about your purchases and rewards.",
          "To send promotions, only to customers who have agreed to receive them.",
          "To answer enquiries and give support.",
          "To keep the service secure and prevent misuse.",
          "To improve RETURNi.",
        ],
      },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp messaging",
    body: [
      "RETURNi sends receipts and notifications from one central RETURNi sender using the WhatsApp Business Platform, which is operated by Meta. Each message names the merchant it relates to.",
      "We send receipt and service messages where the customer has agreed to receive them. Promotional messages need separate agreement. Customers can reply STOP to opt out.",
      "Messages travel through WhatsApp and are also subject to WhatsApp’s own terms and privacy practices.",
    ],
  },
  {
    id: "sharing",
    title: "Who can see information",
    body: [
      "A merchant can see only the sales and customer information that relates to that merchant. Merchants cannot see other merchants’ records.",
      "RETURNi’s authorised team can access information needed to run the service. We also use service providers for hosting, messaging and email, who handle information for us.",
      "RETURNi does not sell customers’ personal information.",
    ],
  },
  {
    id: "storage-security",
    title: "Data storage and security",
    body: [
      "Information is stored with the hosting and database providers we use to run RETURNi. The specific providers and locations will be confirmed here before public launch.",
      "We use secure connections, access controls and protected credentials to reduce risk. No system can be guaranteed completely secure.",
    ],
  },
  {
    id: "retention",
    title: "Data retention",
    body: [
      "We keep information for as long as it is needed to provide the service, keep accurate reward and transaction records, handle disputes and meet our obligations.",
      "Specific retention periods will be set and published after legal review.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    body: [
      "You can ask us what information we hold about you, ask us to correct it, ask us to delete it, withdraw your consent to messages, and opt out of promotions.",
      `To make a request, contact us at ${contactLine}.`,
    ],
  },
  {
    id: "data-deletion",
    title: "Deleting your data",
    body: [
      `To ask us to delete your information, send a request to ${CONTACT.email} from the email address you used, or call ${CONTACT.phones[0].display}. Include the WhatsApp number linked to your RETURNi activity.`,
      "We will confirm the request and tell you what we can delete. Some records, such as reward and transaction records, may need to be kept for a period for accuracy, dispute handling or legal reasons.",
    ],
  },
  {
    id: "children",
    title: "Children",
    body: ["RETURNi is not directed at children. If you believe a child’s information has been shared with us, please contact us."],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: ["We may update this policy as RETURNi develops. We will update the date and, where the change matters, tell people affected."],
  },
  {
    id: "contact",
    title: "Contact for privacy enquiries",
    body: [`Email ${CONTACT.email}, or call ${CONTACT.phones.map((p) => p.display).join(" or ")}.`],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="How RETURNi handles personal information."
      sections={sections}
    />
  );
}