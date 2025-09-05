import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for React
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  optimizeDeps: {
    include: ['@adobe/react-spectrum', '@spectrum-icons/workflow']
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Don't externalize React Spectrum modules
        if (id.includes('@adobe/react-spectrum') || id.includes('@spectrum-icons')) {
          return false;
        }
        return false;
      }
    }
  }
})