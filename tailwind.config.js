/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mx: {
          green: '#006847',
          'green-light': '#009e60',
          red: '#ce1126',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      maxWidth: {
        mobile: '420px',
      },
    },
  },
  plugins: [],
}
