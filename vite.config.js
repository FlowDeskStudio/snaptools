import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        qr: resolve(__dirname, 'tools/qr-generator/index.html'),
        'json-formatter': resolve(__dirname, 'tools/json-formatter/index.html'),
        'character-counter': resolve(__dirname, 'tools/character-counter/index.html'),
        'password-generator': resolve(__dirname, 'tools/password-generator/index.html'),
        'base64-tool': resolve(__dirname, 'tools/base64-tool/index.html'),
        'color-converter': resolve(__dirname, 'tools/color-converter/index.html'),
        'bg-remover': resolve(__dirname, 'tools/bg-remover/index.html'),
        'image-compressor': resolve(__dirname, 'tools/image-compressor/index.html'),
        'image-converter': resolve(__dirname, 'tools/image-converter/index.html'),
        'csv-to-excel': resolve(__dirname, 'tools/csv-to-excel/index.html'),
        'text-formatter': resolve(__dirname, 'tools/text-formatter/index.html'),
        'pdf-to-word': resolve(__dirname, 'tools/pdf-to-word/index.html'),
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
