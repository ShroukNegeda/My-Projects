"use client";

import { Layers, Sparkles, Target, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/language-context";

const icons = [Target, Layers, Sparkles, TrendingUp];

export function Partner() {
  const { t } = useLanguage();
  const p = t.home.partner;

  return (
    <section className="border-b border-border bg-bg-elevated py-20 sm:py-24">
      <div className="container-page">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {p.title}
          </h2>
          <p className="mt-3 text-base text-text-muted">{p.desc}</p>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {p.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div key={item.title}>
                <Icon size={22} className="text-accent" />
                <h3 className="mt-4 font-display text-base font-semibold text-text">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
