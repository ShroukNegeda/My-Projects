# KAALEX Website

A Next.js 16 (App Router) rebuild of the KAALEX Figma design, with full Arabic/English support and light/dark mode.

## Stack
- Next.js 16 + TypeScript + App Router
- Tailwind CSS v4
- next-themes (dark/light mode)
- Custom React context for AR/EN language switching (RTL/LTR)
- lucide-react icons
- Self-hosted fonts via @fontsource (Space Grotesk, Inter, Cairo) — no external Google Fonts calls, works fully offline

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build for production

```bash
npm run build
npm run start
```

## Structure

- `src/app/` — routes: `/` (Home), `/about`, `/services` (placeholder), `/portfolio` (placeholder)
- `src/components/` — UI components, split into `home/`, `about/`, `shared/`
- `src/context/` — theme provider + language (i18n) context
- `src/lib/dictionaries/` — `en.ts` and `ar.ts` translation dictionaries — edit these to change site copy in either language
- `src/app/globals.css` — design tokens (colors) for light & dark themes

## Notes

- Toggle theme via the sun/moon icon in the header.
- Toggle language via the EN/AR button in the header — this also flips the whole layout to RTL for Arabic.
- `/services` and `/portfolio` are intentionally left as empty placeholder pages, ready for content.
- Team photos and project preview cards use icon placeholders instead of stock photography — swap in real images/photos under `src/components/shared/team.tsx` and `src/components/home/explorations.tsx` when available.
