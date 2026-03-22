import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Use relative base so assets work when hosted under a subpath (e.g. user.github.io/repo-name/)
// See https://vitejs.dev/guide/build.html#public-base-path
export default defineConfig({
  base: './',
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
