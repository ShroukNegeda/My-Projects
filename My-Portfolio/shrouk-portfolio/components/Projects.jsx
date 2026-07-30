"use client";

import { useEffect, useState } from "react";
import { ExternalLink, GitFork, Star, FolderGit2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import SpotlightCard from "./SpotlightCard";
import ProjectPreviewCard from "./ProjectPreviewCard";
import { profile, fallbackProjects, featuredProjects } from "@/lib/data";

const langColors = {
  JavaScript: "#F1C453",
  TypeScript: "#4FA8FF",
  HTML: "#FF7A52",
  CSS: "#B84C2E",
  SCSS: "#FFB199",
};

export default function Projects() {
  const [repos, setRepos] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadRepos() {
      try {
        const res = await fetch(`https://api.github.com/users/${profile.githubUser}/repos?sort=updated&per_page=100`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!res.ok) throw new Error("GitHub API error");
        const data = await res.json();

        const cleaned = data
          .filter((r) => !r.fork)
          .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
          .slice(0, 6);

        if (!cancelled) {
          if (cleaned.length === 0) throw new Error("No repos found");
          setRepos(cleaned);
          setStatus("live");
        }
      } catch (err) {
        if (!cancelled) {
          setRepos(fallbackProjects);
          setStatus("fallback");
        }
      }
    }

    loadRepos();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="projects" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeading eyebrow="Projects" title="Shipped and live" description="A few deployed builds first, then everything else pulled straight from my GitHub."/>

        <div className="mt-14 grid sm:grid-cols-2 gap-6">
          {featuredProjects.map((p, i) => (
            <ProjectPreviewCard key={p.name} project={p} delay={i * 0.07} />
          ))}
        </div>

        <div className="mt-24 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-dawn-gold mb-3">
              Live from GitHub
            </p>
            <h3 className="font-display text-2xl sm:text-3xl text-sand">
              More on my repositories
            </h3>
          </div>
          <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-dawn-gold hover:text-dawn-blush transition focus-ring mb-1">
            All repositories <ExternalLink size={15} />
          </a>
        </div>

        <p className="mt-4 font-mono text-xs text-mist">
          {status === "loading" && "fetching api.github.com/users/ShroukNegeda/repos ..."}
          {status === "live" && "● live data from the GitHub API"}
          {status === "fallback" && "● showing cached highlights (GitHub API unavailable)"}
        </p>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {status === "loading" &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl border border-white/10 bg-night-200/40 animate-pulse"/>
            ))}

          {repos &&
            repos.map((repo, i) => {
              const live = status === "live";
              const name = live ? repo.name : repo.name;
              const description = live
                ? repo.description || "No description provided yet."
                : repo.description;
              const url = live ? repo.html_url : repo.url;
              const language = live ? repo.language : repo.tags?.[0];

              return (
                <FadeIn key={name + i} delay={i * 0.06}>
                  <SpotlightCard className="h-full">
                    <a href={url} target="_blank" rel="noreferrer" className="flex h-full flex-col justify-between p-6 focus-ring">
                      <div>
                        <div className="flex items-center justify-between">
                          <FolderGit2 size={20} className="text-dawn-gold" />
                          {live && (
                            <div className="flex items-center gap-3 text-xs text-mist">
                              <span className="flex items-center gap-1">
                                <Star size={13} /> {repo.stargazers_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitFork size={13} /> {repo.forks_count}
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="mt-4 font-display text-xl text-sand group-hover:text-dawn-gold">
                          {name}
                        </h3>
                        <p className="mt-2 text-sm text-mist leading-relaxed line-clamp-3">
                          {description}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {live ? (
                          language && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-mist">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: langColors[language] || "#94A0B8",}}/>
                              {language}
                            </span>
                          )
                        ) : (
                          repo.tags.map((t) => (
                            <span key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-mist">
                              {t}
                            </span>
                          ))
                        )}
                      </div>
                    </a>
                  </SpotlightCard>
                </FadeIn>
              );
            })}
        </div>
      </div>
    </section>
  );
}