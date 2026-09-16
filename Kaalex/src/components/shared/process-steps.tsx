export function ProcessSteps({
  title,
  steps,
}: {
  title: string;
  steps: readonly { title: string; desc: string }[];
}) {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
        {title}
      </h2>

      <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        <div className="absolute top-[7px] hidden h-px w-full bg-border lg:block" />
        {steps.map((step) => (
          <div key={step.title} className="relative">
            <span className="relative z-10 block h-3.5 w-3.5 rounded-full border-2 border-accent bg-bg" />
            <h3 className="mt-4 font-display text-base font-semibold text-text">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
