import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-mist">
        <p>© {new Date().getFullYear()} {profile.name}. Built with Next.js.</p>
        <p className="font-mono">Designed around a sunrise — because Shorouk means dawn.</p>
      </div>
    </footer>
  );
}