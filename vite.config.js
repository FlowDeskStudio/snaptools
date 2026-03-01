import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        qr: resolve(__dirname, 'tools/qr-generator/index.html'),
        json: resolve(__dirname, 'tools/json-formatter/index.html'),
        counter: resolve(__dirname, 'tools/character-counter/index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
