import type { Config } from "tailwindcss";

/**
 * Les couleurs pointent vers des variables CSS definies dans `globals.css`,
 * ce qui permet de basculer clair/sombre en changeant une classe sur <html>
 * sans dupliquer les utilitaires Tailwind.
 */
const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                canvas: withOpacity("--color-canvas"),
                surface: withOpacity("--color-surface"),
                "surface-muted": withOpacity("--color-surface-muted"),
                "surface-raised": withOpacity("--color-surface-raised"),
                line: withOpacity("--color-line"),
                ink: withOpacity("--color-ink"),
                "ink-muted": withOpacity("--color-ink-muted"),
                "ink-subtle": withOpacity("--color-ink-subtle"),
                primary: {
                    DEFAULT: withOpacity("--color-primary"),
                    strong: withOpacity("--color-primary-strong"),
                    soft: withOpacity("--color-primary-soft"),
                    foreground: withOpacity("--color-primary-foreground"),
                },
                accent: {
                    DEFAULT: withOpacity("--color-accent"),
                    soft: withOpacity("--color-accent-soft"),
                },
                danger: {
                    DEFAULT: withOpacity("--color-danger"),
                    soft: withOpacity("--color-danger-soft"),
                },
                success: {
                    DEFAULT: withOpacity("--color-success"),
                    soft: withOpacity("--color-success-soft"),
                },
            },
            fontFamily: {
                sans: ["var(--font-sans)", "system-ui", "sans-serif"],
            },
            borderRadius: {
                xl: "0.875rem",
                "2xl": "1.125rem",
                "3xl": "1.5rem",
            },
            boxShadow: {
                card: "0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.16)",
                lifted: "0 2px 4px rgb(15 23 42 / 0.06), 0 24px 48px -24px rgb(15 23 42 / 0.34)",
                overlay: "0 32px 80px -24px rgb(15 23 42 / 0.45)",
                book: "0 10px 30px -12px rgb(15 23 42 / 0.4)",
            },
            transitionTimingFunction: {
                spring: "cubic-bezier(0.22, 1, 0.36, 1)",
            },
            keyframes: {
                shimmer: {
                    "100%": { transform: "translateX(100%)" },
                },
                "fade-up": {
                    from: { opacity: "0", transform: "translateY(8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "pulse-ring": {
                    "0%": { transform: "scale(0.9)", opacity: "0.7" },
                    "70%": { transform: "scale(1.6)", opacity: "0" },
                    "100%": { transform: "scale(1.6)", opacity: "0" },
                },
            },
            animation: {
                shimmer: "shimmer 1.6s infinite",
                "fade-up": "fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
                "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
            },
        },
    },
    plugins: [],
};

export default config;
