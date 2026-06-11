<script setup lang="ts">
import { RouterLink } from 'vue-router'

import MainHeader from '@/components/external-pages/MainHeader.vue'
import Button from '@/components/ui/button/Button.vue'
</script>

<template>
  <div
    class="relative flex max-h-screen w-screen flex-col items-center justify-center overflow-hidden"
  >
    <MainHeader />
    <div
      class="pointer-events-none absolute top-0 left-1/2 -z-10 h-200 w-400 -translate-x-1/2 -translate-y-[60%] rounded-[50%]"
      style="
        background: radial-gradient(
          ellipse,
          #f8d9c5 0%,
          rgba(248, 217, 197, 0.5) 40%,
          rgba(247, 247, 247, 0.8) 70%,
          #f7f7f7 100%
        );
      "
    ></div>
    <main class="flex h-screen w-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div class="flex flex-col items-center justify-center gap-4">
        <h1 class="text-primary text-8xl font-bold tracking-tighter">404</h1>
        <p class="text-foreground text-2xl font-semibold">Page Not Found</p>
        <p class="max-w-md">Sorry, We can't find the page you're looking for</p>
      </div>
      <Button as-child class="btn--default">
        <RouterLink to="/">Go Back Home</RouterLink>
      </Button>
      <p class="absolute bottom-8 text-sm">Copyright © 2025 Legal WatchDog | All Rights Reserved</p>
    </main>
  </div>
</template>
