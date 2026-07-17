/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
  extend: {
    animation: {
      'fade-in-scale': 'fadeInScale 0.3s ease-out',
      'pulse-ring': 'pulseRing 1.8s cubic-bezier(0.66, 0, 0, 1) infinite',
    },
    keyframes: {
      fadeInScale: {
        '0%': { opacity: 0, transform: 'scale(0.95)' },
        '100%': { opacity: 1, transform: 'scale(1)' },
      },
      pulseRing: {
        '0%': { transform: 'scale(0.9)', opacity: 0.6 },
        '70%': { transform: 'scale(1.2)', opacity: 0 },
        '100%': { transform: 'scale(0.9)', opacity: 0 },
      },
    },
  },
}
,
  plugins: [],
};
