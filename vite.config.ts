import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.xlsx', '**/*.xlsm'],
  base: "/airtelchm/",
  server: {
    host: '0.0.0.0',  // Your server's IP address
    port: 5174,           // The port Vite will run on
    open: true,           // Optional: opens the browser automatically
  },
})
