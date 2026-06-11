<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name?: string | null
  imageUrl?: string | null
  size?: number
  backgroundClass?: string
  textClass?: string
  borderClass?: string
}>()

const sizeStyle = computed(() => {
  const s = props.size ?? 40
  return { width: `${s}px`, height: `${s}px` }
})

const initials = computed(() => {
  const base = props.name || ''
  const parts = base.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'
  const first = parts[0]?.[0] ?? ''
  const second = (parts.length > 1 ? parts[1]?.[0] : '') ?? ''
  return `${first}${second}`.toUpperCase()
})
</script>

<template>
  <div
    class="inline-flex items-center justify-center overflow-hidden rounded-full border font-semibold uppercase"
    :class="[
      backgroundClass || 'bg-[#f3e7db]',
      textClass || 'text-primary',
      borderClass || 'border-brand-850',
    ]"
    :style="sizeStyle"
  >
    <img
      v-if="imageUrl"
      :src="imageUrl"
      alt="User avatar"
      class="h-full w-full object-cover"
      loading="lazy"
    />
    <span v-else>{{ initials }}</span>
  </div>
</template>
