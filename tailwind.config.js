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
        },
      },
      boxShadow: {
        neumorphic: '8px 8px 16px #e0e0e0, -8px -8px 16px #ffffff',
        'neumorphic-inset': 'inset 8px 8px 16px #e0e0e0, inset -8px -8px 16px #ffffff',
        'neumorphic-sm': '4px 4px 8px #e0e0e0, -4px -4px 8px #ffffff',
        'neumorphic-lg': '12px 12px 24px #e0e0e0, -12px -12px 24px #ffffff',
        'neumorphic-hover': '6px 6px 12px rgba(0, 0, 0, 0.05), -6px -6px 12px #ffffff',
      },
      backgroundImage: {
        'neumorphic-gradient': 'linear-gradient(145deg, #ffffff, #f1f3f5)',
        'neumorphic-gradient-reverse': 'linear-gradient(145deg, #f1f3f5, #ffffff)',
      },
    },
  },
  plugins: [],
};
