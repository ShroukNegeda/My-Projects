import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  title: "Shrouk Negeda — Frontend Developer",
  description:
    "Frontend developer in Cairo building fast, accessible interfaces with React, JavaScript and modern CSS. Portfolio, projects, and contact.",
  keywords: [
    "Shrouk Negeda",
    "Frontend Developer",
    "React Developer",
    "Cairo",
    "Portfolio",
  ],
  openGraph: {
    title: "Shrouk Negeda — Frontend Developer",
    description:
      "Frontend developer in Cairo building fast, accessible interfaces with React, JavaScript and modern CSS.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <body
        className="font-body antialiased bg-night text-sand overflow-x-hidden"
        suppressHydrationWarning
      >
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}