import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import { experience } from "@/lib/data";

export default function Experience() {
  const timeline = [...experience].reverse();

  return (
    <section id="experience" className="relative py-28 sm:py-36 bg-night-100/40">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeading eyebrow="Leadership" title="Three years, one branch, growing roles" description="Alongside frontend work, I've run people-facing operations at IEEE — the same instincts for clarity and structure just applied to teams instead of components."/>

        <div className="mt-16 relative">
          <div className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-dawn-coral via-dawn-gold to-white/10" />

          <div className="space-y-12">
            {timeline.map((role, i) => (
              <FadeIn key={role.role} delay={i * 0.1}>
                <div className="relative pl-8 sm:pl-10">
                  <span className="absolute left-0 top-1.5 h-3.5 w-3.5 sm:h-[18px] sm:w-[18px] rounded-full border-2 border-dawn-gold bg-night" />
                  <p className="font-mono text-xs uppercase tracking-widest text-dawn-gold">
                    {role.period}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-sand">
                    {role.role}
                  </h3>
                  <p className="text-mist text-sm mt-1">{role.org}</p>
                  <ul className="mt-4 space-y-2">
                    {role.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sand/85 text-[15px] leading-relaxed">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-dawn-gold" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}