<script setup lang="ts">
import { computed } from 'vue'

import type { CampaignExecutionLog } from '@/types/campaign'

const props = defineProps<{
  logs: CampaignExecutionLog[]
  loading?: boolean
}>()

const sortedLogs = computed(() =>
  [...props.logs].sort((a, b) => {
    const aTime = new Date(a.started_at).getTime()
    const bTime = new Date(b.started_at).getTime()
    return bTime - aTime
  }),
)

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unavailable'
  return date.toLocaleString()
}
</script>

<template>
  <div class="border-border bg-background rounded-2xl border p-5">
    <div class="mb-4">
      <p class="text-muted text-xs font-semibold tracking-wide uppercase">Execution Log</p>
      <h2 class="text-foreground mt-2 text-lg font-semibold">Timeline</h2>
    </div>

    <template v-if="loading">
      <div class="space-y-4">
        <div v-for="i in 3" :key="`timeline-skeleton-${i}`" class="space-y-2">
          <div class="h-4 w-48 animate-pulse rounded bg-slate-200" />
          <div class="h-3 w-full animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </template>

    <template v-else-if="sortedLogs.length === 0">
      <p class="text-sm text-slate-500">No execution logs recorded yet.</p>
    </template>

    <ol v-else class="space-y-4">
      <li v-for="log in sortedLogs" :key="log.id" class="border-border rounded-xl border p-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ log.phase }}</p>
            <p class="mt-1 text-xs text-slate-500">
              Started {{ formatDateTime(log.started_at) }}
              <span v-if="log.completed_at">
                · Completed {{ formatDateTime(log.completed_at) }}</span
              >
            </p>
          </div>
          <div class="text-xs text-slate-600">
            {{ log.completed_items }}/{{ log.total_items }} complete
            <span v-if="log.failed_items"> · {{ log.failed_items }} failed</span>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>
