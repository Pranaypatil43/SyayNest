import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load root .env (one level up from client/)
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '')

  // VITE_API_URL:
  //   Dev  → not set, proxy handles /api calls to localhost:8080
  //   Prod → set to your Render backend URL, e.g. https://staynest-api.onrender.com
  const apiUrl = rootEnv.VITE_API_URL || ''

  return {
    plugins: [react()],

    // Expose VITE_API_URL to the browser bundle (used by axios.js and Google OAuth button)
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },

    // Dev proxy — only active during `vite dev`, not in prod build
    // When VITE_API_URL is empty in dev, proxy falls back to localhost:8080
    server: {
      proxy: {
        '/api': {
          target: apiUrl || 'http://localhost:8080',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              console.warn('[proxy] backend not reachable:', err.code)
              if (res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Backend not running. Start with: node app.js' }))
              }
            })
          },
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
    },
  }
})
