"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { ContactForm } from "../contact-form";

export function Hero() {
  const { t } = useLanguage();
  const h = t.home;

  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 70% 20%, black 40%, transparent 100%)",
        }}
      />
      <div className="container-page relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {h.eyebrow}
          </span>

          <h1 className="mt-6 max-w-xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-text sm:text-5xl">
            {h.heroTitleA}{" "}
            <span className="text-accent">{h.heroTitleHighlight}</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-text-muted">
            {h.heroDesc}
          </p>

          <ul className="mt-7 space-y-3">
            {h.heroPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-text">
                <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-6 text-xs text-text-faint">
            {h.heroTags.map((tag, i) => (
              <span key={tag} className="flex items-center gap-2">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-border" />}
                {tag}
              </span>
            ))}
          </div>
        </div>

        <ContactForm id="start-project" />
      </div>
    </section>
  );
}
