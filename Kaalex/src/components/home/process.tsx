"use client";

import { useLanguage } from "@/context/language-context";
import { ProcessSteps } from "../shared/process-steps";

export function Process() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-border bg-bg py-20 sm:py-24">
      <div className="container-page">
        <ProcessSteps title={t.home.process.title} steps={t.home.process.steps} />
      </div>
    </section>
  );
}
