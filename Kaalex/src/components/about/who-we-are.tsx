"use client";

import { Layers, Sparkles, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/language-context";

const icons = [Layers, Sparkles, TrendingUp];

export function WhoWeAre() {
  const { t } = useLanguage();
  const w = t.about.whoWeAre;

  return (
    <section id="who-we-are" className="border-b border-border bg-bg py-20 sm:py-24">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              {w.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
              {w.titleA}
              <br />
              {w.titleB}
            </h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-text-muted">
            <p>{w.desc1}</p>
            <p>{w.desc2}</p>
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {w.pillars.map((pillar, i) => {
            const Icon = icons[i];
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-elevated text-accent">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-text">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
