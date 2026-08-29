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
        brand: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B9DEFF',
          300: '#7CC2FF',
          400: '#38A0FF',
          500: '#0C7EFF',
          600: '#005FD6',
          700: '#004BAD',
          800: '#00408F',
          900: '#063776',
          950: '#04224D',
        },
        navy: {
          800: '#111C38',
          900: '#0B132B',
          950: '#060B1A',
        },
        saffron: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-glow': 'waveGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        waveGlow: {
          '0%': { opacity: '0.4', transform: 'scaleY(0.9)' },
          '100%': { opacity: '0.9', transform: 'scaleY(1.1)' },
        },
      },
    },
  },
  plugins: [],
}
