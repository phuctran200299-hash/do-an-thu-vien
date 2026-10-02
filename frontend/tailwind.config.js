/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#eff5ff",
          100: "#dbe8fe",
          200: "#bfd7fe",
          300: "#93bafd",
          400: "#6096fa",
          500: "#3b74f5",
          600: "#2554ea",
          700: "#1d41d6",
          800: "#1e37ad",
          900: "#1e3389",
        },
        accent: {
          50: "#fdf2fb",
          100: "#fce7f8",
          300: "#f5a8e8",
          400: "#ee7fdb",
          500: "#e14fc4",
          600: "#c22fa3",
        },
        sunset: {
          400: "#fb923c",
          500: "#f97316",
        },
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgba(30, 64, 175, 0.08), 0 1px 3px -1px rgba(30,64,175,0.06)",
        card: "0 4px 20px -4px rgba(30, 64, 175, 0.12)",
        "card-hover": "0 16px 36px -8px rgba(30, 64, 175, 0.28)",
        glow: "0 0 0 4px rgba(59,116,245,0.15)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-22px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(20px,-30px) scale(1.1)" },
          "66%": { transform: "translate(-15px,15px) scale(0.95)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(59,116,245,0.35)" },
          "100%": { boxShadow: "0 0 0 12px rgba(59,116,245,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.5s ease both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        blob: "blob 10s infinite ease-in-out",
        shimmer: "shimmer 1.8s infinite linear",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
}
