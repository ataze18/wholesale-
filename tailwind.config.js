/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1128',
          900: '#0f1a3d',
          800: '#152452',
          700: '#1c2f66',
          600: '#28407f',
          500: '#3a569e',
        },
        gold: {
          400: '#d4af6a',
          500: '#c19a4e',
          600: '#a67f3a',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
