<script setup lang="ts">
import { ArrowLeft, ArrowRight, Plus, Search, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

import searchSourcesImage from '@/assets/images/world-search-icon.png'
import type { Source } from '@/types/source'
import SuggestedSources from '@/views/dashboard/jurisdictions/sources/SuggestedSources.vue'

const props = defineProps<{
  sources: Source[]
  sourcesLoading: boolean
  sourcesError: string | null
  jurisdictionId: string
  jurisdictionName: string
  jurisdictionDescription: string
  projectDescription: string
  jurisdictionPrompt?: string | null
}>()

const emit = defineEmits<{
  (e: 'add-manual' | 'sources-added'): void
  (e: 'delete', source: Source): void
}>()

const searchQuery = ref('')
const submittedQuery = ref('')
const searchExpanded = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const pageSize = 5
const currentPage = ref(1)
const showSuggestionsOpen = ref(false)
const searchNonce = ref(0)
const isSearching = ref(false)

const hasSources = computed(() => props.sources.length > 0)
const showSuggestions = computed(() => Boolean(submittedQuery.value))
const showEmptyState = computed(() => !props.sourcesLoading && !hasSources.value)
const showSearchButton = computed(() => searchExpanded.value)
const totalPages = computed(() => Math.max(1, Math.ceil(props.sources.length / pageSize)))
const hasPrev = computed(() => currentPage.value > 1)
const hasNext = computed(() => currentPage.value < totalPages.value)
const paginatedSources = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return props.sources.slice(start, start + pageSize)
})

const paginationItems = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const items: Array<number | 'ellipsis'> = []
  items.push(1)

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) items.push('ellipsis')

  for (let i = start; i <= end; i += 1) {
    items.push(i)
  }

  if (end < total - 1) items.push('ellipsis')

  items.push(total)
  return items
})

const handleAddManual = () => emit('add-manual')

const submitSearch = () => {
  if (isSearching.value) return
  const trimmed = searchQuery.value.trim()
  if (!trimmed) return
  searchExpanded.value = true
  submittedQuery.value = trimmed
  showSuggestionsOpen.value = true
  searchNonce.value += 1
  isSearching.value = true
}

const hideSuggestions = () => {
  searchExpanded.value = false
  showSuggestionsOpen.value = false
}

const handleSourcesAdded = () => {
  emit('sources-added')
}

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
}

const nextPage = () => {
  if (!hasNext.value) return
  currentPage.value += 1
}

const prevPage = () => {
  if (!hasPrev.value) return
  currentPage.value -= 1
}

