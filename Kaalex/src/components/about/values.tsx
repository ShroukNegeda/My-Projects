"use client";

import { useLanguage } from "@/context/language-context";

export function Values() {
  const { t } = useLanguage();
  const v = t.about.values;

  return (
    <section className="border-b border-border bg-bg-elevated py-20 sm:py-24">
      <div className="container-page">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {v.eyebrow}
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {v.title}
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {v.items.map((item, i) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-7"
            >
              <span className="font-display text-2xl font-bold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-text">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
