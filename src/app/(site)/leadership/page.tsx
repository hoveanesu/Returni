import { ButtonLink, PageHero, Section } from "@/components/site/Blocks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Leadership",
  description: "Meet the person leading RETURNi.",
  path: "/leadership",
});

// To add someone later, add one more entry to this list.
const PEOPLE = [{ name: "Anesu Hove", role: "Founder", initials: "AH" }];

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="The people behind RETURNi."
        text="RETURNi is a developing business. More leadership and team profiles will be added as we grow."
      />
      <Section>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PEOPLE.map((p) => (
            <li
              key={p.name}
              className="flex items-center gap-4 rounded-2xl border border-sage/60 bg-white p-6"
            >
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-green text-xl font-bold text-white"
              >
                {p.initials}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-brand-navy">{p.name}</h2>
                <p className="text-sm text-muted">{p.role}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ButtonLink href="/contact" variant="ghost">
            Get in touch
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}