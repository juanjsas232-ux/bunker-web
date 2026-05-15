/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(210, 70%, 55%)",
        accent: "hsl(160, 60%, 50%)",
        surface: "hsl(215, 13%, 12%)",
        background: "hsl(215, 13%, 15%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
