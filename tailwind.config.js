/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#e6eeff',
          200: '#c9d9ff',
          300: '#a2bbff',
          400: '#7692ff',
          500: '#4f6bff',
          600: '#3f54db',
          700: '#3343b1',
          800: '#2c3a91',
          900: '#283578'
        }
      }
    }
  },
  plugins: []
}

