<script setup lang="ts">
import { computed } from 'vue'

import type { CampaignStatus } from '@/types/campaign'

const props = defineProps<{
  status: CampaignStatus
}>()

const label = computed(() => props.status.replace(/_/g, ' '))

const toneClass = computed(() => {
  switch (props.status) {
    case 'DRAFT':
      return 'bg-slate-100 text-slate-700'
    case 'TAXONOMY_READY':
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700'
    case 'LAUNCHING':
    case 'GENERATING_TAXONOMY':
    case 'HYDRATING':
    case 'DISCOVERING_SOURCES':
    case 'SCRAPING':
    case 'GENERATING_CONTENT':
    case 'PUBLISHING':
    case 'MONITORING':
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-700'
    case 'PAUSED':
      return 'bg-amber-100 text-amber-700'
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase"
    :class="toneClass"
  >
    {{ label }}
  </span>
</template>
