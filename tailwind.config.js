/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
        },
        news: {
          dark: '#1a1a2e',
          gray: '#64748b',
          light: '#f8fafc',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'Inter', 'sans-serif'],
        headline: ['Merriweather', 'Noto Sans Tamil', 'serif'],
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};
