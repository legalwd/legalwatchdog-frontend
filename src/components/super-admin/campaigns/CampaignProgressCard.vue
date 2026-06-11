<script setup lang="ts">
import { computed } from 'vue'

import CampaignStatusBadge from '@/components/super-admin/campaigns/CampaignStatusBadge.vue'
import type { CampaignStatus } from '@/types/campaign'

const props = defineProps<{
  status: CampaignStatus | null
  loading?: boolean
  streamConnected?: boolean
  updatedAt?: string | null
}>()

const statusLabel = computed(() => props.status || 'DRAFT')

const updatedLabel = computed(() => {
  if (!props.updatedAt) return 'Unavailable'
  const date = new Date(props.updatedAt)
  if (Number.isNaN(date.getTime())) return 'Unavailable'
  return date.toLocaleString()
})
</script>

<template>
  <div class="border-border bg-background rounded-2xl border p-5">
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <p class="text-muted text-xs font-semibold tracking-wide uppercase">Runtime Status</p>
        <h2 class="text-foreground mt-2 text-lg font-semibold">Campaign Progress</h2>
      </div>
      <CampaignStatusBadge v-if="statusLabel" :status="statusLabel" />
    </div>

    <template v-if="loading">
      <div class="space-y-3">
        <div class="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div class="h-4 w-40 animate-pulse rounded bg-slate-200" />
      </div>
    </template>

    <template v-else>
      <dl class="grid gap-4 md:grid-cols-2">
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Current Phase</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ statusLabel }}</dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Live Updates</dt>
          <dd class="mt-1 text-sm text-slate-700">
            {{ streamConnected ? 'Connected' : 'Polling / idle' }}
          </dd>
        </div>
        <div class="md:col-span-2">
          <dt class="text-muted text-xs font-semibold uppercase">Last Updated</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ updatedLabel }}</dd>
        </div>
      </dl>
    </template>
  </div>
</template>
