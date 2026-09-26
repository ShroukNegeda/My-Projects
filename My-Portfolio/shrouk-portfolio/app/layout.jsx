import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./globals.css";

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
    <html lang="en">
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