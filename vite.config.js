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
        password: resolve(__dirname, 'tools/password-generator/index.html'),
        base64: resolve(__dirname, 'tools/base64-tool/index.html'),
        color: resolve(__dirname, 'tools/color-converter/index.html'),
        bgRemover: resolve(__dirname, 'tools/bg-remover/index.html'),
        imgCompressor: resolve(__dirname, 'tools/image-compressor/index.html'),
        imgConverter: resolve(__dirname, 'tools/image-converter/index.html'),
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
