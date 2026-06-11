<script setup lang="ts">
import { useRoute } from 'vue-router'

import BrandLogo from '../reusable/BrandLogo.vue'

const route = useRoute()

const menuItems = [
  { name: 'Dashboard', path: '/app', icon: 'HomeIcon' },
  { name: 'Organizations', path: '/app/organizations', icon: 'ProjectsIcon' },
  { name: 'Jurisdictions', path: '/app/jurisdictions', icon: 'JurisdictionsIcon' },
]

const isActive = (path: string) => {
  if (path === '/app') {
    return route.path === '/app' || route.path === '/app/dashboard'
  }
  return route.path.startsWith(path)
}

const HomeIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
}

const ProjectsIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
}

const JurisdictionsIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
}
</script>

<template>
  <aside class="bg-background flex w-64 flex-col text-gray-800">
    <div class="border-b px-6 py-3.5">
      <div class="flex items-center space-x-4">
        <RouterLink to="/" aria-label="Homepage" class="shrink-0">
          <BrandLogo />
        </RouterLink>
      </div>
    </div>
    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors"
            :class="
              isActive(item.path) ? 'bg-[#3C2610] text-white' : 'text-gray-700 hover:bg-amber-100'
            "
          >
            <component
              :is="
                item.icon === 'HomeIcon'
                  ? HomeIcon
                  : item.icon === 'ProjectsIcon'
                    ? ProjectsIcon
                    : item.icon === 'JurisdictionsIcon'
                      ? JurisdictionsIcon
                      : HomeIcon
              "
              class="h-5 w-5"
            />
            <span>{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>
