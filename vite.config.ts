// @ts-ignore
import dns from 'dns'
import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import preprocess from 'svelte-preprocess';

dns.setDefaultResultOrder('verbatim')

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    outDir: 'docs',
  },
  plugins: [
    svelte({
      preprocess: preprocess({
        postcss: true,
      }),
    }),
  ],
})
