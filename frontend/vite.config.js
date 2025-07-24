import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Enable access from Docker
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:8000', // Will point to Flask backend in Docker
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  preview: {
    host: true,
    port: 3000
  }
})