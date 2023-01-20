import lineClamp from '@tailwindcss/line-clamp'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{d.ts,ts,js,svelte}'],
  theme: {
    extend: {},
  },
  plugins: [lineClamp],
}
