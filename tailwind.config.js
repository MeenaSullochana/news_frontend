/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        news: {
          dark: '#0c1222',
          gray: '#5c6b7a',
          light: '#f3f1ec',
          border: '#e5e0d6',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'Outfit', 'sans-serif'],
        headline: ['Fraunces', 'Noto Sans Tamil', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(12, 18, 34, 0.04), 0 8px 24px rgba(12, 18, 34, 0.06)',
        lift: '0 4px 6px rgba(12, 18, 34, 0.04), 0 16px 40px rgba(12, 18, 34, 0.08)',
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
        'fade-up': 'fadeUp 0.45s ease-out both',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
