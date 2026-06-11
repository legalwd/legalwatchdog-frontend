import { resolve } from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import {} from 'vite-ssg' // to avoid type errors with ssgOptions

import { blogPosts } from './src/data/posts'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('/chart.js/') || id.includes('/vue-chartjs/')) {
            return 'charts'
          }

          if (id.includes('/marked/') || id.includes('/dompurify/')) {
            return 'markdown'
          }
        },
      },
    },
  },
  ssgOptions: {
    includedRoutes: (_, routes) => {
      const landingLayoutRoute = routes.find((r) => r.path === '/' && r.name === 'landing')

      const landingPagePaths =
        landingLayoutRoute?.children
          ?.map((child) => `/${child.path}`)
          .filter((path) => !path.includes(':')) ?? []

      const dynamicBlogPaths = blogPosts.map((post) => `/blog/${post.slug}`)

      return [...new Set([...landingPagePaths, ...dynamicBlogPaths])]
    },
  },
  plugins: [VueRouter(), vue(), vueJsx(), /* vueDevTools(), */ tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
