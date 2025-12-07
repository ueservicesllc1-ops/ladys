/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        palette: {
          quartz: '#F4B4C5',      // Rosa Cuarzo - cálido, elegante
          lavender: '#C7A9E8',     // Morado Lavanda - confianza y calma
          gold: '#DDBA6C',         // Dorado Suave - lujo y estilo
          pearl: '#FAFAFD',        // Blanco Perlado - pureza y simplicidad
          graphite: '#2B2B2D',     // Negro Grafito - contraste profesional
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}

