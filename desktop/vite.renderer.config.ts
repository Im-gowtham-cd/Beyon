import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/renderer'),
    emptyDirOnBuild: true,
  },
});
