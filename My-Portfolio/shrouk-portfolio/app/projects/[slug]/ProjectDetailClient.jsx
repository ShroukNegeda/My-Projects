"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { featuredProjects } from "@/lib/data";

export default function ProjectDetailClient({ slug }) {
  const router = useRouter();
  const project = featuredProjects.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <p className="font-display text-4xl text-sand">Project not found.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-dawn-gold hover:text-dawn-blush transition">
          <ArrowLeft size={16} /> Back to portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 pt-10">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-mist hover:text-dawn-gold transition focus-ring">
          <ArrowLeft size={16} /> Back to projects
        </Link>
      </div>

      <article className="mx-auto max-w-4xl px-6 sm:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex flex-wrap gap-2 mb-5">
            {project.tags.map((t) => (
              <span key={t} className="rounded-full border border-dawn-gold/40 px-3 py-1 text-xs text-dawn-gold">
                {t}
              </span>
            ))}
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-semibold text-sand leading-tight">
            {project.name}
          </h1>

          <p className="mt-5 text-lg text-mist leading-relaxed max-w-2xl">
            {project.longDescription}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-sunrise-gradient px-6 py-3 text-sm font-semibold text-night hover:brightness-110 transition focus-ring">
              Live demo <ExternalLink size={15} />
            </a>
            <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-sand hover:border-dawn-gold/60 hover:text-dawn-gold transition focus-ring">
              GitHub <Github size={15} />
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-12 rounded-2xl overflow-hidden border border-white/10">
          <Image src={project.image} alt={`Screenshot of ${project.name}`} width={1200} height={675} className="w-full h-auto block"/>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-14 grid sm:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-2xl text-sand mb-5">Tech used</h2>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-sand">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl text-sand mb-5">Highlights</h2>
            <ul className="space-y-3">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sand/85 text-[15px] leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dawn-gold" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <div className="mt-20 pt-10 border-t border-white/10">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-dawn-gold mb-6">
            Other projects
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {featuredProjects
              .filter((p) => p.slug !== slug)
              .map((p) => (
                <Link key={p.slug} href={`/projects/${p.slug}`} className="rounded-2xl border border-white/10 bg-night-200/60 p-5 hover:border-dawn-gold/30 transition-colors focus-ring">
                  <h3 className="font-display text-lg text-sand">{p.name}</h3>
                  <p className="mt-1 text-xs text-mist line-clamp-2">{p.description}</p>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
}