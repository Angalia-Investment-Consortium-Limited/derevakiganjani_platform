import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import proxyOptions from './proxyOptions'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: proxyOptions,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  publicDir: 'public',
  // base: process.env.NODE_ENV === 'production' ? '/landing' : '/',
  build: {
    outDir: '../derevahuduma_platform/public/landing',
    emptyOutDir: true,
    target: 'es2015',
    manifest: true,
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb to reduce warnings
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Vendor chunks - separate large dependencies
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
          ],
          'icons-vendor': ['lucide-react'],
          'query-vendor': ['@tanstack/react-query'],
          'frappe-vendor': ['frappe-react-sdk'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
})
