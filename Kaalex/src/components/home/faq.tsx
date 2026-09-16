"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/context/language-context";

export function Faq() {
  const { t } = useLanguage();
  const f = t.home.faq;
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState(0);

  const activeTab = f.tabs[activeTabIndex] ?? f.tabs[0];
  const filtered = f.items.filter((item) => item.tag === activeTab);

  return (
    <section className="border-b border-border bg-bg py-20 sm:py-24">
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {f.title}
          </h2>
          <div className="flex w-fit items-center gap-1 rounded-full border border-border bg-surface p-1">
            {f.tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTabIndex(i);
                  setOpenIndex(0);
                }}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeTabIndex === i
                    ? "bg-accent text-accent-contrast"
                    : "text-text-muted hover:text-text"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {filtered.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={`${item.tag}-${i}`}
                className={clsx(
                  "rounded-2xl border p-5 transition-colors",
                  isOpen
                    ? "border-accent bg-surface sm:col-span-2"
                    : "border-border bg-surface"
                )}
              >
                <button
                  className="flex w-full items-start justify-between gap-4 text-start"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                >
                  <span>
                    <span className="mb-2 inline-block rounded-full bg-bg-elevated px-2.5 py-0.5 text-[11px] font-medium text-text-muted">
                      {item.tag}
                    </span>
                    <span className="block font-display text-base font-semibold text-text">
                      {item.q}
                    </span>
                  </span>
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-text">
                    {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
