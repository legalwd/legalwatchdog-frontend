<script setup lang="ts">
import { RouterLink } from 'vue-router'

import BrandLogo from '@/components/reusable/BrandLogo.vue'
import { Button } from '@/components/ui/button'
</script>

<template>
  <header class="w-full border-b bg-white py-3 shadow-lg">
    <div class="app-container flex w-full items-center justify-between">
      <RouterLink to="/">
        <BrandLogo />
      </RouterLink>
      <Button type="button">Request Demo</Button>
    </div>
  </header>

  <main class="bg-white">
    <router-view />
  </main>

  <footer class="bg-white py-8 md:py-12">
    <div class="app-container flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
      <p>&copy; 2026 Legal WatchDog. All rights reserved.</p>

      <nav class="text-muted *:hover:text-primary space-x-6">
        <RouterLink to="/privacy-policy">Privacy Policy</RouterLink>
        <RouterLink to="/terms">Terms of Use</RouterLink>
      </nav>
    </div>
  </footer>
</template>
