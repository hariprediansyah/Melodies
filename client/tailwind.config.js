/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.html', './src/**/*.js', './src/**/*.jsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        primary: '#f472b6',
        secondary: '#f472b6',
        purple: '#EE10B0',
        'brand-green': {
          light: '#6EEB83',
          DEFAULT: '#40A578',
          dark: '#245943'
        },
        'brand-dark': '#051509'
      },
      fontSize: {
        '3xl': '1.875rem'
      }
    }
  },
  plugins: []
}
