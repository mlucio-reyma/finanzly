/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fn-navy':          '#0F172A',
        'fn-navy-800':      '#1E293B',
        'fn-navy-700':      '#263347',
        'fn-navy-600':      '#334155',
        'fn-emerald':       '#10B981',
        'fn-emerald-light': '#34D399',
        'fn-emerald-dark':  '#059669',
        'fn-text':          '#F1F5F9',
        'fn-text-muted':    '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["dark"],
    defaultTheme: "dark",
  },
}
