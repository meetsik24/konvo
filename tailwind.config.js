/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff9eb',
          100: '#ffefcc',
          200: '#ffdd99',
          300: '#ffcb66',
          400: '#ffb833',
          500: '#ffaa00',
          600: '#cc8800',
          700: '#996600',
          800: '#664400',
          900: '#332200',
        },
        secondary: {
          50: '#edfcf4',
          100: '#d3f8e3',
          200: '#aaf0c4',
          300: '#74e49d',
          400: '#3fd074',
          500: '#1db954',
          600: '#13944b',
          700: '#117040',
          800: '#125934',
          900: '#11482c',
        },
        coffee: {
          light: '#ffedd5',
          DEFAULT: '#c27e00',
          dark: '#8b5e00',
        }
      },
      fontFamily: {
        sans: ['Quicksand', 'Inter var', 'sans-serif'],
      },
      backgroundImage: {
        'doodle-pattern': "url('https://images.unsplash.com/photo-1615800098779-1be32e60cca3?q=80&w=1920&auto=format&fit=crop')",
      },
    },
  },
  plugins: [],
};