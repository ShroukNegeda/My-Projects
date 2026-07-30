import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import { skills } from "@/lib/data";

const allTech = skills.flatMap((s) => s.items);
const marqueeItems = [...allTech, ...allTech];

export default function Skills() {
  return (
    <section id="skills" className="relative py-28 sm:py-36 bg-night-100/40">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeading eyebrow="Skills" title="What I actually reach for" description="A working toolkit built through two frontend training programs, 15+ shipped projects, and a habit of finishing what I start."/>

        <div className="mt-14 grid sm:grid-cols-2 gap-6">
          {skills.map((group, i) => (
            <FadeIn key={group.category} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-white/10 bg-night-200/60 p-7 hover:border-dawn-gold/30 transition-colors">
                <h3 className="font-display text-lg text-dawn-gold mb-4">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-sand">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      <div className="mt-16 border-y border-white/10 py-5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_32s_linear_infinite] motion-reduce:animate-none">
          {marqueeItems.map((item, i) => (
            <span key={i} className="mx-6 font-display text-2xl sm:text-3xl text-white/15 shrink-0">
              {item} <span className="text-dawn-gold/40 mx-4">✦</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}