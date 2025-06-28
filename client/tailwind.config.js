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
        purple: '#EE10B0'
      },
      fontSize: {
        '3xl': '1.875rem'
      }
    }
  },
  plugins: []
}
