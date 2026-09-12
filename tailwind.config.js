/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#39FF14',
          cyan: '#00F0FF',
          pink: '#FF10F0',
          purple: '#B026FF',
          yellow: '#FFE600',
        },
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a26',
          600: '#252535',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00F0FF, 0 0 20px #00F0FF40',
        'neon-pink': '0 0 10px #FF10F0, 0 0 20px #FF10F040',
        'neon-green': '0 0 10px #39FF14, 0 0 20px #39FF1440',
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #00F0FF, 0 0 10px #00F0FF' },
          '100%': { textShadow: '0 0 10px #00F0FF, 0 0 20px #00F0FF, 0 0 30px #00F0FF' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};