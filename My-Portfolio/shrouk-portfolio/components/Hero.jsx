"use client";

import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import RevealText from "./RevealText";
import { profile } from "@/lib/data";

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex items-center overflow-hidden pt-24 pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[62%] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-sunrise-gradient opacity-[0.16] blur-[110px]" />
        <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <motion.path d="M0,140 C 240,40 480,40 720,90 C 960,140 1200,60 1440,20" fill="none" stroke="url(#horizonGradient)" strokeWidth="1.5" strokeOpacity="0.35" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, ease: "easeOut" }}/>
          <defs>
            <linearGradient id="horizonGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B84C2E" />
              <stop offset="50%" stopColor="#FF7A52" />
              <stop offset="100%" stopColor="#FFC15E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="mx-auto max-w-6xl w-full px-6 sm:px-8 grid md:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
        <div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-5 font-mono text-xs sm:text-sm uppercase tracking-[0.3em] text-dawn-gold">
            Frontend Developer | Cairo, Egypt
          </motion.p>

          <h1 className="font-display text-[13vw] leading-[0.95] sm:text-[5.2rem] font-semibold text-sand">
            <RevealText text="Shrouk" />
            <br />
            <RevealText text="Negeda" delay={0.15} className="text-gradient-dawn italic"/>
          </h1>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }} className="mt-7 max-w-lg text-lg text-mist leading-relaxed">
            {profile.blurb}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#projects" className="inline-flex items-center gap-2 rounded-full bg-sunrise-gradient px-6 py-3 text-sm font-semibold text-night hover:brightness-110 transition focus-ring">
              View my work
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-sand hover:border-dawn-gold/60 hover:text-dawn-gold transition focus-ring">
              Get in touch
            </a>

            <div className="flex items-center gap-3 ml-1">
              <a aria-label="GitHub" href={profile.github} target="_blank" rel="noreferrer" className="text-mist hover:text-dawn-gold transition focus-ring">
                <Github size={20} />
              </a>
              <a aria-label="LinkedIn" href={profile.linkedin} target="_blank" rel="noreferrer" className="text-mist hover:text-dawn-gold transition focus-ring">
                <Linkedin size={20} />
              </a>
              <a aria-label="Email" href={`mailto:${profile.email}`} className="text-mist hover:text-dawn-gold transition focus-ring">
                <Mail size={20} />
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative mx-auto w-full max-w-xs md:max-w-sm">
          <div className="absolute -inset-4 rounded-[2rem] bg-sunrise-gradient opacity-30 blur-2xl" />
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10">
            <img src="/images/shrouk.jpg" alt="Portrait of Shrouk Negeda" className="w-full h-auto block"/>
            <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>

      <motion.a href="#about" aria-label="Scroll to about section" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-mist focus-ring" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
        <ArrowDown size={20} />
      </motion.a>
    </section>
  );
}