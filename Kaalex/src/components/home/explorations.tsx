"use client";

import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { SectionHeading } from "../shared/section-heading";

const photoIds = [180, 60, 3];

export function Explorations() {
  const { t } = useLanguage();
  const e = t.home.explorations;

  return (
    <section className="border-b border-border bg-bg py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading title={e.title} desc={e.desc} />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photoIds.map((id, i) => (
            <div
              key={id}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative h-48 bg-bg-elevated">
                <Image
                  src={`https://picsum.photos/id/${id}/640/420`}
                  alt={e.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <span className="absolute top-4 rtl:right-4 ltr:left-4 rounded-full bg-bg/90 px-2.5 py-1 text-[11px] font-medium text-text backdrop-blur-sm">
                  {e.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-base font-semibold text-text">
                  {e.name}
                </h3>
                <p className="mt-1 text-sm text-text-muted">{e.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
