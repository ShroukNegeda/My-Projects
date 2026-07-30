import { Award, Calendar } from "lucide-react";
import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import { courses, events } from "@/lib/data";

export default function Courses() {
  return (
    <section id="courses" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeading eyebrow="Always learning" title="Courses & competitions"/>
        <div className="mt-14 grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <FadeIn>
            <div className="h-full rounded-2xl border border-white/10 bg-night-200/60 p-7">
              <h3 className="flex items-center gap-2 font-display text-lg text-dawn-gold mb-5">
                <Award size={18} /> Certifications
              </h3>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {courses.map((c) => (
                  <li key={c.name} className="border-b border-white/5 pb-3">
                    <p className="text-sand text-sm">{c.name}</p>
                    <p className="text-mist text-xs mt-1">
                      {c.org} · {c.date}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="h-full rounded-2xl border border-white/10 bg-night-200/60 p-7">
              <h3 className="flex items-center gap-2 font-display text-lg text-dawn-gold mb-5">
                <Calendar size={18} /> Events
              </h3>
              <ul className="space-y-4">
                {events.map((e) => (
                  <li key={e.name} className="border-b border-white/5 pb-3">
                    <p className="text-sand text-sm">{e.name}</p>
                    <p className="text-mist text-xs mt-1">
                      {e.org} · {e.date}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}