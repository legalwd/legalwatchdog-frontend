<script setup lang="ts">
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { jurisdictionApi } from '@/api/jurisdiction'
import type { Jurisdiction } from '@/api/jurisdiction'
import JurisdictionAnalysis from '@/components/composables/jurisdiction/JurisdictionAnalysis.vue'
import MarkdownRenderer from '@/components/reusable/MarkdownRenderer'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSourceStore } from '@/stores/source-store'
import { useTicketStore } from '@/stores/ticket-store'
import type {
  JurisdictionScrapeHistoryItem,
  JurisdictionScrapeJobSummaryData,
} from '@/types/jurisdiction'
import type { Source, SourceRevision } from '@/types/source'

import { useRevisionTickets, formatRevisionLabel } from '../composables/useRevisionTickets'

const props = withDefaults(
  defineProps<{
    jurisdiction: Jurisdiction | null
    activeOrganizationId: string
    isLoading?: boolean
  }>(),
  {
    isLoading: false,
  },
)

const route = useRoute()
const router = useRouter()

const revisionLimit = 5
const jurisdictionRef = toRef(props, 'jurisdiction')
const activeOrgRef = toRef(props, 'activeOrganizationId')

const sourceStore = useSourceStore()
const ticketStore = useTicketStore()
const { handleOpenTicket, maybeAutoCreateTicket } = useRevisionTickets({
  jurisdiction: jurisdictionRef,
  activeOrganizationId: activeOrgRef,
})

const sources = computed(() => sourceStore.sources)
const revisions = computed(() => sourceStore.revisions)
const sourcesLoading = computed(() => sourceStore.loading)

const selectedSourceId = ref<string>('')
const selectedRevisionId = ref<string | null>(null)
const changeState = ref<'change' | 'no-change'>('no-change')
const analysisView = ref<'data-page' | 'source'>('data-page')
const scrapeHistory = ref<JurisdictionScrapeHistoryItem[]>([])
const scrapeHistoryLoading = ref(false)
const scrapeHistoryError = ref<string | null>(null)
const scrapeHistoryPageSize = 10
const summaryModalOpen = ref(false)
const summaryLoading = ref(false)
const summaryError = ref<string | null>(null)
const summaryData = ref<JurisdictionScrapeJobSummaryData | null>(null)
const summaryJob = ref<JurisdictionScrapeHistoryItem | null>(null)

const querySourceId = computed(() => {
  const value = route.query.sourceId
  return typeof value === 'string' ? value : Array.isArray(value) ? value[0] : ''
})

const queryRevisionId = computed(() => {
  const value = route.query.revisionId
  return typeof value === 'string' ? value : Array.isArray(value) ? value[0] : ''
})

const revisionOptions = computed(() =>
  selectedSourceId.value ? revisions.value[selectedSourceId.value] || [] : [],
)
const selectedRevision = computed(
  () => revisionOptions.value.find((rev) => rev.id === selectedRevisionId.value) || null,
)

const revisionsLoading = computed(() => {
  if (!selectedSourceId.value) return false
  return sourceStore.revisionsLoading[selectedSourceId.value] || false
})

const showTabLoading = computed(
  () => props.isLoading || sourcesLoading.value || revisionsLoading.value,
)

const getErrorMessage = (err: unknown, fallback: string) => {
  const apiErr = err as { response?: { data?: { message?: string; detail?: string } } }
  return apiErr.response?.data?.message || apiErr.response?.data?.detail || fallback
}

const fetchScrapeHistory = async (page = 1) => {
  if (!props.jurisdiction?.id || !props.activeOrganizationId) return
  if (scrapeHistoryLoading.value) return
  scrapeHistoryLoading.value = true
  scrapeHistoryError.value = null
  try {
    const res = await jurisdictionApi.getScrapeHistory(
      props.activeOrganizationId,
      props.jurisdiction.id,
      { page, page_size: scrapeHistoryPageSize },
    )
    const data = res.data?.data
    const items = Array.isArray(data?.jobs) ? data.jobs : []
    if (page === 1) {
      scrapeHistory.value = items
    } else {
      scrapeHistory.value = [...scrapeHistory.value, ...items]
    }
  } catch (err) {
    scrapeHistoryError.value = getErrorMessage(err, 'Failed to load scrape history')
  } finally {
    scrapeHistoryLoading.value = false
  }
}

