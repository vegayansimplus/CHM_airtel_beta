import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Loads .env, .env.[mode] and their .local variants exactly like Vite does
  // internally (empty prefix = don't restrict to VITE_-prefixed keys only).
  const env = loadEnv(mode, process.cwd(), '')

  // Deployment context path, e.g. "/airtelchmbeta/". Comes from VITE_APP_BASE_PATH
  // (see .env / .env.production) so retargeting a deployment - "/", "/airtelchm",
  // "/airtelchmbeta", or any future path - is a config change, not a code change.
  // BrowserRouter's basename (src/App.tsx) reads import.meta.env.BASE_URL, which
  // Vite derives from this same value, so the two can never drift apart.
  // Falls back to "/" (domain root) when unset, so a fresh clone with no env
  // override still builds a working app.
  const basePath = env.VITE_APP_BASE_PATH || '/'

  return {
    plugins: [react()],
    assetsInclude: ['**/*.xlsx', '**/*.xlsm'],
    base: basePath,
    server: {
      host: '0.0.0.0',  // Your server's IP address
      port: 5174,           // The port Vite will run on
      open: true,           // Optional: opens the browser automatically
    },
  }
})
