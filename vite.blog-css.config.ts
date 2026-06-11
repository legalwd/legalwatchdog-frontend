import { resolve } from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // This build only compiles the standalone blog stylesheet artifact.
  // Disable Vite's publicDir handling to avoid outDir/publicDir nesting warnings.
  publicDir: false,
  plugins: [tailwindcss()],
  build: {
    outDir: resolve(__dirname, 'public/assets/blog'),
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/assets/blog/entry.v1.ts'),
      formats: ['es'],
      fileName: () => 'blog-css.v1.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names[0]?.endsWith('.css')) {
            return 'styles.v1.css'
          }
          return '[name][extname]'
        },
      },
    },
  },
})
