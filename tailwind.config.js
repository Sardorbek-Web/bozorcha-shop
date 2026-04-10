/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(17, 24, 39, 0.08)",
      },
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
      },
    },
  },
  plugins: [],
};