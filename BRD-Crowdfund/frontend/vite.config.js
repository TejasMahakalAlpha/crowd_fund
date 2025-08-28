import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // increase from default 500kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split big dependencies into separate chunks
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('swiper')) return 'swiper-vendor';
            if (id.includes('axios')) return 'axios-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
})
