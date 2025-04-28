/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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