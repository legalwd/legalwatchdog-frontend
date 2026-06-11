<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { ref, onMounted, watch } from 'vue'
import { toast } from 'vue-sonner'

import { sourceApi } from '@/api/source'
import { useSourceStore } from '@/stores/source-store'
import type { SuggestedSource, SuggestSourcesRequest } from '@/types/source'

const props = defineProps<{
  jurisdictionId: string
  jurisdictionName: string
  jurisdictionDescription: string
  projectDescription: string
  jurisdictionPrompt?: string | null
  searchQuery?: string
  searchNonce?: number
}>()

const emit = defineEmits<{
  (e: 'cancel' | 'sources-added'): void
  (e: 'save', count: number): void
  (e: 'loading', value: boolean): void
}>()

const sourceStore = useSourceStore()
interface DisplaySource extends SuggestedSource {
  id: number
  adding: boolean
  added: boolean
}

const suggestions = ref<DisplaySource[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 2
let idCounter = 1
const normalizeUrl = (url: string) => url.trim().toLowerCase().replace(/\/*$/, '')

const mapToDisplay = (s: SuggestedSource): DisplaySource => {
  const existing = sourceStore.sources.find((src) => normalizeUrl(src.url) === normalizeUrl(s.url))

  return {
    ...s,
    id: idCounter++,
    adding: false,
    added: Boolean(existing),
  }
}

const loadSuggestions = async (attempt = 1): Promise<void> => {
  if (!props.searchQuery) {
    error.value = 'Please provide a search query to find sources.'
    loading.value = false
    return
  }

  const payload: SuggestSourcesRequest = {
    search_query: props.searchQuery,
    ...(props.jurisdictionName && { jurisdiction_name: props.jurisdictionName }),
    ...(props.jurisdictionDescription && {
      jurisdiction_description: props.jurisdictionDescription,
    }),
    ...(props.projectDescription && { project_description: props.projectDescription }),
    ...(props.jurisdictionPrompt && { jurisdiction_prompt: props.jurisdictionPrompt }),
  }

  try {
    const res = await sourceApi.suggest(payload)
    const sources = res.data?.data?.sources || []

    if (sources.length === 0 && attempt <= maxRetries) throw new Error('empty')

    suggestions.value = sources.map((s: SuggestedSource) => mapToDisplay(s))
    error.value = null
  } catch (err) {
    if (attempt <= maxRetries) {
      retryCount.value = attempt
      setTimeout(() => loadSuggestions(attempt + 1), attempt * 3000)
      return
    }
    error.value = 'AI could not find reliable sources right now. Please try again later.'
    console.error('Failed to load suggestions', err)
  } finally {
    if (attempt > maxRetries || suggestions.value.length > 0) {
      loading.value = false
    }
  }
}

const addSuggestion = async (item: DisplaySource) => {
  if (item.adding) return

  item.adding = true

  try {
    await sourceApi.acceptSuggestions({
      jurisdiction_id: props.jurisdictionId,
      source_type: 'web',
      scrape_frequency: 'DAILY',
      suggested_sources: [
        {
          title: item.title,
          url: item.url,
          snippet: item.snippet,
          confidence_reason: item.confidence_reason,
          is_official: item.is_official,
        },
      ],
    })

    emit('sources-added')
    toast.success(`"${item.title}" added and will be monitored.`)

    // Mark as added instead of removing from list
    item.added = true
    item.adding = false
  } catch (err) {
    const message =
      typeof err === 'object' && err && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : err instanceof Error
          ? err.message
          : null

    toast.error(message || 'Failed to add source')
    item.adding = false
  }
}

onMounted(() => {
  loadSuggestions()
})

watch(
  () => [props.searchQuery, props.searchNonce, props.jurisdictionId],
  () => {
    if (!props.searchQuery || !props.jurisdictionId) return
    loading.value = true
    error.value = null
    retryCount.value = 0
    loadSuggestions()
  },
  { immediate: false },
)

watch(
  loading,
  (value) => {
    emit('loading', value)
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col">
    <div v-if="error" class="text-error bg-error-background rounded-lg px-4 py-3 text-sm">
      {{ error }}
    </div>

    <div v-if="loading" class="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <Loader2 class="text-muted h-8 w-8 animate-spin" />
      <p class="text-foreground text-sm font-medium">AI is researching official sources…</p>
      <p v-if="retryCount > 0" class="text-muted text-xs">
        Attempt {{ retryCount + 1 }} of {{ maxRetries + 1 }}…
      </p>
      <p class="text-muted text-xs">This can take up to 90 seconds for complex jurisdictions.</p>
    </div>

    <div v-else-if="suggestions.length > 0" class="divide-border divide-y">
      <div
        v-for="item in suggestions"
        :key="item.id"
        class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0 space-y-1">
          <p class="text-foreground wrap-break-words text-sm font-semibold">
            {{ item.title }}
          </p>
          <p class="text-muted text-xs break-all">{{ item.url }}</p>
          <p class="text-muted text-xs">{{ item.snippet }}</p>
        </div>

        <button
          class="inline-flex min-w-20 items-center justify-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition"
          :class="
            item.added
              ? 'bg-success-background text-success cursor-not-allowed'
              : item.adding
                ? 'bg-muted-background text-muted cursor-wait'
                : 'border-border text-foreground hover:bg-muted-background border'
          "
          :disabled="item.adding || item.added"
          @click="addSuggestion(item)"
        >
          <Loader2 v-if="item.adding" class="h-3 w-3 animate-spin" />
          <span v-else>{{ item.added ? 'Added' : 'Add' }}</span>
        </button>
      </div>
    </div>

    <div v-else class="text-muted px-6 py-10 text-center text-sm">
      No suggestions generated. Try adjusting your search query.
    </div>
  </div>
</template>
