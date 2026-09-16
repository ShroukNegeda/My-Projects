"use client";

import { useLanguage } from "@/context/language-context";
import { ProcessSteps } from "../shared/process-steps";

export function AboutProcess() {
  const { t } = useLanguage();
  return (
    <section className="border-b border-border bg-bg py-20 sm:py-24">
      <div className="container-page">
        <ProcessSteps title={t.about.process.title} steps={t.about.process.steps} />
      </div>
    </section>
  );
}
