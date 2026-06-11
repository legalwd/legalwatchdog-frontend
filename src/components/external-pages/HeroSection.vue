<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useAuthStore } from '@/stores/auth-store'

import PillTag from '../reusable/PillTag.vue'
import { Button } from '../ui/button'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <section id="hero" class="relative flex w-full flex-1 items-center justify-center">
    <div
      class="mx-auto flex w-full max-w-225 flex-col items-center px-4 pt-12 text-center sm:px-6 sm:pt-16 lg:pt-44"
    >
      <PillTag>AI-Powered Regulatory Intelligence</PillTag>

      <h1
        class="text-brand-850 mt-6 text-center text-3xl font-bold sm:mt-8 sm:text-4xl md:text-5xl md:leading-16 lg:text-6xl"
      >
        Stay Ahead of Critical Changes Across Your Entire Organization
      </h1>
      <p class="mt-5 text-xl leading-8 font-medium">
        Legal WatchDog is an enterprise-grade monitoring platform that tracks important websites,
        documents, and policy sources for you, valerting your team instantly when anything changes.
      </p>

      <!-- CTA Button -->
      <Button
        as-child
        class="mt-6 cursor-pointer self-center px-6 text-sm sm:mt-7 sm:px-8 sm:text-base lg:mt-8"
        size="lg"
        variant="default"
      >
        <RouterLink :to="isAuthenticated ? { name: 'dashboard' } : { path: '/signup' }">
          {{ isAuthenticated ? 'Go to Dashboard' : 'Start Monitoring Now' }}
        </RouterLink>
      </Button>
    </div>
  </section>
</template>
