import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Performance-optimized Vite configuration for ATİS Frontend
 * Includes advanced optimizations for production builds
 */
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh for development
      fastRefresh: true,
      // Optimize React in production
      babel: {
        plugins: [
          // Remove prop-types in production
          process.env.NODE_ENV === 'production' && ['babel-plugin-transform-remove-console']
        ].filter(Boolean)
      }
    })
  ],

  // Performance optimizations
  build: {
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for common libraries
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query'
          ],
          // UI chunk for component libraries
          ui: [
            'framer-motion',
            'react-icons',
            'classnames'
          ],
          // Utils chunk for utilities
          utils: [
            'axios',
            'date-fns',
            'uuid'
          ],
          // i18n chunk for internationalization
          i18n: [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
            'i18next-http-backend'
          ]
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },

    // Build optimizations
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      },
      format: {
        comments: false
      }
    },

    // Source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,

    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Asset optimization
    assetsInlineLimit: 4096 // Inline assets smaller than 4kb
  },

  // Development server optimizations
  server: {
    // Enable CORS for API calls
    cors: true,
    // API proxy for development
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    },
    // Enable HMR
    hmr: {
      overlay: true
    }
  },

  // Resolve optimizations
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@hooks': resolve(__dirname, 'src/hooks')
    }
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'framer-motion'
    ],
    exclude: [
      // Exclude large dependencies that should be loaded separately
    ]
  },

  // Preview server configuration (for production testing)
  preview: {
    port: 4173,
    strictPort: true,
    cors: true
  },

  // CSS preprocessing optimizations
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        // Add global SCSS variables if using SCSS
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    postcss: {
      plugins: [
        // Add PostCSS plugins for CSS optimization
        require('autoprefixer'),
        ...(process.env.NODE_ENV === 'production' 
          ? [require('cssnano')({ preset: 'default' })]
          : []
        )
      ]
    }
  },

  // Environment variables
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
    __TEST__: process.env.NODE_ENV === 'test'
  },

  // Worker configuration for better performance
  worker: {
    format: 'es'
  },

  // JSON optimization
  json: {
    namedExports: true,
    stringify: false
  }
});