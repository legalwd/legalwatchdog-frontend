<script setup lang="ts">
import { File } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { jurisdictionApi } from '@/api/jurisdiction'
import { useJurisdictionStore } from '@/stores/jurisdiction-store'
import { useTicketStore } from '@/stores/ticket-store'
import type {
  JurisdictionDataPage,
  JurisdictionDataPageAvailable,
  JurisdictionDataPageItemChange,
  JurisdictionDataPageItem,
} from '@/types/jurisdiction'

const props = withDefaults(
  defineProps<{
    organizationId: string
    jurisdictionId: string
    isLoading?: boolean
    refreshKey?: number
  }>(),
  {
    isLoading: false,
    refreshKey: 0,
  },
)

const dataPage = ref<JurisdictionDataPage | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const requested = ref(false)
const selectedChangeKey = ref<string | null>(null)
const acceptingChangeId = ref<string | null>(null)
const creatingTicket = ref(false)

const router = useRouter()
const jurisdictionStore = useJurisdictionStore()
const ticketStore = useTicketStore()
const jurisdictionRef = computed(
  () => jurisdictionStore.jurisdictions.find((item) => item.id === props.jurisdictionId) || null,
)

const hasContext = computed(() => Boolean(props.organizationId && props.jurisdictionId))
const showSkeleton = computed(() => {
  if (props.isLoading) return true
  if (!hasContext.value) return false
  return !dataPage.value && (loading.value || !requested.value)
})
const showRefreshing = computed(() => !showSkeleton.value && loading.value)

const formatRelativeTime = (dateString?: string | null) => {
  if (!dateString) return 'Not available'
  const timestamp = new Date(dateString).getTime()
  if (Number.isNaN(timestamp)) return 'Not available'
  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(timestamp).toLocaleDateString()
}

const resolveKeyLabel = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (match) => match.toUpperCase())

const formatTitleCase = (value?: string | number | boolean | null) => {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ')
}

const extractedEntries = computed<Array<[string, string | number | boolean | null]>>(() => {
  if (!dataPage.value || dataPage.value.status !== 'available') return []
  const extracted = dataPage.value.extracted_data || {}
  const entries: Array<[string, string | number | boolean | null]> = []
  for (const [key, value] of Object.entries(extracted)) {
    if (value && typeof value === 'object' && 'canonical_value' in value) {
      entries.push([key, value.canonical_value ?? null])
      continue
    }
    entries.push([key, value as string | number | boolean | null])
  }
  return entries.filter(([, value]) => value !== null && value !== '')
})

const formatChangeValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.join(', ')
  if (value && typeof value === 'object') return JSON.stringify(value)
  return ''
}

const changeLines = computed<string[]>(() => {
  if (!dataPage.value || dataPage.value.status !== 'available') return []
  const changes = dataPage.value.changes || []
  const explicit = changes
    .map((change) => {
      if (typeof change === 'string') return change
      if (!change || typeof change !== 'object') return ''
      const obj = change as Record<string, unknown>
      return formatChangeValue(
        obj.summary ?? obj.description ?? obj.message ?? obj.detail ?? obj.text ?? '',
      )
    })
    .filter(Boolean)
  if (explicit.length) return explicit
  const detection = dataPage.value.change_detection || {}
  return Object.entries(detection).map(
    ([key, value]) => `${resolveKeyLabel(key)}: ${formatChangeValue(value)}`,
  )
})

const changeItems = computed<JurisdictionDataPageItem[]>(() => {
  if (!dataPage.value || dataPage.value.status !== 'available') return []
  const items = (dataPage.value.data_items || []) as JurisdictionDataPageItem[]
  const list = items.filter((item) => item.has_change)
  if (list.length) return list
  return changeLines.value.map((line, index) => {
    const change: JurisdictionDataPageItemChange = {
      change_description: line,
      old_value: null,
      new_value: null,
      detected_at: null,
    }
    return {
      field: `change_${index}`,
      value: line as string | number | boolean | null,
      has_change: true,
      change,
      change_index: index,
    } as JurisdictionDataPageItem
  })
})

const changeItemsByField = computed<Map<string, JurisdictionDataPageItem>>(() => {
  const map = new Map<string, JurisdictionDataPageItem>()
  for (const item of changeItems.value) {
    map.set(item.field, item)
  }
  return map
})

const displayEntries = computed<
  Array<{
    key: string
    value: string | number | boolean | null
    change: JurisdictionDataPageItem | null
  }>
>(() => {
  const entries = extractedEntries.value.map(([key, value]) => ({
    key,
    value,
    change: changeItemsByField.value.get(key) || null,
  }))

  const existingKeys = new Set(entries.map((entry) => entry.key))
  const fallbackChanges = changeItems.value.filter((item) => !existingKeys.has(item.field))
  for (const item of fallbackChanges) {
    entries.push({
      key: item.field,
      value: item.change?.new_value ?? item.value ?? null,
      change: item,
    })
  }
  return entries
})

