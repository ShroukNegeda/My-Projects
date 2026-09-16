import { Hero } from "@/components/home/hero";
import { ServicesShowcase } from "@/components/home/services-showcase";
import { NotSureCta } from "@/components/home/not-sure-cta";
import { Partner } from "@/components/home/partner";
import { Process } from "@/components/home/process";
import { Explorations } from "@/components/home/explorations";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { TeamSection } from "@/components/home/team-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesShowcase />
      <NotSureCta />
      <Partner />
      <Process />
      <Explorations />
      <TeamSection />
      <Faq />
      <FinalCta />
    </>
  );
}
