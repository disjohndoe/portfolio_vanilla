import { defineConfig } from 'vite';

export default defineConfig({
  // Properly handle external dependencies
  build: {
    rollupOptions: {
      // Explicitly specify Three.js as external
      // This tells Vite/Rollup to not try to bundle it
      external: ['three'],
      output: {
        // Global variable for external dependencies
        globals: {
          three: 'THREE'
        },
      }
    }
  }
});
