/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flora-green': '#52796f',
        'flora-light': '#84a98c',
        'flora-accent': '#d67d60',
        'flora-bg': '#f4f1ea',
        'flora-text': '#2f3e46',
      }
    },
  },
  plugins: [],
}