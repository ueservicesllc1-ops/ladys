import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para el servidor de subida de B2
      '/api/upload': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
