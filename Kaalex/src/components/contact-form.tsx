"use client";

import { useLanguage } from "@/context/language-context";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

export function ContactForm({
  className,
  id,
}: {
  className?: string;
  id?: string;
}) {
  const { t } = useLanguage();
  const f = t.home.form;

  return (
    <form
      id={id}
      onSubmit={(e) => e.preventDefault()}
      className={clsx(
        "w-full scroll-mt-24 rounded-2xl border border-border bg-surface p-6 sm:p-7",
        className
      )}
    >
      <h3 className="font-display text-lg font-semibold text-text">{f.title}</h3>
      <p className="mt-1.5 text-sm text-text-muted">{f.desc}</p>

      <div className="mt-6 space-y-4">
        <Field label={f.fullName} name="fullName" />
        <Field label={f.email} name="email" type="email" />
        <div className="grid grid-cols-2 gap-4">
          <Field label={f.need} name="need" />
          <Field label={f.budget} name="budget" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            {f.details}
          </label>
          <textarea
            name="details"
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-bg-elevated px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-2"
      >
        {f.submit}
        <ArrowRight size={15} />
      </button>
      <p className="mt-3 text-center text-xs text-text-faint">{f.note}</p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-muted">
        {label}
      </label>
      <input
        type={type}
        name={name}
        className="w-full rounded-lg border border-border bg-bg-elevated px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
      />
    </div>
  );
}
