/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#3A3C49',
        'primary-light': '#7F9F8F',
        'secondary-light': '#A8C6E8',
        'highlight': "#CF4D6F",
        'neutral': "#FEFBF4"
      }
    }
  },
  plugins: [],
}
