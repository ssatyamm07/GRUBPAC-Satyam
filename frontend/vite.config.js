import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

/** Dev proxy target: full URL to Express (same host/port you use in Postman). */
function resolveProxyTarget(mode, frontendDir) {
  const frontendEnv = loadEnv(mode, frontendDir, '')
  const rootEnv = loadEnv(mode, repoRoot, '')
  const explicit = frontendEnv.VITE_API_PROXY_TARGET?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  const port = rootEnv.PORT?.trim() || '5000'
  return `http://127.0.0.1:${port}`
}

export default defineConfig(({ mode }) => {
  const target = resolveProxyTarget(mode, __dirname)

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
        '/uploads': {
          target,
          changeOrigin: true,
        },
      },
    },
  }
})
