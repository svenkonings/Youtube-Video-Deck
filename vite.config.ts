import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import preprocess from 'svelte-preprocess';

// https://vitejs.dev/config/
export default defineConfig({
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
