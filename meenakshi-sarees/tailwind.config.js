/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        tamil: ["'Noto Sans Tamil'", "'DM Sans'", "sans-serif"],
      },
      colors: {
        rose: {
          DEFAULT: "#8B1C45",
          light: "#B82F5E",
          dark: "#6b1235",
          50: "#FBF0F4",
          100: "#F5D6E3",
        },
        gold: {
          DEFAULT: "#C9933A",
          light: "#E8B05A",
          dark: "#A57528",
          50: "#FDF8EE",
          100: "#F7EACB",
        },
        cream: {
          DEFAULT: "#FBF6EE",
          dark: "#F2E8D6",
          deeper: "#EDD8B8",
        },
        charcoal: {
          DEFAULT: "#2C1A10",
          light: "#5a3d2b",
          muted: "#8a6a52",
        },
      },
      boxShadow: {
        luxury: "0 4px 24px rgba(44,26,16,0.10)",
        "luxury-lg": "0 12px 48px rgba(44,26,16,0.16)",
        "luxury-xl": "0 24px 64px rgba(44,26,16,0.20)",
        gold: "0 4px 20px rgba(201,147,58,0.35)",
        rose: "0 8px 24px rgba(139,28,69,0.30)",
      },
      borderRadius: {
        saree: "4px 32px 4px 32px",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
