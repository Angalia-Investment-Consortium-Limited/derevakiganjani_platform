import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  publicDir: 'public',
  base: mode === 'production' ? '/landing' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
    manifest: true,
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb to reduce warnings
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['@tanstack/react-query', 'lucide-react'],
        }
      }
    },
  },
}))
