export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fcf8f3',
          100: '#f7efe3',
          200: '#efdec2',
          300: '#e5c59b',
          400: '#dba66e',
          500: '#d18a48',
          600: '#c3723a',
          700: '#a35931',
          800: '#84472d',
          900: '#6a3b26',
        },
        calm: {
          50: '#f4f6f8',
          100: '#e4e9ef',
          200: '#cbd5e1',
          300: '#a3b6c9',
          400: '#7591ad',
          500: '#567595',
          600: '#435c7a',
          700: '#364a63',
          800: '#2f3f52',
          900: '#2a3545',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
