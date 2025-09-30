import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the root to the 'frontend' directory where index.html is located
  root: 'frontend',
  server: {
    // Configure server port
    port: 3000,
    // Proxy API requests to the backend server to avoid CORS issues
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      // Add a proxy for uploaded files
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // The output directory for the build, relative to the project root
    outDir: '../dist',
    emptyOutDir: true,
  },
});