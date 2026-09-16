"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  ArrowUpRight,
  BarChart3,
  Globe,
  Megaphone,
  Palette,
  Smartphone,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { SectionHeading } from "../shared/section-heading";

const icons = [Globe, Smartphone, Palette, BarChart3, Megaphone];
const photoIds = [0, 48, 96, 119, 20];

export function ServicesShowcase() {
  const { t, dir } = useLanguage();
  const h = t.home;
  const [active, setActive] = useState(0);

  return (
    <section className="border-b border-border bg-bg py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading title={h.servicesTitle} desc={h.servicesDesc} />

        <div className="mt-12 flex h-[420px] gap-2 overflow-hidden rounded-2xl border border-border sm:gap-3">
          {h.services.map((service, i) => {
            const Icon = icons[i];
            const isActive = i === active;
            return (
              <button
                key={service.name}
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                className={clsx(
                  "group relative flex min-w-14 flex-col justify-between overflow-hidden rounded-xl border border-border text-start transition-[flex-grow] duration-500 ease-out sm:min-w-16",
                  isActive ? "flex-[6]" : "flex-[1]"
                )}
              >
                <Image
                  src={`https://picsum.photos/id/${photoIds[i]}/900/700`}
                  alt={service.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
                <div
                  className={clsx(
                    "absolute inset-0 transition-colors duration-500",
                    isActive
                      ? "bg-gradient-to-t from-black/85 via-black/35 to-black/10"
                      : "bg-black/55 group-hover:bg-black/40"
                  )}
                />

                {/* Collapsed state: vertical label */}
                <div
                  className={clsx(
                    "absolute inset-0 flex flex-col items-center justify-between p-4 transition-opacity duration-300",
                    isActive ? "opacity-0" : "opacity-100 delay-150"
                  )}
                >
                  <Icon size={18} className="shrink-0 text-accent" />
                  <span
                    className="whitespace-nowrap text-sm font-semibold tracking-wide text-white"
                    style={{
                      writingMode: "vertical-rl",
                      transform: dir === "rtl" ? "rotate(0deg)" : "rotate(180deg)",
                    }}
                  >
                    {service.name}
                  </span>
                  <span className="h-1 w-1 shrink-0 rounded-full bg-white/50" />
                </div>

                {/* Expanded state: full content */}
                <div
                  className={clsx(
                    "relative flex h-full flex-col justify-between p-6 transition-opacity duration-300 sm:p-8",
                    isActive ? "opacity-100 delay-150" : "pointer-events-none opacity-0"
                  )}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-accent backdrop-blur-sm">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
                      {service.name}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/75">
                      {service.desc}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                      {h.learnMore}
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
