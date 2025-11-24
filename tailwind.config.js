/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#05080f",
        },
        brand: {
          DEFAULT: "#2dd4bf",
          dark: "#14b8a6",
        },
        danger: "#f43f5e",
        warning: "#f59e0b",
      },
      boxShadow: {
        glass: "0 10px 40px rgba(15,23,42,0.35)",
      },
    },
  },
  plugins: [],
};

