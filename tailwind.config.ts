import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Lens brand colors
        accent: { DEFAULT: "#6366F1", light: "#EEF2FF", hover: "#4F46E5", glow: "rgba(99,102,241,0.12)" },
        navy: { DEFAULT: "#1A1A2E", deep: "#16213E", blue: "#0F3460" },
        gold: { DEFAULT: "#C8A96E", light: "#EED9A8", dark: "#8B6914" },
        surface: "#FFFFFF",
        muted: "#9CA3AF",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["DM Sans", "Inter", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.9)" }, to: { opacity: "1", transform: "scale(1)" } },
        pulse2: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
        slideUp: { from: { transform: "translateY(100%)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease both",
        "fade-in": "fadeIn 0.5s ease both",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        "pulse2": "pulse2 2s infinite",
        "slide-up": "slideUp 0.4s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
