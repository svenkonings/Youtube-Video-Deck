module.exports = {
  content: ['./index.html', './src/**/*.{d.ts,ts,js,svelte}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
