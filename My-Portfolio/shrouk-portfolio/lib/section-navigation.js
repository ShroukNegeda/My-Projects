"use client";

import { useEffect, useState } from "react";

export const navigationLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export function useSectionProgress(trackProgress = true) {
  const [sectionState, setSectionState] = useState({
    progress: 0,
    activeHref: null,
  });

  useEffect(() => {
    let frameId = 0;

    const updateSection = () => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const sections = navigationLinks
          .map(({ href }) => ({
            href,
            element: document.getElementById(href.slice(1)),
          }))
          .filter(({ element }) => element);

        if (!sections.length) return;

        const scrollPosition = window.scrollY;
        const activeMarker = scrollPosition + 72;
        const starts = sections.map(
          ({ element }) => element.getBoundingClientRect().top + window.scrollY
        );
        let activeIndex = -1;

        for (let index = 0; index < starts.length; index += 1) {
          if (starts[index] > activeMarker) break;
          activeIndex = index;
        }

        let progress = 0;
        const activeHref = activeIndex >= 0 ? sections[activeIndex].href : null;

        if (activeIndex === starts.length - 1) {
          progress = 1;
        } else if (activeIndex >= 0) {
          const sectionStart = starts[activeIndex];
          const nextSectionStart = starts[activeIndex + 1];
          const sectionProgress = Math.max(
            0,
            Math.min(
              1,
              (scrollPosition - sectionStart) / (nextSectionStart - sectionStart)
            )
          );
          progress = (activeIndex + sectionProgress) / (starts.length - 1);
        }

        if (trackProgress) {
          setSectionState({ progress, activeHref });
        } else {
          setSectionState((current) =>
            current.activeHref === activeHref
              ? current
              : { ...current, activeHref }
          );
        }
      });
    };

    window.addEventListener("scroll", updateSection, { passive: true });
    window.addEventListener("resize", updateSection);
    updateSection();

    return () => {
      window.removeEventListener("scroll", updateSection);
      window.removeEventListener("resize", updateSection);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [trackProgress]);

  return sectionState;
}