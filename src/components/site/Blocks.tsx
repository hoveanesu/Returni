import Link from "next/link";

// Shared building blocks for the public RETURNi website.
// Uses the colours from globals.css (brand-green, brand-navy, brand-blue, sage...).

export const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";

type Variant = "primary" | "secondary" | "ghost" | "light";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-green text-white hover:brightness-95",
  secondary: "border border-sage bg-surface text-brand-navy hover:bg-surface-alt",
  ghost: "text-brand-green hover:bg-brand-green/10",
  light: "bg-white text-brand-green hover:bg-white/90",
};

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  [key: string]: unknown;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  const cls = `inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${VARIANTS[variant]} ${className}`;
  const external =
    href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
  if (external) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

type CardProps = {
  children?: React.ReactNode;
  title?: string;
  text?: string;
  className?: string;
  [key: string]: unknown;
};

export function Card({ children, title, text, className = "" }: CardProps) {
  return (
    <div className={`rounded-2xl border border-sage/60 bg-surface p-6 shadow-sm ${className}`}>
      {title && <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>}
      {text && <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>}
      {children}
    </div>
  );
}

type SectionProps = {
  children?: React.ReactNode;
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  tone?: "default" | "alt" | "dark";
  className?: string;
  [key: string]: unknown;
};

const TONES = {
  default: "bg-app",
  alt: "bg-surface-alt/50",
  dark: "bg-brand-navy text-white",
};

export function Section({
  children,
  id,
  eyebrow,
  title,
  intro,
  tone = "default",
  className = "",
}: SectionProps) {
  const dark = tone === "dark";
  return (
    <section id={id} className={`py-14 sm:py-20 ${TONES[tone]} ${className}`}>
      <div className={container}>
        {(eyebrow || title || intro) && (
          <div className="mb-10 max-w-2xl">
            {eyebrow && (
              <p className={`text-sm font-semibold uppercase tracking-wide ${dark ? "text-sage" : "text-brand-green"}`}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            )}
            {intro && (
              <p className={`mt-3 text-base leading-relaxed ${dark ? "text-white/80" : "text-muted"}`}>
                {intro}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

type TagProps = {
  children: React.ReactNode;
  tone?: "green" | "blue" | "gold" | "neutral";
  className?: string;
  [key: string]: unknown;
};

const TAG_TONES = {
  green: "bg-brand-green/10 text-brand-green",
  blue: "bg-brand-blue/10 text-brand-blue",
  gold: "bg-amber-100 text-amber-700",
  neutral: "bg-surface-alt text-muted",
};

export function Tag({ children, tone = "green", className = "" }: TagProps) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${TAG_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

type Step = {
  title: string;
  text?: string;
  body?: string;
  description?: string;
};

type StepsProps = {
  steps?: Step[];
  items?: Step[];
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

export function Steps({ steps, items, children, className = "" }: StepsProps) {
  const list = steps ?? items ?? [];
  return (
    <ol className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {list.map((s, i) => (
        <li
          key={`${s.title}-${i}`}
          className="rounded-2xl border border-sage/60 bg-surface p-5 shadow-sm"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
            {i + 1}
          </span>
          <h3 className="mt-3 font-semibold text-brand-navy">{s.title}</h3>
          {(s.text ?? s.body ?? s.description) && (
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {s.text ?? s.body ?? s.description}
            </p>
          )}
        </li>
      ))}
      {children}
    </ol>
  );
}

type CtaBandProps = {
  title?: string;
  text?: string;
  description?: string;
  children?: React.ReactNode;
  href?: string;
  label?: string;
  className?: string;
  [key: string]: unknown;
};

export function CtaBand({
  title,
  text,
  description,
  children,
  href,
  label,
  className = "",
}: CtaBandProps) {
  const body = text ?? description;
  return (
    <section className={`py-14 sm:py-16 ${className}`}>
      <div className={container}>
        <div className="rounded-3xl bg-brand-green px-6 py-10 text-center text-white sm:px-12">
          {title && <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>}
          {body && <p className="mx-auto mt-3 max-w-xl text-white/90">{body}</p>}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {href && label && (
              <ButtonLink href={href} variant="light">
                {label}
              </ButtonLink>
            )}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}