// @ts-ignore
import dns from 'dns'
import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import postcss from "./postcss.config.js";

dns.setDefaultResultOrder('verbatim')

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    outDir: 'docs',
  },
  plugins: [svelte()],
  css:{
    postcss
  }
})
