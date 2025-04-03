import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  // Properly handle external dependencies
  build: {
    rollupOptions: {
      // Explicitly specify Three.js as external
      external: ['three'],
      output: {
        globals: {
          three: 'THREE'
        },
        // Ensure proper asset handling
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
      // Define input files to include in the build
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog.html'),
        blogPost: resolve(__dirname, 'blog-post.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    },
    // Ensure assets are copied correctly
    assetsInlineLimit: 0,
    // Specify output directory
    outDir: 'dist',
    emptyOutDir: true,
  },
  // Copy standard public files
  publicDir: 'public',
  // Include PHP files and other assets that should be copied as-is
  plugins: [
    viteStaticCopy({
      targets: [
        { 
          src: '.htaccess', 
          dest: '.' 
        },
        { 
          src: 'api/**/*', 
          dest: 'api/' 
        },
        { 
          src: 'blog_data/**/*', 
          dest: 'blog_data/' 
        },
        { 
          src: '*.php', 
          dest: '.' 
        },
        {
          src: 'blog/**/*.{php,css,js,html}',
          dest: 'blog/'
        }
      ]
    })
  ],
  // Preserve file structure in the output directory
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});