/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#e6f1ff',
          200: '#c9e2ff',
          300: '#a4caff',
          400: '#75a8ff',
          500: '#4285F4', // Main primary color
          600: '#3b77db',
          700: '#2c5aa0',
          800: '#1e3c6a',
          900: '#0f1e35',
        },
        background: {
          DEFAULT: '#ffffff',
          light: '#f8f9fa',
          dark: '#f1f3f5',
        },
        shadow: {
          DEFAULT: '#e0e0e0',
          light: '#f0f0f0',
          dark: '#d0d0d0',
        },
        neumorphic: {
          light: '#ffffff',
          dark: '#e0e0e0',
        }
      },
      boxShadow: {
        'neumorphic': '8px 8px 16px theme(colors.shadow.DEFAULT), -8px -8px 16px theme(colors.neumorphic.light)',
        'neumorphic-inset': 'inset 8px 8px 16px theme(colors.shadow.DEFAULT), inset -8px -8px 16px theme(colors.neumorphic.light)',
        'neumorphic-sm': '4px 4px 8px theme(colors.shadow.DEFAULT), -4px -4px 8px theme(colors.neumorphic.light)',
        'neumorphic-lg': '12px 12px 24px theme(colors.shadow.DEFAULT), -12px -12px 24px theme(colors.neumorphic.light)',
        'neumorphic-hover': '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px theme(colors.neumorphic.light)',
      },
      backgroundImage: {
        'neumorphic-gradient': 'linear-gradient(145deg, #ffffff, #f1f3f5)',
        'neumorphic-gradient-reverse': 'linear-gradient(145deg, #f1f3f5, #ffffff)',
      }
    },
  },
  plugins: [],
};