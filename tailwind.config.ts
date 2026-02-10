import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        luxe: {
          950: "#040714",
          900: "#07122a",
          800: "#0d1f45",
          700: "#123064",
          500: "#2f6db5",
          300: "#8fc6ff",
          200: "#badbff",
          100: "#e8f3ff",
        },
        gem: {
          cyan: "#64d2ff",
          mint: "#5ee3a1",
          gold: "#ffd166",
          rose: "#ff8fab",
          violet: "#c79bff",
          amber: "#ff9f5c",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Iowan Old Style"', '"Times New Roman"', "serif"],
        body: ['"Manrope"', '"Avenir Next"', '"Segoe UI"', "sans-serif"],
      },
      boxShadow: {
        luxe: "0 30px 80px rgba(2,8,28,0.52)",
        panel: "0 14px 32px rgba(1,10,30,0.45)",
      },
      keyframes: {
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.82" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "gradient-pan": "gradient-pan 12s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.8s ease-in-out infinite",
        "float-soft": "float-soft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
