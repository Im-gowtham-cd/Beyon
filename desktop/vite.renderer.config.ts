import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname, 'src/renderer'),
  publicDir: path.resolve(import.meta.dirname, 'public'),
  base: './',
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
});
