"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled ? "bg-night/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-6xl px-6 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" aria-label="Shrouk Negeda — home" className="focus-ring rounded-2xl">
          <Logo />
        </a>

        <ul className="hidden md:flex items-center gap-9 font-body text-sm text-mist">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-sand transition-colors focus-ring">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#contact" className="hidden md:inline-flex items-center rounded-full border border-dawn-gold/40 px-5 py-2 text-sm text-dawn-gold hover:bg-dawn-gold hover:text-night transition-colors focus-ring">
          Let&apos;s talk
        </a>

        <button aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} className="md:hidden text-sand focus-ring">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="md:hidden overflow-hidden bg-night border-b border-white/5">
            <ul className="flex flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-2 text-mist hover:text-sand transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}