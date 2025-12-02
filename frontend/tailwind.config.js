/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2b7a78',
          light: '#3aafa9',
          dark: '#17252a',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'sans-serif'],
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Quan trọng để không lỗi giao diện MUI cũ
  },
}