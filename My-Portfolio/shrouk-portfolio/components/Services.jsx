import {
  Code2,
  LayoutTemplate,
  PlugZap,
  Smartphone,
  Wrench,
} from "lucide-react";
import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";

const services = [
  {
    icon: LayoutTemplate,
    title: "Responsive websites",
    description:
      "Build polished pages that adapt smoothly across desktop, tablet, and mobile.",
  },
  {
    icon: Smartphone,
    title: "Landing pages",
    description:
      "Create focused, engaging landing pages for products, services, and personal brands.",
  },
  {
    icon: Code2,
    title: "React interfaces",
    description:
      "Develop reusable components and interactive interfaces with React and JavaScript.",
  },
  {
    icon: LayoutTemplate,
    title: "Design to frontend",
    description:
      "Turn visual designs into responsive web pages with clean, structured code.",
  },
  {
    icon: PlugZap,
    title: "REST API integration",
    description:
      "Connect frontend interfaces to APIs and display dynamic data clearly.",
  },
  {
    icon: Wrench,
    title: "UI improvements",
    description:
      "Refine existing pages, fix layout issues, and improve the experience across screen sizes.",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeading
          eyebrow="What I offer"
          title="Service Provider"
          description="Frontend services to bring clear, responsive, and interactive web experiences to life."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <FadeIn key={service.title} delay={index * 0.07}>
              <article className="h-full rounded-lg border border-white/10 bg-night-200/40 p-6 transition-colors hover:border-dawn-gold/30">
                <service.icon
                  size={22}
                  aria-hidden="true"
                  className="text-dawn-gold"
                />
                <h3 className="mt-5 font-display text-lg text-sand">
                  {service.title}
                </h3>
                <p className="mt-2 leading-relaxed text-mist">
                  {service.description}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}