const fetchScrapeSummary = async (job: JurisdictionScrapeHistoryItem) => {
  if (!props.jurisdiction?.id || !props.activeOrganizationId || !job.id) return
  summaryModalOpen.value = true
  summaryJob.value = job
  summaryLoading.value = true
  summaryError.value = null
  summaryData.value = null
  try {
    const res = await jurisdictionApi.getScrapeJobSummary(
      props.activeOrganizationId,
      props.jurisdiction.id,
      job.id,
    )
    summaryData.value = res.data?.data ?? null
  } catch (err) {
    summaryError.value = getErrorMessage(err, 'Failed to load scrape summary')
  } finally {
    summaryLoading.value = false
  }
}

const renderSummary = (summary?: string | null) => {
  if (!summary) return ''

  try {
    const html = marked.parse(summary, { breaks: true }) as string
    return DOMPurify.sanitize(html)
  } catch (err) {
    console.error('Failed to render markdown summary', err)
    return ''
  }
}

const fetchRevisionsForSource = async (sourceId: string, page = 1) => {
  const skip = (page - 1) * revisionLimit

  try {
    await sourceStore.fetchRevisions(sourceId, { skip, limit: revisionLimit })
    await maybeAutoCreateTicket(sourceId, revisions.value, sources.value)
  } catch (err) {
    console.error('Failed to load revisions', err)
  }
}

const updateQuery = (payload: { sourceId?: string | null; revisionId?: string | null }) => {
  const nextQuery = {
    ...route.query,
    tab: 'analysis',
    sourceId: payload.sourceId || undefined,
    revisionId: payload.revisionId || undefined,
  }
  router.replace({ query: nextQuery })
}

const handleSelectSource = (id: string) => {
  selectedSourceId.value = id
  updateQuery({ sourceId: id, revisionId: null })
}

const handleSelectRevision = (id: string | null) => {
  selectedRevisionId.value = id
  const rev = revisionOptions.value.find((item) => item.id === id)
  changeState.value = rev?.was_change_detected ? 'change' : 'no-change'
  updateQuery({ sourceId: selectedSourceId.value, revisionId: id })
}

const openTicket = async (payload: { source: Source; revision: SourceRevision }) => {
  const created = await handleOpenTicket(payload)
  if (!created) return
}

