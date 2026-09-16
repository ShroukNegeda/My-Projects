"use client";

import { useLanguage } from "@/context/language-context";

export function Positioning() {
  const { t } = useLanguage();
  const p = t.about.positioning;

  return (
    <section className="border-b border-border bg-[#f3f5ee] py-20 text-center sm:py-28 dark:bg-[#11160d]">
      <div className="container-page">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {p.eyebrow}
        </span>
        <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-5xl">
          {p.titleA} + <span className="text-accent">{p.titleHighlight}</span> +{" "}
          {p.titleB}
        </h2>

        <div className="mx-auto mt-10 max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-faint">
            {p.valueLabel}
          </span>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            {p.desc}
          </p>
        </div>
      </div>
    </section>
  );
}
