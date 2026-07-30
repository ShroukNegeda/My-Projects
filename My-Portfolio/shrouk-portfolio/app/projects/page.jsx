import Link from "next/link";
import { ArrowLeft, ExternalLink, FolderGit2, GitFork, Star } from "lucide-react";
import Image from "next/image";
import { featuredProjects, profile } from "@/lib/data";
import GithubRepos from "@/components/GithubRepos";

export const metadata = { title: "Projects — Shrouk Negeda" };

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-night py-24 px-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-mist hover:text-dawn-gold transition mb-12">
          <ArrowLeft size={15} /> Back to portfolio
        </Link>

        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dawn-gold mb-3">Projects</p>
        <h1 className="font-display text-4xl sm:text-5xl text-sand mb-16">All my work</h1>

        <section className="mb-24">
          <h2 className="font-display text-2xl text-sand mb-8">Featured builds</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {featuredProjects.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`}
                className="group rounded-2xl border border-white/10 bg-night-200/40 overflow-hidden hover:border-dawn-gold/30 transition">
                <div className="relative aspect-[2.1/1] overflow-hidden bg-night-100">
                  <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top group-hover:scale-105 transition duration-500"/>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-sand group-hover:text-dawn-gold transition">{p.name}</h3>
                  <p className="mt-2 text-sm text-mist leading-relaxed line-clamp-2">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-mist">{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <h2 className="font-display text-2xl text-sand">GitHub repositories</h2>
            <a href={profile.github} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-dawn-gold hover:text-dawn-blush transition">
              View all <ExternalLink size={14} />
            </a>
          </div>
          <GithubRepos />
        </section>
      </div>
    </main>
  );
}