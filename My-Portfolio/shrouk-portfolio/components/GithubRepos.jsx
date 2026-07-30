"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FolderGit2, GitFork, Star } from "lucide-react";
import SpotlightCard from "./SpotlightCard";
import FadeIn from "./FadeIn";
import { profile } from "@/lib/data";

const langColors = {
  JavaScript: "#F1C453",
  TypeScript: "#4FA8FF",
  HTML: "#FF7A52",
  CSS: "#B84C2E",
  SCSS: "#FFB199",
};

export default function GithubRepos() {
  const [repos, setRepos] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.github.com/users/${profile.githubUser}/repos?sort=updated&per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        if (cancelled) return;
        const cleaned = data.filter((r) => !r.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 9);
        if (cleaned.length === 0) throw new Error();
        setRepos(cleaned);
        setStatus("live");
      })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <p className="mb-6 font-mono text-xs text-mist">
        {status === "loading" && "fetching api.github.com ..."}
        {status === "live" && "● live data from the GitHub API"}
        {status === "error" && "● could not reach GitHub API"}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {status === "loading" &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl border border-white/10 bg-night-200/40 animate-pulse" />
          ))}

        {repos?.map((repo, i) => (
          <FadeIn key={repo.name} delay={i * 0.06}>
            <SpotlightCard className="h-full">
              <a href={repo.html_url} target="_blank" rel="noreferrer" className="flex h-full flex-col justify-between p-6 focus-ring">
                <div>
                  <div className="flex items-center justify-between">
                    <FolderGit2 size={20} className="text-dawn-gold" />
                    <div className="flex items-center gap-3 text-xs text-mist">
                      <span className="flex items-center gap-1"><Star size={13} /> {repo.stargazers_count}</span>
                      <span className="flex items-center gap-1"><GitFork size={13} /> {repo.forks_count}</span>
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-xl text-sand">{repo.name}</h3>
                  <p className="mt-2 text-sm text-mist leading-relaxed line-clamp-3">
                    {repo.description || "No description provided yet."}
                  </p>
                </div>
                {repo.language && (
                  <div className="mt-6 flex items-center gap-1.5 text-xs text-mist">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: langColors[repo.language] || "#94A0B8" }} />
                    {repo.language}
                  </div>
                )}
              </a>
            </SpotlightCard>
          </FadeIn>
        ))}
      </div>
    </>
  );
}