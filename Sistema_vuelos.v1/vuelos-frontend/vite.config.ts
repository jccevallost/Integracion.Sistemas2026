// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias @ → src/ — mismo patrón en React Native (Reto 3) via babel plugin
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Proxy al backend — en Reto 2 cambia el target al API Gateway
    proxy: {
      '/api': {
        target: 'http://localhost:3800',
        changeOrigin: true,
      },
    },
  },
});
