import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 9002,
    host: '0.0.0.0',
    hmr: {
      protocol: 'wss',
      host: '9000-firebase-derevakiganjani-1769298209139.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev',
    },
  },
  publicDir: 'public',
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
    manifest: true,
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb to reduce warnings
  },
});
