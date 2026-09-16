"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Button } from "../button";

export function AboutHero() {
  const { t } = useLanguage();
  const a = t.about;

  return (
    <section className="relative overflow-hidden border-b border-border bg-bg-elevated">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-40"
        style={{
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 60% 70% at 50% 30%, black 30%, transparent 100%)",
        }}
      />
      <div className="container-page relative flex flex-col items-start py-20 sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {a.eyebrow}
        </span>

        <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-text sm:text-5xl">
          {a.heroTitleA}
          <br />
          {a.heroTitleB} <span className="text-accent">{a.heroTitleHighlight}</span>
        </h1>

        <p className="mt-6 max-w-lg text-base leading-relaxed text-text-muted">
          {a.heroDesc}
        </p>

        <Button href="/#start-project" size="lg" icon={<ArrowRight size={16} />} className="mt-8">
          {a.cta}
        </Button>

        <a
          href="#who-we-are"
          className="mt-14 flex items-center gap-2 text-sm font-medium text-text-faint transition-colors hover:text-text"
        >
          {a.explore}
          <ArrowDown size={14} />
        </a>
      </div>
    </section>
  );
}
