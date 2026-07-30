import FadeIn from "./FadeIn";

export default function SectionHeading({ eyebrow, title, description, align = "left" }) {
  return (
    <FadeIn className={align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}>
      {eyebrow && (
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-dawn-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-4xl sm:text-5xl font-medium text-sand">{title}</h2>
      {description && (
        <p className="mt-4 text-mist text-base sm:text-lg leading-relaxed">{description}</p>
      )}
    </FadeIn>
  );
}