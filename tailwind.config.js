/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#dce5f1',
          200: '#b8cce3',
          300: '#8baecd',
          400: '#5a8cb5',
          500: '#386f9c',
          600: '#275680',
          700: '#1e4466',
          800: '#14273c',
          850: '#0e1c2d',
          900: '#091320',
          950: '#050a12',
        },
        slateSurface: {
          card: '#0c1424',
          subtle: '#111b30',
          border: '#1a2744',
          hover: '#15223c'
        },
        teal: {
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
        risk: {
          low: '#10b981',       // Emerald green
          moderate: '#f59e0b',  // Amber
          high: '#f97316',      // Bright Orange
          critical: '#ef4444',  // Crimson Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.25)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.08)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
