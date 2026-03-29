/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-up': 'fadeUp 0.3s ease-out',
        'shape-float-1': 'float1 15s infinite alternate ease-in-out',
        'shape-float-2': 'float2 20s infinite alternate ease-in-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float1: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(100px, 50px) rotate(90deg)' },
        },
        float2: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(-120px, 80px) rotate(-120deg)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
