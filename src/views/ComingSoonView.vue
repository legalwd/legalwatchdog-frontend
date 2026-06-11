<script setup lang="ts">
import comingSoonImg from '@/assets/images/coming-soon.webp'
import Button from '@/components/ui/button/Button.vue'
</script>

<template>
  <div class="bg-background flex min-h-screen flex-col">
    <main class="flex flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
      <img :src="comingSoonImg" alt="Coming Soon Illustration" class="w-11/12 md:w-3/5 lg:w-2/5" />

      <div>
        <h1 class="text-primary mb-2 text-5xl font-bold md:text-7xl">Coming Soon</h1>
        <p class="text-muted-foreground text-lg md:text-xl">
          We're working hard to bring you this experience. Stay tuned!
        </p>
      </div>

      <RouterLink to="/waitlist" class="inline-flex">
        <Button class="cursor-pointer">Join the List</Button>
      </RouterLink>
    </main>
  </div>
</template>
