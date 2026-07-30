/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#0B0F19",
          100: "#111726",
          200: "#161D30",
          300: "#1E2740",
        },
        dawn: {
          coral: "#FF7A52",
          gold: "#FFC15E",
          blush: "#FFB199",
          deep: "#B84C2E",
        },
        sand: "#F3EFE7",
        mist: "#94A0B8",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "sunrise-gradient":
          "linear-gradient(120deg, #B84C2E 0%, #FF7A52 30%, #FFC15E 65%, #FFE9B8 100%)",
      },
    },
  },
  plugins: [],
};