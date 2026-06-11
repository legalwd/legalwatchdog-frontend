<script setup lang="ts">
import { computed } from 'vue'

import type { SourceRevision } from '@/types/source'

const props = defineProps<{
  revision: SourceRevision | null
  ticketForRevision?: (revisionId: string | undefined) => unknown
}>()

const emit = defineEmits<{
  (e: 'open-ticket', payload: { revision: SourceRevision | null }): void
}>()

const hasTicket = computed(() =>
  props.revision?.id && props.ticketForRevision
    ? Boolean(props.ticketForRevision(props.revision.id))
    : false,
)

const handleClick = () => emit('open-ticket', { revision: props.revision })
</script>

<template>
  <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-xs text-gray-500">Change detected. Create or open a ticket to collaborate.</p>
    <button class="btn--default btn--sm" @click="handleClick">
      {{ hasTicket ? 'View ticket' : 'Open ticket' }}
    </button>
  </div>
</template>
