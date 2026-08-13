import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Don't crash the proxy on connection errors — just return a clean error
        // so the React app can show its own error state instead of a hard fail
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[proxy] backend not reachable:', err.code)
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Backend server is not running. Start it with: node app.js' }))
            }
          })
        },
      },
    },
  },
})