const buildDownloadUrl = (rev?: SourceRevision | null) => {
  if (!rev?.minio_object_key) return null
  const key = rev.minio_object_key
  if (/^https?:\/\//i.test(key)) return key
  const base = import.meta.env.VITE_MINIO_BASE_URL || ''
  const normalizedBase = base.replace(/\/+$/, '')
  const normalizedKey = key.replace(/^\/+/, '')
  return normalizedBase ? `${normalizedBase}/${normalizedKey}` : `/${normalizedKey}`
}

const downloadUrl = computed(() => buildDownloadUrl(selectedRevision.value))

const handleDownloadRevision = () => {
  if (!downloadUrl.value) {
    toast.error('No file available to download for this revision.')
    return
  }
  window.open(downloadUrl.value, '_blank')
}

const handleMarkChange = (state: 'change' | 'no-change') => {
  changeState.value = state
}

const handleOpenTicketClick = (revision: SourceRevision | null) => {
  if (!revision) return
  const src = sources.value.find((s) => s.id === selectedSourceId.value)
  if (!src) return
  void openTicket({ source: src, revision })
}

const closeSummaryModal = () => {
  summaryModalOpen.value = false
}

watch(
  sources,
  (list) => {
    if (querySourceId.value && list.some((src) => src.id === querySourceId.value)) {
      if (selectedSourceId.value !== querySourceId.value) {
        selectedSourceId.value = querySourceId.value
      }
      return
    }
    if (!selectedSourceId.value && list.length) {
      selectedSourceId.value = list[0]?.id as string
    }
  },
  { immediate: true },
)

watch(
  selectedSourceId,
  async (id) => {
    selectedRevisionId.value = null
    if (id) {
      await fetchRevisionsForSource(id)
    }
  },
  { immediate: true },
)

watch(revisionOptions, (opts) => {
  if (!opts.length) {
    selectedRevisionId.value = null
    return
  }

  const queryMatch = queryRevisionId.value
    ? opts.find((rev) => rev.id === queryRevisionId.value)
    : null
  if (queryMatch) {
    selectedRevisionId.value = queryMatch.id
    changeState.value = queryMatch.was_change_detected ? 'change' : 'no-change'
    return
  }
  if (!selectedRevisionId.value && opts[0]) {
    selectedRevisionId.value = opts[0].id
    changeState.value = opts[0].was_change_detected ? 'change' : 'no-change'
    updateQuery({ sourceId: selectedSourceId.value, revisionId: opts[0].id })
  }
})

watch(
  () => route.query,
  () => {
    if (querySourceId.value && querySourceId.value !== selectedSourceId.value) {
      const match = sources.value.find((s) => s.id === querySourceId.value)
      if (match) selectedSourceId.value = querySourceId.value
    }
  },
)

onMounted(() => {
  if (!sources.value.length && props.jurisdiction?.id) {
    sourceStore.fetchSources(props.jurisdiction.id)
  }
})

watch(
  analysisView,
  (view) => {
    if (view === 'data-page' && !scrapeHistory.value.length && !scrapeHistoryLoading.value) {
      fetchScrapeHistory()
    }
  },
  { immediate: true },
)

watch(
  () => [props.jurisdiction?.id, props.activeOrganizationId],
  ([jurisdictionId, orgId], [prevJurisdictionId, prevOrgId]) => {
    if (jurisdictionId === prevJurisdictionId && orgId === prevOrgId) return
    scrapeHistory.value = []
    if (analysisView.value === 'data-page') {
      fetchScrapeHistory()
    }
  },
)
</script>

<template>
  <div class="space-y-4 p-6">
    <div v-if="showTabLoading" class="space-y-5">
      <div class="space-y-2">
        <div class="skeleton-line h-5 w-32"></div>
        <div class="skeleton-line h-4 w-52"></div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="space-y-2">
          <div class="skeleton-line h-4 w-20"></div>
          <div class="skeleton-line h-11 w-full rounded-lg"></div>
        </div>
        <div class="space-y-2">
          <div class="skeleton-line h-4 w-24"></div>
          <div class="skeleton-line h-11 w-full rounded-lg"></div>
        </div>
      </div>

      <div class="border-border bg-background space-y-3 rounded-lg border p-4">
        <div class="skeleton-line h-4 w-40"></div>
        <div class="skeleton-line h-4 w-56"></div>
        <div class="skeleton-line h-20 w-full rounded-lg"></div>
      </div>
    </div>

    <JurisdictionAnalysis
      v-else
      :sources="sources"
      :selected-source-id="selectedSourceId"
      :revision-options="revisionOptions"
      :selected-revision-id="selectedRevisionId"
      :selected-revision="selectedRevision"
      :change-state="changeState"
      :download-url="downloadUrl"
      :format-revision-label="formatRevisionLabel"
      :render-summary="renderSummary"
      :ticket-for-revision="ticketStore.ticketForRevision"
      :analysis-view="analysisView"
      :scrape-history="scrapeHistory"
      :scrape-history-loading="scrapeHistoryLoading"
      :scrape-history-error="scrapeHistoryError"
      @change-view="analysisView = $event"
      @select-source="handleSelectSource"
      @select-revision="handleSelectRevision"
      @mark-change="handleMarkChange"
      @download="handleDownloadRevision"
      @open-ticket="({ revision }) => handleOpenTicketClick(revision)"
      @view-summary="fetchScrapeSummary"
    />

    <Dialog :open="summaryModalOpen" @update:open="summaryModalOpen = $event">
      <DialogScrollContent
        class="bg-background border-border w-full max-w-3xl rounded-xl border p-6"
      >
        <DialogHeader class="space-y-2">
          <DialogTitle class="text-foreground text-xl font-semibold"> Scrape summary </DialogTitle>
          <p class="text-muted text-sm">
            {{ summaryData?.status || summaryJob?.status || 'Status unavailable' }}
          </p>
        </DialogHeader>

        <div class="mt-4 space-y-4">
          <p v-if="summaryLoading" class="text-muted text-sm">Loading summary...</p>
          <p v-else-if="summaryError" class="text-error text-sm">
            {{ summaryError }}
          </p>
          <p v-else-if="summaryData?.error_message" class="text-error text-sm">
            {{ summaryData.error_message }}
          </p>
          <div v-else-if="summaryData" class="space-y-4">
            <div
              v-if="summaryData.markdown_summary"
              class="border-border bg-background rounded-lg border p-4"
            >
              <MarkdownRenderer :markdown="summaryData.markdown_summary" />
            </div>

            <div
              v-if="summaryData.changes?.length"
              class="border-border bg-background rounded-lg border p-4"
            >
              <h4 class="text-foreground text-sm font-semibold">Changes</h4>
              <ul class="text-muted mt-3 space-y-2 text-sm">
                <li
                  v-for="(change, index) in summaryData.changes"
                  :key="change.change_id || `${change.field}-${index}`"
                >
                  {{ change.change_description || `${change.field} updated` }}
                </li>
              </ul>
            </div>
          </div>
          <p v-else class="text-muted text-sm">No summary available for this job.</p>
        </div>

        <DialogFooter class="mt-6 flex justify-end">
          <button type="button" class="btn--secondary btn--md" @click="closeSummaryModal">
            Close
          </button>
        </DialogFooter>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
