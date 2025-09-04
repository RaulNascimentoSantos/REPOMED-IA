import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    Buffer: 'undefined',  // Definir Buffer como undefined para evitar erros
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3006,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      '/metrics': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@headlessui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('react-router') || id.includes('react-hook-form')) {
              return 'router-forms';
            }
            if (id.includes('zod') || id.includes('@hookform')) {
              return 'validation';
            }
            if (id.includes('pdfkit') || id.includes('qrcode')) {
              return 'pdf-qr';
            }
            if (id.includes('chart') || id.includes('recharts')) {
              return 'charts';
            }
            // General vendor chunk for remaining dependencies
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    minify: 'esbuild'
  }
})