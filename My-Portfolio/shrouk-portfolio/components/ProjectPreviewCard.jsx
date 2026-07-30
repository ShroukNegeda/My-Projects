"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import FadeIn from "./FadeIn";
import SpotlightCard from "./SpotlightCard";

export default function ProjectPreviewCard({ project, delay = 0 }) {
  return (
    <FadeIn delay={delay}>
      <SpotlightCard className="h-full">
        <Link href={`/projects/${project.slug}`} className="flex h-full flex-col focus-ring">
          <div className="relative aspect-[2.1/1] overflow-hidden border-b border-white/10 bg-night-100">
            <Image src={project.image} alt={`Screenshot of ${project.name}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top"/>
            <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-night/80 backdrop-blur">
              <ExternalLink size={14} className="text-dawn-gold" />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              <h3 className="font-display text-2xl text-sand">{project.name}</h3>
              <p className="mt-2 text-sm text-mist leading-relaxed">
                {project.description}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-mist"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Link>
      </SpotlightCard>
    </FadeIn>
  );
}