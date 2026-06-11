import { createPinia } from 'pinia'
import { ViteSSG } from 'vite-ssg'

import { createConfirmDialog } from '@/composables/useConfirmDialog'
import { authGuard } from '@/router/guards/auth'

import './assets/styles/main.css'
import 'vue-sonner/style.css'

import App from './App.vue'
import { routes } from './router'
import { setRouter } from './router/instance'

// TEST DEPLOYMENT - Can remove later
console.log('LegalWatchdog Deployed:', new Date().toISOString())
console.log('Pipeline Test: Jan 10, 2026')

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) return savedPosition
      if (to.path === from.path) return false
      return { top: 0 }
    },
  },
  ({ app, router }) => {
    const pinia = createPinia()
    setRouter(router)
    app.use(pinia)
    app.use(createConfirmDialog())

    router.beforeEach(authGuard)
    router.afterEach((to) => {
      if (import.meta.env.SSR) return

      const routeTitle = [...to.matched]
        .reverse()
        .find((record) => typeof record.meta.title === 'string')?.meta.title as string | undefined

      document.title = routeTitle ? `${routeTitle} | Legal WatchDog` : 'Legal WatchDog'
    })
  },
)
