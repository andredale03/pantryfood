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
        pantry: {
          'bg-dark': '#000000', // Pure Black (OLED)
          'bg-secondary': '#1C1C1E', // Secondary System Background
          'glass-low': 'rgba(28, 28, 30, 0.6)',
          'glass-medium': 'rgba(28, 28, 30, 0.8)',
          'glass-high': 'rgba(28, 28, 30, 0.95)',
          'text-primary': '#FFFFFF', // System White
          'text-secondary': '#EBEBF5', // System Gray (Light)
          'accent-blue': '#0A84FF', // System Blue
          'accent-green': '#30D158', // System Green
          'accent-orange': '#FF9F0A', // System Orange
          'accent-red': '#FF453A', // System Red
        }
      },
      padding: {
        'safe-area': 'env(safe-area-inset-bottom)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
