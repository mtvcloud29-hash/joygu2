import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clay: { 50: "#FCF8F4", 100: "#F8F2EC", 200: "#E8D4C2", 300: "#D88C58", 400: "#B86134", 500: "#5A2D14" },
        ink: "#2D1A10",
        muted: "#6F5A4D",
        card: "#FFFDFC"
      },
      fontFamily: { sans: ["var(--font-inter)", "sans-serif"], display: ["var(--font-cormorant)", "serif"] },
      boxShadow: { soft: "0 20px 70px rgba(90, 45, 20, .08)", card: "0 8px 28px rgba(90, 45, 20, .06)" },
      borderRadius: { xl: "1.25rem", "2xl": "1.75rem", "3xl": "2.25rem" },
      keyframes: { float: { "0%, 100%": { transform: "translateY(0) rotate(-3deg)" }, "50%": { transform: "translateY(-12px) rotate(1deg)" } }, "fade-up": { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } } },
      animation: { float: "float 6s ease-in-out infinite", "fade-up": "fade-up .8s ease-out both" }
    }
  },
  plugins: []
};
export default config;
