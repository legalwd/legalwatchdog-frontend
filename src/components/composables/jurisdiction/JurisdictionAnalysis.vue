<script setup lang="ts">
/* eslint-disable vue/no-v-html */
import type { JurisdictionScrapeHistoryItem } from '@/types/jurisdiction'
import type { Source } from '@/types/source'
import type { SourceRevision } from '@/types/source'

defineProps<{
  sources: Source[]
  selectedSourceId: string
  revisionOptions: SourceRevision[]
  selectedRevisionId: string | null
  selectedRevision: SourceRevision | null
  changeState: 'change' | 'no-change'
  downloadUrl: string | null
  formatRevisionLabel: (rev: { scraped_at: string }) => string
  renderSummary: (summary?: string | null) => string
  analysisView: 'data-page' | 'source'
  scrapeHistory: JurisdictionScrapeHistoryItem[]
  scrapeHistoryLoading: boolean
  scrapeHistoryError: string | null
}>()

const emit = defineEmits<{
  (e: 'change-view', view: 'data-page' | 'source'): void
  (e: 'select-source', id: string): void
  (e: 'select-revision', id: string | null): void
  (e: 'mark-change', payload: 'change' | 'no-change'): void
  (e: 'download'): void
  (e: 'open-ticket', payload: { revision: SourceRevision | null }): void
  (e: 'view-summary', payload: JurisdictionScrapeHistoryItem): void
}>()

const formatTimestamp = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return date.toLocaleString()
}
</script>

<template>
  <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h3 class="text-lg font-semibold text-[#1F1F1F]">Analysis</h3>
      <p class="text-xs text-gray-500">Review a single revision and act on it.</p>
    </div>
    <div
      class="mt-3 inline-flex w-fit rounded-lg border border-gray-200 bg-white p-1 text-xs font-medium"
    >
      <button
        type="button"
        class="rounded-md px-3 py-1 transition-colors"
        :class="
          analysisView === 'data-page'
            ? 'bg-accent-main text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        "
        @click="emit('change-view', 'data-page')"
      >
        Data page analysis
      </button>
      <button
        type="button"
        class="rounded-md px-3 py-1 transition-colors"
        :class="
          analysisView === 'source'
            ? 'bg-accent-main text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        "
        @click="emit('change-view', 'source')"
      >
        Source analysis
      </button>
    </div>
  </div>

  <div v-if="analysisView === 'data-page'" class="space-y-4">
    <div class="bg-background rounded-lg border p-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-semibold text-gray-900">Scrape history</h4>
          <p class="text-xs text-gray-500">Recent jurisdiction scrape jobs.</p>
        </div>
      </div>
      <p v-if="scrapeHistoryLoading" class="mt-3 text-sm text-gray-500">
        Loading scrape history...
      </p>
      <p v-else-if="scrapeHistoryError" class="mt-3 text-sm text-red-500">
        {{ scrapeHistoryError }}
      </p>
      <p v-else-if="!scrapeHistory.length" class="mt-3 text-sm text-gray-500">
        No scrape history yet.
      </p>
      <div v-else class="mt-3 divide-y">
        <div v-for="job in scrapeHistory" :key="job.id" class="py-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="text-sm font-medium text-gray-900">
              Status: {{ job.status || 'Unknown' }}
            </div>
            <div class="text-xs text-gray-500">
              Started: {{ formatTimestamp(job.started_at || job.created_at) }}
            </div>
          </div>
          <div class="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
            <span v-if="job.completed_at">Completed: {{ formatTimestamp(job.completed_at) }}</span>
            <span v-if="job.total_sources !== undefined">
              Sources: {{ job.successful_sources ?? 0 }}/{{ job.total_sources }}
            </span>
            <span v-if="job.filtered_sources !== undefined">
              Filtered: {{ job.filtered_sources }}
            </span>
            <span v-if="job.changes_count !== undefined">Changes: {{ job.changes_count }}</span>
            <span v-if="job.error_message" class="text-red-500">
              Error: {{ job.error_message }}
            </span>
          </div>
          <div>
            <button
              type="button"
              class="btn btn--link btn--primary mt-3"
              @click="emit('view-summary', job)"
            >
              View summary
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="grid gap-4 lg:grid-cols-2">
    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium text-gray-800">Source</label>
      <select
        :value="selectedSourceId"
        class="focus:border-accent-main focus:ring-accent-main/20 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:ring-2 focus:outline-none"
        @change="emit('select-source', ($event.target as HTMLSelectElement).value)"
      >
        <option disabled value="">Select a source</option>
        <option v-for="src in sources" :key="src.id" :value="src.id">
          {{ src.name }}
        </option>
      </select>
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium text-gray-800">Revision</label>
      <select
        :value="selectedRevisionId || ''"
        class="focus:border-accent-main focus:ring-accent-main/20 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:ring-2 focus:outline-none"
        :disabled="!revisionOptions.length"
        @change="emit('select-revision', ($event.target as HTMLSelectElement).value || null)"
      >
        <option v-if="!revisionOptions.length" disabled value="">No revisions yet</option>
        <option v-for="rev in revisionOptions" :key="rev.id" :value="rev.id">
          {{ formatRevisionLabel(rev) }}
        </option>
      </select>
    </div>
  </div>

  <div v-if="analysisView === 'source'" class="bg-background space-y-3 rounded-lg border p-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h4 class="text-sm font-semibold text-gray-900">Selected revision</h4>
        <p class="text-xs text-gray-500">
          {{
            selectedRevision ? formatRevisionLabel(selectedRevision) : 'Choose a revision to load.'
          }}
        </p>
        <span
          v-if="selectedRevision"
          class="mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold uppercase"
          :class="
            changeState === 'change' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          "
        >
          {{ changeState === 'change' ? 'Change Detected' : 'No Change' }}
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <!-- <template v-if="selectedRevision?.was_change_detected">
          <button
            type="button"
            class="btn--default btn--sm"
            :disabled="!selectedRevision"
            @click="emit('mark-change', 'change')"
          >
            Accept change
          </button>
          <button
            type="button"
            class="btn--secondary btn--sm"
            :disabled="!selectedRevision"
            @click="emit('mark-change', 'no-change')"
          >
            Ignore
          </button>
          <button
            type="button"
            class="btn--secondary btn--sm"
            :disabled="!selectedRevision"
            @click="emit('open-ticket', { revision: selectedRevision })"
          >
            {{
              selectedRevision && ticketForRevision && ticketForRevision(selectedRevision.id)
                ? 'View ticket'
                : 'Open ticket'
            }}
          </button>
        </template> -->
        <button
          type="button"
          class="btn--secondary btn--sm"
          :disabled="!downloadUrl"
          @click="emit('download')"
        >
          Download
        </button>
      </div>
    </div>

    <div v-if="selectedRevision" class="prose prose-sm max-w-none text-gray-800">
      <div
        v-html="renderSummary(selectedRevision.ai_markdown_summary || selectedRevision.ai_summary)"
      ></div>
    </div>
    <p v-else class="text-sm text-gray-500">Choose a revision to display.</p>
  </div>
</template>
