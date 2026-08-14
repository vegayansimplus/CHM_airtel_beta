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
    build: {
      rollupOptions: {
        output: {
          // Without this, Rollup's default splitting gives every icon/helper
          // that's shared across 2+ lazy-loaded routes (see React.lazy() call
          // sites and the ~800 individual @mui/icons-material imports across
          // the app) its own tiny chunk file - 146 JS files in a prod build,
          // many under 300 bytes. Opening one page can then fire dozens of
          // near-simultaneous asset requests, which is what was tripping the
          // 429s: real payload is ~5.7MB total, so the problem is request
          // *count*, not size. Grouping vendor code into a handful of larger,
          // long-lived-cache chunks collapses that burst.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('@mui/icons-material')) return 'mui-icons'
            // MUI/Emotion, React, React-DOM and React-Router have circular
            // internal references (react-is, prop-types, etc). Splitting them
            // into separate chunk *files* forces the browser to execute one
            // chunk before another has finished initializing its exports,
            // which throws "Cannot access 'X' before initialization" at
            // runtime (a cross-chunk temporal-dead-zone bug, not a server or
            // deployment issue). Keeping them in one chunk avoids that boundary
            // while still cutting request count via a single large 'vendor'
            // file; icons have no such circular deps so they stay split out.
            return 'vendor'
          },
        },
      },
    },
  }
})
