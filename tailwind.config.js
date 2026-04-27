/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Canvas palette is theme-driven via CSS variables defined in App.css
        // and overridden at runtime by src/context/ThemeContext.tsx. The
        // `rgb(var(--c-x) / <alpha-value>)` pattern keeps opacity utilities
        // (bg-canvas-bg/80, border-canvas-accent/40, …) working unchanged.
        canvas: {
          bg:        "rgb(var(--c-bg) / <alpha-value>)",
          surface:   "rgb(var(--c-surface) / <alpha-value>)",
          accent:    "rgb(var(--c-accent) / <alpha-value>)",
          highlight: "rgb(var(--c-highlight) / <alpha-value>)",
          text:      "rgb(var(--c-text) / <alpha-value>)",
          muted:     "rgb(var(--c-muted) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
