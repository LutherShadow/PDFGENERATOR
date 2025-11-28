/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#A8D8D3',
          DEFAULT: '#8EB8B5',
          dark: '#6A908D',
        },
        secondary: '#BDBAB5'
      }
    },
  },
  plugins: [],
}