export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1B2A4A',
        'navy-light': '#2C3E5A',
        accent: '#E84393',
        'accent-hover': '#D63384',
        success: '#10B981',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