const firstChangeIndex = computed(() => displayEntries.value.findIndex((entry) => entry.change))

const resolveChangeKey = (item: JurisdictionDataPageItem, index: number) => {
  const idx = typeof item.change_index === 'number' ? item.change_index : index
  const oldValue = item.change?.old_value ?? ''
  const newValue = item.change?.new_value ?? ''
  return `${item.field}-${idx}-${oldValue}-${newValue}`
}

const selectedChangeIndex = computed(() => {
  const list = changeItems.value
  if (!list.length || !selectedChangeKey.value) return 0
  const index = list.findIndex(
    (item, idx) => resolveChangeKey(item, idx) === selectedChangeKey.value,
  )
  return index >= 0 ? index : 0
})

const selectedChange = computed(() => {
  const list = changeItems.value
  if (!list.length) return null
  return list[selectedChangeIndex.value] || list[0]
})

const selectedChangeAccepted = computed(() =>
  Boolean(selectedChange.value?.change?.change_accepted),
)

const selectedChangeHasTicket = computed(() =>
  Boolean(selectedChange.value?.change?.ticket_created),
)

const isAcceptingSelectedChange = computed(
  () => selectedChange.value?.change?.change_id === acceptingChangeId.value,
)

const isPendingChange = (item: JurisdictionDataPageItem | null) =>
  Boolean(item?.has_change && !item?.change?.change_accepted)

const selectChangeItem = (item: JurisdictionDataPageItem | null) => {
  if (!item) return
  const index = Math.max(
    0,
    changeItems.value.findIndex((change) => change === item),
  )
  selectedChangeKey.value = resolveChangeKey(item, index)
}

