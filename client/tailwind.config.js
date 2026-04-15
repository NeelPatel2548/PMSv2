/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'bauhaus': ['Outfit', 'sans-serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        'bauhaus-red':    '#D02020',
        'bauhaus-blue':   '#1040C0',
        'bauhaus-yellow': '#F0C020',
        'bauhaus-black':  '#121212',
        'bauhaus-white':  '#F0F0F0',
        'bauhaus-muted':  '#E0E0E0',
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#D02020',
          600: '#D02020',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        }
      },
      boxShadow: {
        'hard-sm':  '3px 3px 0px 0px #121212',
        'hard-md':  '6px 6px 0px 0px #121212',
        'hard-lg':  '8px 8px 0px 0px #121212',
        'hard-red': '4px 4px 0px 0px #D02020',
        'hard-blue':'4px 4px 0px 0px #1040C0',
      }
    },
  },
  plugins: [],
}
