<script setup lang="ts">
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, TriangleAlert } from 'lucide-vue-next'
import { computed } from 'vue'

type ChangeSeverity = 'none' | 'minor' | 'major'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string | null
    lastChangeLabel?: string
    changeCount?: number
    changeItems?: string[]
    changeSeverity?: ChangeSeverity
    expanded?: boolean
    indent?: number
    isLoading?: boolean
  }>(),
  {
    description: '',
    lastChangeLabel: 'Not available',
    changeCount: 0,
    changeItems: () => [],
    changeSeverity: 'none',
    expanded: false,
    indent: 0,
    isLoading: false,
  },
)

const emit = defineEmits<{
  (e: 'click' | 'toggle'): void
}>()

const hasChanges = computed(() => props.changeCount > 0)
const isInteractive = computed(() => !props.isLoading)
const statusLabel = computed(() => {
  if (!hasChanges.value) return 'No changes detected'
  const count = props.changeCount
  const plural = count === 1 ? '' : 's'
  if (props.changeSeverity === 'minor') {
    return `${count} Minor change${plural} detected`
  }
  return `${count} Major change${plural} detected`
})

const statusClass = computed(() =>
  hasChanges.value
    ? props.changeSeverity === 'minor'
      ? 'single-project-jurisdiction-status--minor'
      : 'single-project-jurisdiction-status--major'
    : 'single-project-jurisdiction-status--clear',
)

const hasChangeItems = computed(() => props.changeItems.length > 0)
</script>

<template>
  <div
    class="single-project-jurisdiction-row"
    :style="indent ? { paddingLeft: `${indent + 24}px` } : undefined"
  >
    <button
      type="button"
      class="single-project-jurisdiction-item"
      :disabled="!isInteractive"
      @click="isInteractive && emit('click')"
    >
      <div class="space-y-3 text-left">
        <div v-if="isLoading" class="space-y-2">
          <div class="skeleton-line h-5 w-48"></div>
          <div class="skeleton-line h-4 w-72"></div>
        </div>
        <div v-else class="space-y-1">
          <h3 class="single-project-jurisdiction-title">{{ title }}</h3>
          <p class="single-project-jurisdiction-description">{{ description }}</p>
        </div>
        <div v-if="isLoading" class="skeleton-line h-4 w-40"></div>
        <p v-else class="single-project-jurisdiction-meta">Last change: {{ lastChangeLabel }}</p>
      </div>
    </button>

    <button
      type="button"
      class="single-project-jurisdiction-status mt-4 sm:mt-0"
      :class="statusClass"
      :disabled="!hasChangeItems || !isInteractive"
      @click.stop="isInteractive && emit('toggle')"
    >
      <div v-if="isLoading" class="skeleton-line h-4 w-28"></div>
      <template v-else>
        <AlertCircle v-if="hasChanges && props.changeSeverity === 'major'" class="h-4 w-4" />
        <TriangleAlert v-else-if="hasChanges && props.changeSeverity === 'minor'" class="h-4 w-4" />
        <CheckCircle v-else class="h-4 w-4" />
        <span>{{ statusLabel }}</span>
        <ChevronUp v-if="hasChanges && expanded" class="h-4 w-4 opacity-70" />
        <ChevronDown v-else-if="hasChanges" class="h-4 w-4 opacity-70" />
      </template>
    </button>
  </div>

  <div v-if="expanded && hasChangeItems" class="single-project-jurisdiction-revisions">
    <ul class="text-muted space-y-2 text-sm">
      <li v-for="(item, index) in changeItems" :key="`${item}-${index}`">{{ item }}</li>
    </ul>
  </div>
</template>
