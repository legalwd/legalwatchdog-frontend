<script setup lang="ts">
import HomeFrame from '@/assets/images/HomeFrame.jpg'
</script>

<template>
  <div
    class="app-container relative mt-8 hidden overflow-hidden px-4 sm:mt-12 sm:block sm:h-120 sm:px-6 lg:mt-24 xl:rounded-2xl"
  >
    <img
      :src="HomeFrame"
      alt="Legal WatchDog dashboard overview"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover object-center"
    />
    <div
      class="bg-background absolute bottom-18 left-10 z-10 flex w-md items-center justify-center rounded-2xl p-12 font-medium"
    >
      <p class="text-foreground">
        From monitoring global regulations to flagging risky changes,
        <span class="text-accent">Legal WatchDog</span> automates the entire compliance-tracking
        process so you never miss an update.
      </p>
    </div>
  </div>
</template>
