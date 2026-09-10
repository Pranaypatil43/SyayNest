import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load root .env (one level up from client/)
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '')

  return {
    plugins: [react()],

    // Expose VITE_API_URL to the browser bundle
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        rootEnv.VITE_API_URL || 'http://localhost:8080'
      ),
    },

    // Dev proxy — only active during `vite dev`, not in prod build
    server: {
      proxy: {
        '/api': {
          target: rootEnv.VITE_API_URL || 'http://localhost:8080',
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
