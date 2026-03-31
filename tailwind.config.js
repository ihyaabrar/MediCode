/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './*.html'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#9333EA',
        success: '#16A34A',
        surface: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
