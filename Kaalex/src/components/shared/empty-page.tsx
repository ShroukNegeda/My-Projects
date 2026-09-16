import { Construction } from "lucide-react";

export function EmptyPage({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center border-b border-border bg-bg py-24">
      <div className="container-page flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-accent">
          <Construction size={24} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-base text-text-muted">{desc}</p>
      </div>
    </section>
  );
}
