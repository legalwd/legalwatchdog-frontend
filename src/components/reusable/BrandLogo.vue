<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'WatchDog',
  },
)
</script>

<template>
  <div class="text-primary flex items-center gap-3">
    <img src="/images/logo.png" alt="Legal Watchdog Logo" class="h-11 w-11 shrink-0" />
    <span class="hidden text-2xl leading-none font-bold sm:block">{{ label }}</span>
  </div>
</template>
