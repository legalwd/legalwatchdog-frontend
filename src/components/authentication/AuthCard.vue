<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { RouterLink } from 'vue-router'

import BrandLogo from '../reusable/BrandLogo.vue'

defineProps<{
  headerText?: string
}>()

const slots = useSlots()
const hasHeaderActions = computed(() => Boolean(slots['header-actions']))
</script>

<template>
  <div class="w-full max-w-120">
    <div
      class="mb-10 flex items-center gap-4"
      :class="hasHeaderActions ? 'justify-between' : 'justify-center'"
    >
      <RouterLink to="/" aria-label="Homepage" class="shrink-0">
        <BrandLogo class="flex w-auto" />
      </RouterLink>
      <slot v-if="hasHeaderActions" name="header-actions" />
    </div>
    <div class="mb-12">
      <h2 class="mb-2 text-3xl font-semibold lg:text-[40px]">{{ headerText }}</h2>
      <slot name="desc" />
    </div>
    <slot />
  </div>
</template>
