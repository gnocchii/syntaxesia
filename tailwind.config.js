/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#faf6f0',
        gallery: {
          wall: '#f5f1eb',
          floor: '#c4a882',
          beam: '#d4c4a8',
          warm: '#f0ebe3',
        },
        charcoal: '#1a1a1a',
        concrete: '#d1ccc5',
        accent: '#8b7355',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['Cormorant Garamond', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
