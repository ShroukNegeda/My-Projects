"use client";

import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Button } from "../button";

export function NotSureCta() {
  const { t } = useLanguage();
  const c = t.home.notSure;

  const handleStartProject = () => {
    document.getElementById("start-project")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="border-b border-border bg-bg py-6">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-gradient-to-br from-surface to-bg-elevated p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h3 className="font-display text-xl font-semibold text-text sm:text-2xl">
              {c.title}
            </h3>
            <p className="mt-2 max-w-md text-sm text-text-muted">{c.desc}</p>
          </div>
          <Button
            href="#start-project"
            onClick={handleStartProject}
            size="lg"
            icon={<ArrowRight size={16} />}
            className="shrink-0"
          >
            {c.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
