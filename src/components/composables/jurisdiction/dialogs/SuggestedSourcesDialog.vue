<script setup lang="ts">
import { computed } from 'vue'

import {
  Dialog,
  DialogDescription,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import SuggestedSources from '@/views/dashboard/jurisdictions/sources/SuggestedSources.vue'

const props = defineProps<{
  open: boolean
  jurisdictionId: string
  jurisdictionName: string
  jurisdictionDescription: string
  projectDescription: string
  jurisdictionPrompt?: string | null
  searchQuery?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'sources-added'): void
}>()

// Build props object conditionally to avoid passing undefined
const suggestedSourcesProps = computed(() => ({
  jurisdictionId: props.jurisdictionId,
  jurisdictionName: props.jurisdictionName,
  jurisdictionDescription: props.jurisdictionDescription,
  projectDescription: props.projectDescription,
  ...(props.jurisdictionPrompt !== undefined
    ? { jurisdictionPrompt: props.jurisdictionPrompt }
    : {}),
  ...(props.searchQuery !== undefined ? { searchQuery: props.searchQuery } : {}),
}))
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogScrollContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>AI Suggested Sources</DialogTitle>
        <DialogDescription>
          Review and add AI suggested sources. Sources are added instantly when you click "Add".
        </DialogDescription>
      </DialogHeader>
      <SuggestedSources v-bind="suggestedSourcesProps" @sources-added="emit('sources-added')" />
    </DialogScrollContent>
  </Dialog>
</template>
