/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

// Convert file URL to path for better cross-platform compatibility
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  css: {
    postcss: './postcss.config.mjs',
    preprocessorOptions: {
      scss: {
        // Temporarily disabled to avoid import errors
        // additionalData: `@use "@/styles/tokens" as *;`,
      },
    },
    modules: {
      // Enable CSS modules for .module.scss files
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      localsConvention: 'camelCaseOnly',
    },
    // Enable source maps in development
    devSourcemap: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['class-variance-authority', 'clsx', 'tailwind-merge'],
          
          // UI components chunk
          'ui-components': [
            './src/components/ui/Button',
            './src/components/ui/Card',
            './src/components/ui/Form',
            './src/components/ui/Modal',
            './src/components/ui/Loading',
            './src/components/ui/Alert',
          ],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        'dist/',
        '**/*.scss',
      ],
    },
  },
});
