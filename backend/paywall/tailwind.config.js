// tailwind.config.cjs
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // Modern teal-focused palette with better contrast
        border: "hsl(180 25% 85%)",
        input: "hsl(180 20% 90%)",
        ring: "hsl(174 72% 45%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(185 30% 10%)",
        primary: {
          DEFAULT: "hsl(174 72% 42%)", // vibrant teal
          foreground: "hsl(0 0% 100%)",
          50: "hsl(174 65% 96%)",
          100: "hsl(174 65% 90%)",
          200: "hsl(174 65% 80%)",
          300: "hsl(174 65% 65%)",
          400: "hsl(174 72% 52%)",
          500: "hsl(174 72% 42%)",
          600: "hsl(174 72% 32%)",
          700: "hsl(174 80% 22%)",
        },
        secondary: {
          DEFAULT: "hsl(185 30% 92%)",
          foreground: "hsl(185 30% 18%)",
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(180 20% 94%)",
          foreground: "hsl(185 20% 38%)",
        },
        accent: {
          DEFAULT: "hsl(168 76% 42%)",
          foreground: "hsl(0 0% 100%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(185 30% 10%)",
        },
        success: {
          DEFAULT: "hsl(152 69% 45%)",
          foreground: "hsl(0 0% 100%)",
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(174 72% 42%), hsl(168 76% 38%))',
        'gradient-hero': 'linear-gradient(135deg, hsl(174 65% 96%), hsl(168 65% 94%))',
        'gradient-card': 'linear-gradient(to bottom right, hsl(0 0% 100%), hsl(180 25% 97%))',
        'gradient-shine': 'linear-gradient(to right, transparent, hsl(0 0% 100% / 0.3), transparent)',
        'gradient-mesh': 'radial-gradient(at 0% 0%, hsl(174 65% 94%) 0px, transparent 50%), radial-gradient(at 100% 100%, hsl(168 65% 93%) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-primary': '0 10px 40px -10px hsl(174 72% 45% / 0.4)',
        'glow-accent': '0 8px 32px -8px hsl(168 76% 42% / 0.35)',
        'soft': '0 2px 8px -2px hsl(185 25% 12% / 0.08)',
        'medium': '0 4px 16px -4px hsl(185 25% 12% / 0.12)',
        'strong': '0 8px 24px -6px hsl(185 25% 12% / 0.16)',
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
