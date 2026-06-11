<script setup lang="ts">
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-vue-next'
import { computed, onUnmounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import { jurisdictionApi } from '@/api/jurisdiction'
import { Button } from '@/components/ui/button'
import { useSourceStore } from '@/stores/source-store'
import type {
  JurisdictionScrapeStatusData,
  JurisdictionScrapeTriggerData,
} from '@/types/jurisdiction'

const props = withDefaults(
  defineProps<{
    organizationId: string
    jurisdictionId: string
    sourcesCount?: number | null
    isLoading?: boolean
  }>(),
  {
    sourcesCount: null,
    isLoading: false,
  },
)

const emit = defineEmits<{
  (e: 'scrape:completed'): void
}>()

const POLL_INTERVAL_MS = 5000

const sourceStore = useSourceStore()

const statusLoading = ref(false)
const triggerLoading = ref(false)
const error = ref<string | null>(null)
const scrapeStatus = ref<JurisdictionScrapeStatusData | null>(null)
const scrapeTrigger = ref<JurisdictionScrapeTriggerData | null>(null)
const isExpanded = ref(false)
const statusChecked = ref(false)
const lastStatus = ref<string | null>(null)
const sourcesChecked = ref(false)
const sourcesChecking = ref(false)

const hasContext = computed(() => Boolean(props.organizationId && props.jurisdictionId))
const hasSources = computed(() => {
  if (props.sourcesCount !== null && props.sourcesCount !== undefined) {
    return props.sourcesCount > 0
  }
  if (!sourcesChecked.value) return true
  return sourceStore.sources.length > 0
})
const hasJob = computed(() => Boolean(scrapeStatus.value?.job_id || scrapeTrigger.value?.job_id))
const showAddSources = computed(() => sourcesChecked.value && !hasSources.value)

let poller: ReturnType<typeof setInterval> | null = null

const clearPoller = () => {
  if (poller) {
    clearInterval(poller)
    poller = null
  }
}

const formatStatus = (status?: string | null) => {
  if (!status) return 'Not started'
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not available'
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Not available'
  return new Date(timestamp).toLocaleString()
}

const normalizeTrigger = (payload: unknown): JurisdictionScrapeTriggerData | null => {
  if (!payload || typeof payload !== 'object') return null
  const data = payload as Partial<JurisdictionScrapeTriggerData>
  if (!data.job_id || !data.status || !data.started_at) return null
  return {
    job_id: data.job_id,
    status: data.status,
    total_sources: typeof data.total_sources === 'number' ? data.total_sources : 0,
    started_at: data.started_at,
  }
}

const normalizeStatus = (payload: unknown): JurisdictionScrapeStatusData | null => {
  if (!payload || typeof payload !== 'object') return null
  const data = payload as Partial<JurisdictionScrapeStatusData>
  if (!data.job_id || !data.status || !data.started_at) return null
  return {
    job_id: data.job_id,
    status: data.status,
    started_at: data.started_at,
    completed_at: data.completed_at ?? null,
    total_sources: typeof data.total_sources === 'number' ? data.total_sources : 0,
    successful_sources: typeof data.successful_sources === 'number' ? data.successful_sources : 0,
    filtered_sources: typeof data.filtered_sources === 'number' ? data.filtered_sources : 0,
    progress_percentage:
      typeof data.progress_percentage === 'number' ? data.progress_percentage : 0,
  }
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const apiErr = err as { response?: { data?: { message?: string; detail?: string } } }
  return apiErr.response?.data?.message || apiErr.response?.data?.detail || fallback
}

const fetchStatus = async (force = false) => {
  if (!hasContext.value) return
  if (!hasJob.value && !force) return
  if (statusLoading.value && !force) return
  statusLoading.value = true
  error.value = null
  try {
    const res = await jurisdictionApi.getScrapeStatus(props.organizationId, props.jurisdictionId)
    scrapeStatus.value = normalizeStatus(res.data?.data) ?? null
    const currentStatus = scrapeStatus.value?.status ?? null
    if (currentStatus && currentStatus !== lastStatus.value) {
      if (currentStatus === 'COMPLETED') {
        emit('scrape:completed')
      }
      lastStatus.value = currentStatus
    }
    if (scrapeStatus.value?.status === 'COMPLETED') {
      clearPoller()
    }
  } catch (err) {
    error.value = getErrorMessage(err, 'Failed to fetch scrape status')
  } finally {
    statusLoading.value = false
  }
}

const triggerScrape = async () => {
  if (!hasContext.value || triggerLoading.value) return
  triggerLoading.value = true
  error.value = null
  try {
    const res = await jurisdictionApi.triggerScrape(props.organizationId, props.jurisdictionId)
    scrapeTrigger.value = normalizeTrigger(res.data?.data) ?? null
    toast.success(res.data?.message || 'Jurisdiction scrape initiated')
    await fetchStatus(true)
  } catch (err) {
    const message = getErrorMessage(err, 'Failed to trigger scrape')
    error.value = message
    toast.error(message)
  } finally {
    triggerLoading.value = false
  }
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const statusLabel = computed(() =>
  formatStatus(scrapeStatus.value?.status || scrapeTrigger.value?.status),
)
const currentStatus = computed(
  () => scrapeStatus.value?.status ?? scrapeTrigger.value?.status ?? null,
)
const scrapeIndicator = computed(() => {
  const status = currentStatus.value
  if (!status) return null
  if (status === 'COMPLETED') {
    return { label: 'Scrape complete', tone: 'success' as const }
  }
  if (status === 'FAILED') {
    return { label: 'Scrape failed', tone: 'error' as const }
  }
  return { label: 'Scrape in progress', tone: 'loading' as const }
})
const shouldPoll = computed(() => {
  const status = scrapeStatus.value?.status
  if (!status || status === 'COMPLETED' || status === 'FAILED') return false
  const progress = scrapeStatus.value?.progress_percentage
  if (typeof progress === 'number' && progress >= 100) return false
  return true
})
const progressValue = computed(() => {
  if (!scrapeStatus.value) return 0
  return Math.min(100, Math.max(0, scrapeStatus.value.progress_percentage))
})
const progressLabel = computed(() =>
  scrapeStatus.value ? `${progressValue.value}%` : 'Not available',
)
const totalSources = computed(
  () => scrapeStatus.value?.total_sources ?? scrapeTrigger.value?.total_sources ?? 0,
)
const successfulSources = computed(() => scrapeStatus.value?.successful_sources ?? 0)
const filteredSources = computed(() => scrapeStatus.value?.filtered_sources ?? 0)
const startedAt = computed(
  () => scrapeStatus.value?.started_at ?? scrapeTrigger.value?.started_at ?? null,
)
const completedAt = computed(() => scrapeStatus.value?.completed_at ?? null)

const ensureSourcesChecked = async () => {
  if (!props.jurisdictionId) return
  if (props.sourcesCount !== null && props.sourcesCount !== undefined) {
    sourcesChecked.value = true
    return
  }
  if (sourcesChecked.value || sourcesChecking.value) return
  sourcesChecking.value = true
  try {
    await sourceStore.fetchSources(props.jurisdictionId)
  } finally {
    sourcesChecked.value = true
    sourcesChecking.value = false
  }
}

watch(
  () => props.jurisdictionId,
  () => {
    clearPoller()
    scrapeStatus.value = null
    scrapeTrigger.value = null
    error.value = null
    statusChecked.value = false
    lastStatus.value = null
    sourcesChecked.value = false
    sourcesChecking.value = false
  },
)

watch(
  () => [props.organizationId, props.jurisdictionId, shouldPoll.value],
  ([orgId, jurisdictionId, poll]) => {
    clearPoller()
    if (!orgId || !jurisdictionId || !poll) return
    poller = setInterval(() => {
      void fetchStatus()
    }, POLL_INTERVAL_MS)
  },
  { immediate: true },
)

watch(
  () => [props.organizationId, props.jurisdictionId],
  ([orgId, jurisdictionId]) => {
    if (!orgId || !jurisdictionId || statusChecked.value) return
    statusChecked.value = true
    void fetchStatus(true)
    void ensureSourcesChecked()
  },
  { immediate: true },
)

onUnmounted(() => {
  clearPoller()
})
</script>

<template>
  <section class="bg-background rounded-2xl shadow-sm ring-1 ring-gray-100">
    <div v-if="showAddSources" class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-gray-900">Add sources to start scraping</h2>
        <p class="text-sm text-gray-500">
          You need at least one source before a jurisdiction scrape can run.
        </p>
      </div>
    </div>

    <div
      v-else
      class="flex cursor-pointer flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      @click="toggleExpanded"
    >
      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-gray-900">Jurisdiction scrape</h2>
        <p class="text-sm text-gray-500">
          Trigger a scrape for all sources in this jurisdiction and track its progress.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div
          v-if="scrapeIndicator"
          class="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-medium"
          :class="[
            scrapeIndicator.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : scrapeIndicator.tone === 'error'
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-amber-200 bg-amber-50 text-amber-700',
          ]"
        >
          <Loader2 v-if="scrapeIndicator.tone === 'loading'" class="h-3.5 w-3.5 animate-spin" />
          <span
            v-else
            class="h-2 w-2 rounded-full"
            :class="scrapeIndicator.tone === 'success' ? 'bg-emerald-500' : 'bg-red-500'"
          ></span>
          <span>{{ scrapeIndicator.label }}</span>
        </div>
        <Button
          class="bg-accent-main text-white hover:bg-[#2f1202]"
          :loading="triggerLoading"
          :disabled="!hasContext || props.isLoading || triggerLoading"
          @click="triggerScrape"
        >
          Trigger scrape
        </Button>
        <button
          type="button"
          class="btn btn--link"
          :aria-expanded="isExpanded"
          aria-controls="jurisdiction-scrape-content"
          :title="isExpanded ? 'Collapse' : 'Expand'"
          @click="toggleExpanded"
        >
          <span class="inline-flex items-center gap-2">
            <component :is="isExpanded ? ChevronUp : ChevronDown" class="h-4 w-4" />
          </span>
        </button>
      </div>
    </div>

    <div
      v-show="!showAddSources && isExpanded"
      id="jurisdiction-scrape-content"
      class="border-t border-gray-100 px-6 py-4"
    >
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p class="text-xs text-gray-500">Status</p>
          <p class="text-sm font-medium text-gray-900">
            {{ props.isLoading ? 'Loading...' : statusLabel }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Progress</p>
          <p class="text-sm font-medium text-gray-900">
            {{ props.isLoading ? 'Loading...' : progressLabel }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Sources</p>
          <p class="text-sm font-medium text-gray-900">
            {{ props.isLoading ? 'Loading...' : `${successfulSources}/${totalSources}` }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Filtered</p>
          <p class="text-sm font-medium text-gray-900">
            {{ props.isLoading ? 'Loading...' : filteredSources }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Started</p>
          <p class="text-sm font-medium text-gray-900">
            {{ props.isLoading ? 'Loading...' : formatDateTime(startedAt) }}
          </p>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>Completion</span>
          <span>{{ props.isLoading ? '...' : progressLabel }}</span>
        </div>
        <div class="mt-2 h-2 w-full rounded-full bg-gray-100">
          <div
            class="bg-accent-main h-2 rounded-full transition-all duration-500"
            :style="{ width: `${progressValue}%` }"
          ></div>
        </div>
      </div>

      <div class="mt-4 text-xs text-gray-500">
        <span class="font-medium text-gray-700">Completed:</span>
        {{ props.isLoading ? 'Loading...' : formatDateTime(completedAt) }}
      </div>

      <p v-if="error" class="mt-3 text-sm text-red-600">
        {{ error }}
      </p>
    </div>
  </section>
</template>
