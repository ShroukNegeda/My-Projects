import { GraduationCap, MapPin, Sparkles } from "lucide-react";
import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import { profile, education } from "@/lib/data";

const facts = [
  {
    icon: MapPin,
    label: "Based in",
    value: profile.location,
  },
  {
    icon: GraduationCap,
    label: "Studying",
    value: `${education.degree}, ${education.period}`,
  },
  {
    icon: Sparkles,
    label: "Focus",
    value: "React interfaces, REST APIs, design systems",
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeading eyebrow="About" title="Interfaces first. People, always."/>
        <div className="mt-14 grid md:grid-cols-[1.3fr_1fr] gap-14">
          <FadeIn delay={0.1}>
            <p className="text-xl sm:text-2xl font-display text-sand leading-relaxed">
              {profile.bio}
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="space-y-6 border-l border-white/10 pl-8">
              {facts.map((f) => (
                <div key={f.label} className="flex gap-4">
                  <f.icon size={20} className="mt-1 shrink-0 text-dawn-gold" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-mist">
                      {f.label}
                    </p>
                    <p className="text-sand mt-1">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}