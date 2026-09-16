import clsx from "clsx";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  desc?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
        {title}
      </h2>
      {desc && <p className="mt-3 text-base text-text-muted">{desc}</p>}
    </div>
  );
}
