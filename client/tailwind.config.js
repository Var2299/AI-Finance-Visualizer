/** @type {import('tailwindcss').Config} */
export default {
 content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Make sure ts and tsx are here!
  ],
  theme: {
    extend: {
      colors: {
        // Custom neon color palette
        neon: {
          pink: '#ff0080',
          purple: '#b300ff',
          blue: '#00d4ff',
          cyan: '#00ffff',
          green: '#00ff88',
          yellow: '#ffeb3b',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 0, 128, 0.5), 0 0 10px rgba(255, 0, 128, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 0, 128, 0.8), 0 0 30px rgba(255, 0, 128, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
