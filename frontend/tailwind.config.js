/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6d28d9',
          DEFAULT: '#5b21b6', // Deep purple
          dark: '#4c1d95',
        },
        secondary: {
          light: '#38bdf8',
          DEFAULT: '#0284c7', // Ocean blue
          dark: '#0369a1',
        },
        background: '#0f172a', // Slate 900
        surface: '#1e293b',    // Slate 800
        textLight: '#f8fafc',
        textMuted: '#94a3b8',
      }
    },
  },
  plugins: [],
}
