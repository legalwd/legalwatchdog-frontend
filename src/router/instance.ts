import type { Router } from 'vue-router'

let router: Router

export const setRouter = (routerInstance: Router) => {
  router = routerInstance
}

export default () => router
