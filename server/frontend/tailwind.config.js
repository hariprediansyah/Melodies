/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // fuchsia: '#f014b4'
        fuchsia: '#163357',
        grayBg: '#1f1f1f'
      }
    }
  },
  plugins: []
}
