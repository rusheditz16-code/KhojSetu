/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        foundry: {
          950: '#0a0a0a',
          900: '#121212',
          800: '#1f1f1f',
          700: '#2e2e2e',
          500: '#737373',
          400: '#a3a3a3',
          200: '#e5e5e5',
          100: '#f4f4f4',
          50: '#f8f8f8',
        },
        khoj: {
          navy: '#183059',
          navyDark: '#0f1e38',
          navyLight: '#264c8d',
          orange: '#FF7A00',
          orangeHover: '#e66e00',
          orangeLight: '#FFF3E8',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        'tracked': '0.12em',
        'tracked-wide': '0.18em',
        'tracked-ultra': '0.24em',
      },
      boxShadow: {
        'foundry-frame': '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        'foundry-lift': '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
