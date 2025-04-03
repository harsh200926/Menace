import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize bundle size
    target: 'esnext',
    sourcemap: mode !== 'production',
    // Minify more aggressively
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Chunk splitting for better caching and loading
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-tabs'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
          'motion-vendor': ['framer-motion'],
        },
      },
    },
    // Improve CSS optimization
    cssCodeSplit: true,
    // Faster builds with this setting
    reportCompressedSize: false,
  },
  // Optimizations for development mode
  optimizeDeps: {
    // Include all dependencies for optimization
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'framer-motion',
      'date-fns',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
    // Force dependencies to be bundled
    force: true,
  },
}));
