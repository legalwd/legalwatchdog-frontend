<script setup lang="ts">
import { Search, TriangleAlert, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import type { Jurisdiction } from '@/api/jurisdiction'
import { useJurisdictionStore } from '@/stores/jurisdiction-store'
import SuggestedSources from '@/views/dashboard/jurisdictions/sources/SuggestedSources.vue'

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

const emit = defineEmits<{
  (e: 'update:jurisdiction', value: Jurisdiction): void
  (e: 'complete'): void
}>()

const jurisdictionStore = useJurisdictionStore()

const instruction = ref('')
const originalInstruction = ref('')
const instructionSaving = ref(false)
const searchQuery = ref('')
const submittedQuery = ref('')
const searchExpanded = ref(false)
const showSuggestionsOpen = ref(false)
const searchNonce = ref(0)
const isSearching = ref(false)

const isInstructionValid = computed(() => instruction.value.trim().length > 0)
const isInstructionSaved = computed(() => {
  const current = instruction.value.trim()
  return current.length > 0 && current === originalInstruction.value.trim()
})
const showSearchButton = computed(() => searchExpanded.value)

watch(
  () => props.jurisdiction,
  (value) => {
    const prompt = value?.prompt || ''
    instruction.value = prompt
    originalInstruction.value = prompt
  },
  { immediate: true },
)

const persistInstruction = async (notify = true) => {
  if (!props.jurisdiction?.id) return false
  const prompt = instruction.value.trim()
  if (!prompt) {
    toast.error('Jurisdiction instruction is required')
    return false
  }

  instructionSaving.value = true
  try {
    const updated = await jurisdictionStore.updateJurisdiction(
      props.jurisdiction.id,
      { prompt },
      props.activeOrganizationId,
    )

    if (updated) {
      emit('update:jurisdiction', updated)
      if (notify) toast.success('Jurisdiction instruction updated')
      originalInstruction.value = instruction.value.trim()
      return true
    }

    if (jurisdictionStore.error) {
      toast.error(jurisdictionStore.error)
    }
  } catch (err) {
    console.error(err)
    toast.error(jurisdictionStore.error || 'Failed to update jurisdiction instruction')
  } finally {
    instructionSaving.value = false
  }

  return false
}

const handleSaveInstruction = async () => {
  await persistInstruction()
}

const submitSearch = () => {
  if (isSearching.value) return
  const trimmed = searchQuery.value.trim()
  if (!trimmed) {
    toast.error('Enter a search query to find sources')
    return
  }
  submittedQuery.value = trimmed
  showSuggestionsOpen.value = true
  searchNonce.value += 1
  isSearching.value = true
}

const hideSuggestions = () => {
  searchExpanded.value = false
  showSuggestionsOpen.value = false
}

const handleFinish = async () => {
  const instructionSaved = await persistInstruction(false)
  if (!instructionSaved) return
  emit('complete')
}
</script>

<template>
  <section class="bg-background rounded-2xl shadow-sm ring-1 ring-gray-100">
    <div class="border-b border-gray-100 px-6 py-5">
      <p class="text-sm font-medium text-gray-600">There are two things to be done:</p>
    </div>

    <div class="space-y-10 px-6 py-8">
      <div class="flex gap-5">
        <div class="flex flex-col items-center">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full border border-[#F6D7B8] bg-[#FFF3E7] text-sm font-semibold text-gray-900"
          >
            1
          </div>
          <div class="mt-3 h-full w-px bg-gray-200"></div>
        </div>

        <div class="flex-1 space-y-3">
          <h3 class="text-lg font-semibold text-gray-900">Write Instructions</h3>
          <p class="text-sm text-gray-500">
            Tell our AI what to look for. Your instructions will guide how the Watchdog analyzes
            changes and prioritizes the alerts you receive.
          </p>
          <textarea
            v-model="instruction"
            rows="5"
            class="focus:border-accent-main focus:ring-accent-main/20 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:outline-none"
            placeholder="e.g., Monitor for any changes regarding data privacy, specifically under Section 4."
            :disabled="props.isLoading || instructionSaving"
          ></textarea>
          <button
            type="button"
            class="btn--secondary btn--sm"
            :disabled="props.isLoading || instructionSaving"
            @click="handleSaveInstruction"
          >
            {{ instructionSaving ? 'Saving...' : 'Save Instruction' }}
          </button>
        </div>
      </div>

      <div class="flex gap-5">
        <div class="flex flex-col items-center">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full border border-[#F6D7B8] bg-[#FFF3E7] text-sm font-semibold text-gray-900"
          >
            2
          </div>
        </div>

        <div class="flex-1 space-y-3">
          <h3 class="text-lg font-semibold text-gray-900">Suggested Sources</h3>
          <div
            v-if="!isInstructionSaved"
            class="flex items-end gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
            role="alert"
          >
            <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" />
            <span>Save your instructions to unlock source search.</span>
          </div>
          <p class="text-sm text-gray-500">
            Search our verified library of regulatory portals and add sources directly to this
            jurisdiction.
          </p>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              class="relative flex-1 transition-all duration-300"
              :class="searchExpanded ? 'sm:flex-1' : 'sm:max-w-96'"
            >
              <Search :size="16" class="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                name="search prompt"
                type="text"
                placeholder="Search for sources"
                class="border-border bg-background text-foreground placeholder:text-muted focus:border-primary focus:ring-accent/20 h-10 w-full rounded-md border px-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                :disabled="props.isLoading || !isInstructionSaved"
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
              :disabled="props.isLoading || !isInstructionSaved || isSearching"
              @mousedown.prevent
              @click="submitSearch"
            >
              Search
            </button>
          </div>
          <div
            v-if="submittedQuery && props.jurisdiction?.id"
            v-show="showSuggestionsOpen"
            class="border-border bg-background rounded-2xl border"
          >
            <SuggestedSources
              :jurisdiction-id="props.jurisdiction.id"
              :jurisdiction-name="props.jurisdiction.name || ''"
              :jurisdiction-description="props.jurisdiction.description || ''"
              project-description=""
              :jurisdiction-prompt="props.jurisdiction.prompt || null"
              :search-query="submittedQuery"
              :search-nonce="searchNonce"
              @loading="isSearching = $event"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          class="btn--default btn--md"
          :disabled="props.isLoading || instructionSaving || !isInstructionValid"
          @click="handleFinish"
        >
          Finish &amp; Start Monitoring
        </button>
      </div>
    </div>
  </section>
</template>
