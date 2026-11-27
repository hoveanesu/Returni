import Link from "next/link";
import type { ReactNode } from "react";

export const container = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "light";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";
  const styles = {
    primary: "bg-brand-green text-white hover:opacity-90",
    ghost: "border border-brand-green text-brand-green hover:bg-surface-alt",
    light: "bg-white text-brand-green hover:bg-surface-alt",
  }[variant];
  const cls = `${base} ${styles} ${className}`;
  if (href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={cls}>
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

export function Tag({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "amber" | "green";
}) {
  const cls = {
    blue: "bg-surface-alt text-brand-blue",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
  }[tone];
  return (
    <span className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

export function PageHero({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-sage/60 bg-surface-alt">
      <div className={`${container} py-14 sm:py-20`}>
        {eyebrow && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-green">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-brand-navy sm:text-5xl">
          {title}
        </h1>
        {text && <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">{text}</p>}
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function Section({
  id,
  title,
  intro,
  tone = "plain",
  children,
}: {
  id?: string;
  title?: string;
  intro?: string;
  tone?: "plain" | "tint";
  children: ReactNode;
}) {
  return (
    <section id={id} className={tone === "tint" ? "bg-surface-alt" : "bg-white"}>
      <div className={`${container} py-12 sm:py-16`}>
        {title && <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">{title}</h2>}
        {intro && <p className="mt-3 max-w-2xl text-muted">{intro}</p>}
        <div className={title || intro ? "mt-8" : ""}>{children}</div>
      </div>
    </section>
  );
}

export function Card({
  title,
  tag,
  children,
}: {
  title: string;
  tag?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-sage/60 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
        {tag}
      </div>
      <div className="mt-2 space-y-2 text-sm text-muted">{children}</div>
    </div>
  );
}

export function Steps({
  steps,
}: {
  steps: { title: string; text: string; tag?: string }[];
}) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.title} className="rounded-2xl border border-sage/60 bg-white p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
            {i + 1}
          </span>
          <h3 className="mt-3 font-semibold text-brand-navy">{s.title}</h3>
          <p className="mt-1 text-sm text-muted">{s.text}</p>
          {s.tag && (
            <p className="mt-2">
              <Tag tone="amber">{s.tag}</Tag>
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function CtaBand({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-brand-green">
      <div className={`${container} py-12 text-center text-white sm:py-16`}>
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        {text && <p className="mx-auto mt-3 max-w-2xl text-white/90">{text}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
      </div>
    </section>
  );
}
