"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Github, Linkedin, Send } from "lucide-react";
import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import { profile } from "@/lib/data";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [copied, setCopied] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio message from ${form.name || "a visitor"}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name}\n${form.email}`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  }

  function copyEmail() {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section id="contact" className="relative py-28 sm:py-36 bg-night-100/40">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid md:grid-cols-2 gap-16">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-dawn-gold mb-4"> Contact </p>
            <h2 className="font-display text-4xl sm:text-5xl text-sand leading-tight">
              Have a project in mind?{" "}
              <span className="text-gradient-dawn italic">Let&apos;s build it.</span>
            </h2>
            <p className="mt-6 text-mist text-lg max-w-md leading-relaxed"> I&apos;m open to frontend roles and freelance work. Send a message here, or reach out directly — I read everything. </p>

            <div className="mt-10 space-y-4">
              <button onClick={copyEmail} className="flex items-center gap-3 text-sand hover:text-dawn-gold transition focus-ring">
                {copied ? <Check size={18} className="text-dawn-gold" /> : <Copy size={18} />}
                <span className="font-mono text-sm">{profile.email}</span>
              </button>
              <p className="font-mono text-sm text-mist pl-[30px]">{profile.phone}</p>

              <div className="flex items-center gap-4 pt-4">
                <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-mist hover:border-dawn-gold/50 hover:text-dawn-gold transition focus-ring">
                  <Github size={18} />
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-mist hover:border-dawn-gold/50 hover:text-dawn-gold transition focus-ring">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="text-xs uppercase tracking-widest text-mist">
                  Name
                </label>
                <input id="name" name="name" required value={form.name} onChange={handleChange} className="mt-2 w-full rounded-xl border border-white/10 bg-night-200/60 px-4 py-3 text-sand outline-none focus:border-dawn-gold/60 transition" placeholder="Your name"/>
              </div>
              <div>
                <label htmlFor="email" className="text-xs uppercase tracking-widest text-mist">
                  Email
                </label>
                <input id="email" type="email" name="email" required value={form.email} onChange={handleChange} className="mt-2 w-full rounded-xl border border-white/10 bg-night-200/60 px-4 py-3 text-sand outline-none focus:border-dawn-gold/60 transition" placeholder="you@email.com"/>
              </div>
              <div>
                <label htmlFor="message" className="text-xs uppercase tracking-widest text-mist">
                  Message
                </label>
                <textarea id="message" name="message" required rows={4} value={form.message} onChange={handleChange} className="mt-2 w-full rounded-xl border border-white/10 bg-night-200/60 px-4 py-3 text-sand outline-none focus:border-dawn-gold/60 transition resize-none" placeholder="Tell me about the role or project..."/>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} type="submit" className="inline-flex items-center gap-2 rounded-full bg-sunrise-gradient px-7 py-3.5 text-sm font-semibold text-night hover:brightness-110 transition focus-ring">
                Send message <Send size={16} />
              </motion.button>
              <p className="text-xs text-mist">
                Opens your email app with this message pre-filled and addressed to me.
              </p>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}