import { AboutHero } from "@/components/about/about-hero";
import { WhoWeAre } from "@/components/about/who-we-are";
import { AboutProcess } from "@/components/about/about-process";
import { Positioning } from "@/components/about/positioning";
import { VisionMission } from "@/components/about/vision-mission";
import { Values } from "@/components/about/values";
import { AboutTeam } from "@/components/about/about-team";
import { FinalCta } from "@/components/home/final-cta";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <WhoWeAre />
      <AboutProcess />
      <Positioning />
      <VisionMission />
      <Values />
      <AboutTeam />
      <FinalCta />
    </>
  );
}
