import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@vision-platform/shared': resolve(__dirname, '../packages/shared/src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', '@heroicons/react', 'react-hot-toast'],
          'utils-vendor': ['@tanstack/react-query', 'axios', 'lodash'],
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          
          // Feature chunks
          'translation': [
            './src/pages/TranslationPage.tsx',
            './src/components/PersonalGlossary.tsx',
            './src/components/TranslationHistory.tsx',
          ],
          'documents': [
            './src/pages/DocumentReaderPage.tsx',
            './src/components/ImageUploader.tsx',
          ],
          'assistant': [
            './src/pages/GeminiAssistantPage.tsx',
            './src/components/SceneAnalyzer.tsx',
          ],
          'analytics': [
            './src/pages/AnalyticsPage.tsx',
          ],
          'payment': [
            './src/pages/PaymentPage.tsx',
            './src/components/StripeCheckout.tsx',
            './src/components/BillingManagement.tsx',
          ],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '')
            : 'chunk'
          return `js/${facadeModuleId}-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? []
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name ?? '')) {
            return `media/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name ?? '')) {
            return `img/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name ?? '')) {
            return `fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@heroicons/react',
      'react-hot-toast',
      '@tanstack/react-query',
    ],
    exclude: ['@vision-platform/shared'],
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
    open: true,
  },
  css: {
    devSourcemap: true,
    postcss: './postcss.config.js',
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },
  esbuild: {
    // jsxInject removed to avoid conflicts with manual React imports
  },
  worker: {
    format: 'es',
  },
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    },
  },
})