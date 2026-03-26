/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'psu-blue': {
          light: '#4A90D9',
          DEFAULT: '#1a3a6b',
          dark: '#0f2347',
        },
        'psu-accent': '#2563eb',
      },
    },
  },
  plugins: [],
}