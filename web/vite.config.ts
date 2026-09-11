import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    {
      name: 'sourcemap-fallback-handler',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url.includes('installHook.js.map') || req.url.includes('spoofer.js.map') || req.url.includes('content.js.map'))) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end('{"version":3,"sources":[],"mappings":""}');
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
})

