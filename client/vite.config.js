import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // In production the built files are served by Express,
  // so /api calls go to the same origin — no proxy needed.
  // The proxy below is only active during `vite dev`.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[proxy] backend not reachable:', err.code)
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Backend not running. Start it with: node app.js' }))
            }
          })
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,    // disable in prod for smaller bundle
    chunkSizeWarningLimit: 1000,
  },
})
