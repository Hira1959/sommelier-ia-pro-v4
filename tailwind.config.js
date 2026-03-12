/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
        cabernet: {
          900: '#4A0E1C',
          800: '#380B15',
          100: '#F5E6E8',
        },
        gold: {
          400: '#D4AF37',
          500: '#C5A059',
          600: '#A08040',
        },
        cream: {
          50: '#FAF9F6',
          100: '#F5F2EB',
          200: '#EBE5D9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Lato', 'sans-serif'],
        serif: ['Lora', 'serif'],
        display: ['Playfair Display', 'serif'], 
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(74, 14, 28, 0.12)',
        'gold': '0 4px 14px 0 rgba(197, 160, 89, 0.39)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: [],
}
