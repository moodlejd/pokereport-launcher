/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          blue: '#4bb4e9',
          yellow: '#fdd835',
          red: '#d32f2f',
          dark: '#1a1a2e',
          darker: '#16162a',
          darkest: '#0f0f1e'
        },
        minecraft: {
          grass: '#7ed321',
          stone: '#7f7f7f',
          dirt: '#8b5a2b'
        }
      },
      fontFamily: {
        minecraft: ['Minecraftia', 'monospace'],
        poppins: ['Poppins', 'sans-serif']
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in'
      },
      keyframes: {
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(75, 180, 233, 0.5)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(75, 180, 233, 0.8), 0 0 60px rgba(75, 180, 233, 0.4)'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      }
    },
  },
  plugins: [],
}