watch(
  () => props.sources.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  },
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <h3 class="text-foreground text-base font-semibold">Data Sources</h3>
        <span v-if="hasSources" class="text-muted text-sm">({{ sources.length }})</span>
      </div>
      <button class="btn--default btn--with-icon btn--sm" @click="handleAddManual">
        <Plus :size="16" />
        Add Source URL
      </button>
    </div>

    <div class="space-y-6">
      <div v-if="sourcesError" class="text-error bg-error-background rounded-lg px-4 py-3 text-sm">
        {{ sourcesError }}
      </div>

      <div v-if="sourcesLoading" class="border-border bg-background rounded-2xl border shadow-sm">
        <div
          v-for="n in 3"
          :key="`source-skeleton-${n}`"
          class="border-border flex items-start justify-between gap-4 border-b px-5 py-4 last:border-b-0"
        >
          <div class="min-w-0 space-y-2">
            <div class="skeleton-line h-4 w-72"></div>
            <div class="skeleton-line h-3 w-40"></div>
          </div>
          <div class="skeleton-line h-6 w-6 rounded-full"></div>
        </div>
      </div>

      <div v-else-if="showEmptyState" class="single-project-empty-card border-dashed">
        <div class="single-project-empty-icon border-0">
          <img :src="searchSourcesImage" alt="Search sources" />
        </div>
        <h4 class="text-preset-label-lg text-foreground">No Sources Added</h4>
        <p class="text-muted text-preset-body-sm mt-1 max-w-155">
          Start building your monitor by searching our database of verified regulatory bodies or by
          pasting a direct URL to a specific legal page.
        </p>
      </div>

      <div v-else-if="hasSources" class="border-border bg-background rounded-2xl border shadow-sm">
        <div
          v-for="source in paginatedSources"
          :key="source.id"
          class="border-border flex items-start justify-between gap-4 border-b px-5 py-4 last:border-b-0"
        >
          <div class="min-w-0 space-y-1">
            <p class="text-foreground text-sm font-semibold break-all">
              {{ source.url }}
            </p>
            <p class="text-muted text-xs">{{ source.name }}</p>
          </div>
          <button
            class="text-muted hover:bg-muted-background hover:text-foreground rounded-full p-1 transition"
            @click="emit('delete', source)"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <div
        v-if="hasSources && totalPages > 1"
        class="flex flex-wrap items-center justify-between gap-4"
      >
        <button
          class="btn--secondary btn--sm flex items-center gap-2"
          type="button"
          :disabled="!hasPrev"
          @click="prevPage"
        >
          <ArrowLeft :size="14" />
          Previous
        </button>

        <div class="flex items-center gap-2">
          <button
            v-for="(item, index) in paginationItems"
            :key="`page-${item}-${index}`"
            type="button"
            class="cursor-pointer text-sm"
            :class="
              item === 'ellipsis'
                ? 'text-muted cursor-default px-2'
                : item === currentPage
                  ? 'bg-muted/20 text-foreground rounded-full px-3 py-1 font-semibold'
                  : 'text-muted hover:text-foreground hover:bg-muted/10 rounded-full px-3 py-1'
            "
            :disabled="item === 'ellipsis'"
            @click="typeof item === 'number' && goToPage(item)"
          >
            {{ item === 'ellipsis' ? '…' : item }}
          </button>
        </div>

        <button
          class="btn--secondary btn--sm flex items-center gap-2"
          type="button"
          :disabled="!hasNext"
          @click="nextPage"
        >
          Next
          <ArrowRight :size="14" />
        </button>
      </div>

      <div :class="searchExpanded ? 'flex flex-col gap-3' : 'flex flex-col items-center gap-3'">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            class="relative flex-1 transition-all duration-300"
            :class="searchExpanded ? 'sm:flex-1' : 'sm:max-w-96'"
          >
            <Search :size="16" class="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              name="search prompt"
              type="text"
              placeholder="Search for sources"
              class="border-border bg-background text-foreground placeholder:text-muted focus:border-primary focus:ring-accent/20 h-10 w-full rounded-md border px-4 pl-10 text-sm focus:ring-2 focus:outline-none"
              @focus="searchExpanded = true"
              @keydown.enter.prevent="submitSearch"
            />
            <button
              v-if="searchExpanded"
              type="button"
              class="text-muted hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition"
              @click="hideSuggestions"
            >
              <X :size="16" />
            </button>
          </div>
          <button
            v-show="showSearchButton"
            class="btn--default btn--sm"
            :disabled="isSearching"
            @mousedown.prevent
            @click="submitSearch"
          >
            Search
          </button>
        </div>
      </div>

      <div
        v-if="showSuggestions"
        v-show="showSuggestionsOpen"
        class="border-border bg-background rounded-2xl border"
      >
        <SuggestedSources
          :jurisdiction-id="jurisdictionId"
          :jurisdiction-name="jurisdictionName"
          :jurisdiction-description="jurisdictionDescription"
          :project-description="projectDescription"
          :jurisdiction-prompt="jurisdictionPrompt ?? null"
          :search-query="submittedQuery"
          :search-nonce="searchNonce"
          @sources-added="handleSourcesAdded"
          @loading="isSearching = $event"
        />
      </div>
    </div>
  </div>
</template>
