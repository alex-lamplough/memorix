/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'translate-x-0',
    '-translate-x-full',
    'transform',
    'transition-transform',
    'duration-300',
    'ease-in-out',
    'z-20',
    'z-30',
    'z-40',
    'pointer-events-none'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00ff94',
        dark: {
          DEFAULT: '#1b1b2f',
          lighter: '#23232b',
          darker: '#3a2067',
        },
      },
    },
  },
  plugins: [],
} 