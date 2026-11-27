import { PageHero, container } from "./Blocks";

export type LegalBlock = string | { list: string[] };
export type LegalSection = { id: string; title: string; body: LegalBlock[] };

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} text={intro} />
      <div className={`${container} py-10 sm:py-14`}>
        <p
          role="note"
          className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <b>Draft.</b> This document was prepared on 26 November 2026 and has not yet been
          reviewed by a lawyer. It will be reviewed before RETURNi launches publicly and may
          change.
        </p>
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <nav aria-label="On this page" className="text-sm lg:sticky lg:top-24 lg:self-start">
            <p className="mb-2 font-semibold text-brand-navy">On this page</p>
            <ol className="space-y-1.5">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a className="text-muted hover:text-brand-green" href={`#${s.id}`}>
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-3xl space-y-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-brand-navy">
                  {i + 1}. {s.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
                  {s.body.map((b, n) =>
                    typeof b === "string" ? (
                      <p key={n}>{b}</p>
                    ) : (
                      <ul key={n} className="list-disc space-y-1 pl-5">
                        {b.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}