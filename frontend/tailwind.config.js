/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        civic: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a9f6',
          500: '#0e8ce4',
          600: '#0270c3',
          700: '#03599e',
          800: '#074c82',
          900: '#0c406e',
          950: '#082949',
        },
        gov: {
          navy: '#0F2744',
          blue: '#1E6091',
          teal: '#2A9D8F',
          amber: '#F4A261',
          coral: '#E76F51',
          slate: '#334155',
          bg: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Noto Sans Devanagari',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
