/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'psu-blue': {
          light: '#0a5bc4',
          DEFAULT: '#1a3a6b',
          dark: '#0f2347',
        },
        'psu-accent': '#004aad',
      },
    },
  },
  plugins: [],
}