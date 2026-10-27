/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D2051E',
          hover: '#B9041A',
          light: '#FEE2E2',
        },
        dark: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        accent: {
          orange: '#F18A45',
          green: '#059669',
          blue: '#0284C7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(15, 23, 42, 0.04)',
        card: '0 4px 16px rgba(15, 23, 42, 0.06)',
        lifted: '0 12px 32px rgba(15, 23, 42, 0.08)',
        red: '0 4px 14px rgba(210, 5, 30, 0.28)',
      },
    },
  },
  plugins: [],
};
