/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '16px',
        'sm': '18px',
        'base': '20px',
        'lg': '24px',
        'xl': '28px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '48px',
      },
      colors: {
        'yellow': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        }
      },
      borderRadius: {
        'none': '0',
      }
    },
  },
  plugins: [],
}

