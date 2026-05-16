/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        scu: {
          red: '#862633',
          gold: '#C4963B',
        },
      },
    },
  },
  plugins: [],
}
