/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cursor: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#21262d',
          text: '#f0f6fc',
          'text-muted': '#8b949e',
          accent: '#58a6ff',
          'accent-hover': '#79c0ff',
          success: '#3fb950',
          warning: '#d29922',
          error: '#f85149',
          purple: '#a5a5a5',
          blue: '#58a6ff',
          pink: '#f0f6fc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}