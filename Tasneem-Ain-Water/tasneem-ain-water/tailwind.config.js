/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        laban: {
          50: '#F5FBFE',
          100: '#EAF5FB',
          200: '#D6ECF7',
        },
        water: {
          400: '#4FB3D9',
          500: '#1C8FC4',
          600: '#0E74A6',
          700: '#0A5D87',
        },
        ink: {
          700: '#0B3049',
          900: '#071F32',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      },
      animation: {
        ripple: 'ripple 14s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}