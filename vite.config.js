import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Lokalnie: `./` — GitHub Pages (user.github.io/repo/): ustaw VITE_BASE=/nazwa-repo/ w CI
// See https://vitejs.dev/guide/build.html#public-base-path
export default defineConfig({
  base: process.env.VITE_BASE || './',
  root: '.',
  publicDir: 'public',
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    open: true,
  },
});
