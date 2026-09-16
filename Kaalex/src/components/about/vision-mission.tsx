"use client";

import { Compass, Rocket } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export function VisionMission() {
  const { t } = useLanguage();
  const v = t.about.vision;

  return (
    <section className="border-b border-border bg-bg py-20 sm:py-24">
      <div className="container-page">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {v.eyebrow}
        </span>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
          {v.title}
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-7">
            <Compass size={22} className="text-accent" />
            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">
              {v.visionTitle}
            </span>
            <h3 className="mt-1.5 font-display text-xl font-semibold text-text">
              {v.visionHeading}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {v.visionDesc}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-7">
            <Rocket size={22} className="text-accent" />
            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">
              {v.missionTitle}
            </span>
            <h3 className="mt-1.5 font-display text-xl font-semibold text-text">
              {v.missionHeading}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {v.missionDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
