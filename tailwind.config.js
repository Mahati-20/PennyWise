/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#10172E',
          surface: '#151E38',
          elevated: '#1B2645',
          card: '#16203D',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: '#223055',
        },
        turquoise: {
          DEFAULT: '#40D9D0',
          hover: '#35C2B9',
          light: '#72E5DE',
          dark: '#1C8C85',
          glow: 'rgba(64, 217, 208, 0.35)',
          muted: 'rgba(64, 217, 208, 0.12)',
        },
        lavender: {
          DEFAULT: '#B9A7FF',
          hover: '#A48FF5',
          light: '#D3C8FF',
          dark: '#765BCC',
          glow: 'rgba(185, 167, 255, 0.35)',
          muted: 'rgba(185, 167, 255, 0.12)',
        },
        text: {
          primary: '#F1F3FA',
          secondary: '#A7B0C8',
          muted: '#6E7896',
        },
        semantic: {
          success: '#5ED6A2',
          warning: '#F2C66D',
          error: '#F08091',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-turquoise': '0 0 25px -5px rgba(64, 217, 208, 0.4)',
        'glow-lavender': '0 0 25px -5px rgba(185, 167, 255, 0.4)',
        'glow-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'subtle-elevated': '0 4px 20px 0 rgba(7, 10, 22, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      }
    },
  },
  plugins: [],
}
