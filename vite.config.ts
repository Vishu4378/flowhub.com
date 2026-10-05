import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // The API serves everything under /api; proxying keeps the dev app same-origin.
    proxy: {
      '/api': process.env.VITE_API_PROXY ?? 'http://localhost:3000',
    },
  },
});