const formatChangeDate = (dateString?: string | null) => {
  if (!dateString) return ''
  const timestamp = new Date(dateString)
  if (Number.isNaN(timestamp.getTime())) return ''
  return timestamp.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const markChangeAccepted = (changeId: string) => {
  if (!dataPage.value || dataPage.value.status !== 'available') return
  const updateItemChange = (item: JurisdictionDataPageItem) =>
    item?.change?.change_id === changeId
      ? { ...item, change: { ...item.change, change_accepted: true } }
      : item
  const updates = (dataPage.value.data_items || []).map(updateItemChange)
  const changes = (dataPage.value.changes || []).map((item) =>
    item &&
    typeof item === 'object' &&
    (item as JurisdictionDataPageItemChange).change_id === changeId
      ? { ...(item as JurisdictionDataPageItemChange), change_accepted: true }
      : item,
  )
  dataPage.value = {
    ...dataPage.value,
    data_items: updates,
    changes,
    has_unaccepted_changes: updates.some(
      (item) => item.has_change && !item.change?.change_accepted,
    ),
  }
}

const acceptSelectedChange = async () => {
  if (!selectedChange.value) return
  const changeId = selectedChange.value.change?.change_id
  if (!changeId) {
    toast.info('This change cannot be accepted yet.')
    return
  }
  if (!props.jurisdictionId) return
  if (acceptingChangeId.value === changeId || selectedChangeAccepted.value) return
  acceptingChangeId.value = changeId
  try {
    await jurisdictionApi.acceptChange(props.jurisdictionId, changeId)
    markChangeAccepted(changeId)
    toast.success('Change accepted')
  } catch (err) {
    console.error('Failed to accept jurisdiction change', err)
    toast.error('Could not accept this change. Please try again.')
  } finally {
    acceptingChangeId.value = null
  }
}

const lastUpdatedLabel = computed(() => {
  if (!dataPage.value?.last_updated) return ''
  return formatRelativeTime(dataPage.value.last_updated)
})

const normalizeDataPage = (payload: unknown): JurisdictionDataPage | null => {
  if (!payload || typeof payload !== 'object') return null
  const data = payload as Record<string, unknown>

  if (data.status === 'empty') {
    return {
      status: 'empty',
      message: (data.message as string) || 'No data available yet.',
      last_updated: null,
    }
  }

  if (data.status === 'available') {
    const normalized: JurisdictionDataPageAvailable = {
      status: 'available',
      last_updated: (data.last_updated as string) ?? '',
      summary: (data.summary as string) ?? null,
      markdown_content: (data.markdown_content as string) ?? null,
      extracted_data:
        (data.extracted_data as JurisdictionDataPageAvailable['extracted_data']) ?? null,
      confidence_score: (data.confidence_score as number) ?? null,
      changes: (data.changes as unknown[]) ?? [],
      data_items: (data.data_items as JurisdictionDataPageItem[]) ?? [],
      has_unaccepted_changes: (data.has_unaccepted_changes as boolean) ?? false,
      change_detection: (data.change_detection as Record<string, unknown>) ?? {},
      ...(typeof data.job_id === 'string' && { job_id: data.job_id }),
    }
    return normalized
  }

  return null
}

const ensureJurisdiction = async () => {
  if (jurisdictionRef.value || !props.jurisdictionId) return
  await jurisdictionStore.fetchOne(props.jurisdictionId, props.organizationId)
}

const handleCreateTicket = async () => {
  if (creatingTicket.value) return
  creatingTicket.value = true
  try {
    await ensureJurisdiction()
    const activeDataPage = dataPage.value
    const jobId =
      activeDataPage && activeDataPage.status === 'available' ? activeDataPage.job_id : null
    if (!props.organizationId || !props.jurisdictionId || !jobId) {
      toast.info('No jurisdiction scrape job is available for ticket creation yet.')
      return
    }
    const projectId = jurisdictionRef.value?.project_id
    const changeId = selectedChange.value?.change?.change_id
    const ticket = await ticketStore.createTicket(props.organizationId, {
      title: `Change detected: ${formatTitleCase(jurisdictionRef.value?.name) || 'Jurisdiction'}`,
      summary: 'A jurisdiction-level change was detected.',
      priority: 'medium',
      jurisdiction_id: props.jurisdictionId,
      jurisdiction_scrape_job_id: jobId,
      jurisdiction_change_id: changeId,
      project_id: projectId,
    })
    if (ticket) {
      toast.success('Ticket created from jurisdiction change')
      router.push({
        name: 'ticket-detail',
        params: { ticketId: ticket.id },
        query: { context: 'jurisdiction', contextId: props.jurisdictionId },
      })
    }
  } catch (err) {
    console.error('Failed to create ticket from data page', err)
    toast.error('Could not create a ticket right now. Please try again.')
  } finally {
    creatingTicket.value = false
  }
}

const handleViewTicket = async () => {
  if (!selectedChange.value) return
  if (!selectedChangeHasTicket.value) {
    await handleCreateTicket()
    return
  }
  await ensureJurisdiction()
  const ticketId = selectedChange.value.change?.ticket_id
  if (ticketId) {
    router.push({
      name: 'ticket-detail',
      params: { ticketId },
      query: { context: 'jurisdiction', contextId: props.jurisdictionId },
    })
    return
  }
  const changeId = selectedChange.value.change?.change_id
  if (!changeId || !props.jurisdictionId) {
    toast.info('No ticket details are available for this change yet.')
    return
  }
  const tickets = await ticketStore.fetchTicketsByContext('jurisdiction', props.jurisdictionId)
  const matching = tickets.find((ticket) => ticket.jurisdiction_change_id === changeId)
  if (matching) {
    router.push({
      name: 'ticket-detail',
      params: { ticketId: matching.id },
      query: { context: 'jurisdiction', contextId: props.jurisdictionId },
    })
    return
  }
  toast.info('No ticket details are available for this change yet.')
}

const fetchDataPage = async () => {
  if (!props.organizationId || !props.jurisdictionId) {
    requested.value = true
    loading.value = false
    return
  }
  requested.value = true
  loading.value = true
  error.value = null
  try {
    const res = await jurisdictionApi.getDataPage(props.organizationId, props.jurisdictionId)
    dataPage.value = normalizeDataPage(res.data?.data) ?? null
  } catch (err) {
    const apiErr = err as { response?: { data?: { message?: string; detail?: string } } }
    error.value =
      apiErr.response?.data?.message || apiErr.response?.data?.detail || 'Failed to load'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.organizationId, props.jurisdictionId],
  ([orgId, jurisdictionId], previous) => {
    const [prevOrgId, prevJurisdictionId] = previous ?? []
    if (!orgId || !jurisdictionId) {
      dataPage.value = null
      requested.value = true
      loading.value = false
      return
    }
    if (orgId !== prevOrgId || jurisdictionId !== prevJurisdictionId) {
      dataPage.value = null
    }
    fetchDataPage()
  },
  { immediate: true },
)

watch(
  () => props.refreshKey,
  (value, previous) => {
    if (value === previous) return
    fetchDataPage()
  },
)

watch(
  changeItems,
  (items) => {
    if (!items.length) {
      selectedChangeKey.value = null
      return
    }
    const firstItem = items[0]
    if (!firstItem) return
    const fallbackKey = resolveChangeKey(firstItem, 0)
    const hasSelection = items.some(
      (item, index) => resolveChangeKey(item, index) === selectedChangeKey.value,
    )
    if (!selectedChangeKey.value || !hasSelection) {
      selectedChangeKey.value = fallbackKey
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-foreground text-base font-semibold">Data page</p>
        <p v-if="showRefreshing" class="text-muted text-xs">Refreshing...</p>
      </div>
      <p v-if="lastUpdatedLabel" class="text-muted text-xs">Last updated: {{ lastUpdatedLabel }}</p>
    </div>

    <div v-if="showSkeleton" class="space-y-4">
      <div class="skeleton-line h-5 w-40"></div>
      <div class="skeleton-line h-4 w-64"></div>
      <div class="skeleton-line h-40 w-full rounded-2xl"></div>
      <div class="grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <div class="skeleton-line h-56 w-full rounded-2xl"></div>
        <div class="skeleton-line h-40 w-full rounded-2xl"></div>
      </div>
    </div>

    <div
      v-else-if="!hasContext"
      class="text-muted bg-muted-background rounded-lg px-4 py-3 text-sm"
    >
      Organization context missing. Return to the project and reopen this jurisdiction.
    </div>

    <div v-else-if="error" class="text-error bg-error-background rounded-lg px-4 py-3 text-sm">
      {{ error }}
    </div>

    <div v-else-if="dataPage?.status === 'empty'" class="single-project-empty-card border-dashed">
      <div class="single-project-empty-icon">
        <File :size="30" :absolute-stroke-width="true" />
      </div>
      <p class="text-preset-label-lg text-foreground">No data available yet</p>
      <p class="text-muted text-preset-body-sm mt-1 max-w-155">
        {{ dataPage.message || 'We are still consolidating data for this jurisdiction.' }}
      </p>
    </div>

    <div v-else-if="dataPage?.status === 'available'" class="space-y-6">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <div class="space-y-4 lg:col-span-2">
          <div
            v-if="displayEntries.length"
            class="border-border bg-background rounded-2xl border p-4"
          >
            <ul class="divide-y">
              <template v-for="(entry, index) in displayEntries" :key="entry.key">
                <li v-if="index === firstChangeIndex" class="px-3 pt-1 pb-2">
                  <p class="text-muted text-xs font-semibold tracking-wide uppercase">
                    Changes detected
                  </p>
                </li>
                <li class="relative">
                  <button
                    type="button"
                    class="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition"
                    :class="
                      isPendingChange(entry.change)
                        ? 'bg-amber-50/70 hover:bg-transparent'
                        : 'hover:bg-muted-background/60'
                    "
                    @click="selectChangeItem(entry.change)"
                  >
                    <span
                      class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      :class="entry.change ? 'bg-amber-500' : 'bg-gray-300'"
                    ></span>
                    <span class="min-w-0">
                      <span class="text-foreground text-sm font-medium">
                        {{ resolveKeyLabel(entry.key) }}
                      </span>
                      <span class="text-muted block text-sm">
                        {{ entry.value ?? 'Not available' }}
                      </span>
                    </span>
                  </button>
                  <div
                    v-if="selectedChange && entry.change && selectedChange.field === entry.key"
                    class="bg-background z-100 mt-3 space-y-3 px-2 lg:absolute lg:top-12 lg:left-[calc(100%-350px)] lg:mt-3 lg:w-[320px]"
                  >
                    <div
                      class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                    >
                      <p class="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
                        Updated Change
                      </p>
                      <p class="mt-2 text-sm">
                        {{
                          formatTitleCase(
                            selectedChange.change?.change_description || selectedChange.value,
                          )
                        }}
                      </p>
                      <div class="mt-3 border-t border-emerald-200 pt-3 text-xs text-emerald-700">
                        <p>
                          Change detected on
                          {{
                            formatChangeDate(selectedChange.change?.detected_at) ||
                            lastUpdatedLabel ||
                            'Not available'
                          }}
                        </p>
                        <p v-if="selectedChange.change?.field">
                          {{ resolveKeyLabel(selectedChange.change.field) }}
                        </p>
                      </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="btn--default btn--sm"
                        :disabled="
                          !selectedChange ||
                          selectedChangeAccepted ||
                          isAcceptingSelectedChange ||
                          !selectedChange.change?.change_id
                        "
                        @click="acceptSelectedChange"
                      >
                        {{
                          selectedChangeAccepted
                            ? 'Accepted'
                            : isAcceptingSelectedChange
                              ? 'Accepting...'
                              : 'Accept Changes'
                        }}
                      </button>
                      <button
                        type="button"
                        class="btn--secondary btn--sm"
                        :disabled="creatingTicket"
                        @click="handleViewTicket"
                      >
                        {{
                          creatingTicket
                            ? 'Creating Ticket...'
                            : selectedChangeHasTicket
                              ? 'View Ticket'
                              : 'Create Ticket'
                        }}
                      </button>
                    </div>
                  </div>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
