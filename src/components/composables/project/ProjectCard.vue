<script setup lang="ts">
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  // EllipsisVertical,
  TriangleAlert,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

import type { Project } from '@/types/project'

type ChangeSeverity = 'none' | 'minor' | 'major'

interface Props {
  project?: Project | undefined
  revisionCount?: number
  isLoading?: boolean
  changeSeverity?: ChangeSeverity
  changeCount?: number
  lastChangeLabel?: string
  changeItems?: string[]
  showChangeDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  project: undefined,
  revisionCount: 0,
  isLoading: false,
  changeSeverity: 'none',
  changeCount: 0,
  lastChangeLabel: '',
  changeItems: () => [],
  showChangeDetails: false,
})

const emit = defineEmits<{
  click: []
  'menu-click': [event: MouseEvent]
}>()

const displayTitle = computed(() => props.project?.title || 'Project Name')

const displayDescription = computed(() => {
  return props.project?.description || 'Track regulatory changes across jurisdictions.'
})

const resolveChangeCount = computed(() => props.changeCount ?? props.revisionCount ?? 0)
const hasChangeItems = computed(() => props.changeItems.length > 0)

const resolveChangeSeverity = computed<ChangeSeverity>(() => {
  if (props.changeSeverity) return props.changeSeverity
  if (resolveChangeCount.value === 0) return 'none'
  return resolveChangeCount.value >= 3 ? 'major' : 'minor'
})

const displayLastChange = computed(() => {
  const label = props.lastChangeLabel?.trim()
  if (label) return label
  return 'Not available'
})

const statusConfig = computed(() => {
  const count = resolveChangeCount.value
  const plural = count === 1 ? '' : 's'
  if (resolveChangeSeverity.value === 'major') {
    return {
      label: `${count} Major change${plural} detected`,
      icon: AlertCircle,
      className: 'project-status project-status--major',
      iconClass: 'text-error',
    }
  }
  if (resolveChangeSeverity.value === 'minor') {
    return {
      label: `${count} Minor change${plural} detected`,
      icon: TriangleAlert,
      className: 'project-status project-status--minor',
      iconClass: 'text-yellow-700',
    }
  }
  return {
    label: 'No changes',
    icon: CheckCircle,
    className: 'project-status project-status--success',
    iconClass: 'text-success',
  }
})

const isExpanded = ref(props.showChangeDetails)

watch(
  () => props.showChangeDetails,
  (value) => {
    isExpanded.value = value
  },
)

const toggleExpanded = () => {
  if (!hasChangeItems.value || props.isLoading) return
  isExpanded.value = !isExpanded.value
}

// const handleMenuClick = (event: MouseEvent) => {
//   event.stopPropagation()
//   emit('menu-click', event)
// }
</script>

<template>
  <div
    class="project-card"
    :class="{ 'cursor-wait opacity-60': isLoading }"
    @click="!isLoading && emit('click')"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1 space-y-3">
        <div v-if="isLoading" class="space-y-2">
          <div class="skeleton-line h-5 w-2/3"></div>
          <div class="skeleton-line h-4 w-5/6"></div>
          <div class="skeleton-line h-4 w-4/6"></div>
        </div>
        <div v-else class="space-y-2">
          <h3 class="project-card__title line-clamp-2">{{ displayTitle }}</h3>
          <p class="project-card__description line-clamp-3">
            {{ displayDescription }}
          </p>
        </div>
      </div>

      <!-- <button
        class="btn btn--icon-only btn--default p-2"
        aria-label="More options"
        :disabled="isLoading"
        @click="handleMenuClick"
      >
        <EllipsisVertical class="h-5 w-5" />
      </button> -->
    </div>

    <div class="mt-5 space-y-2">
      <div v-if="isLoading" class="skeleton-line h-9 w-full"></div>
      <button
        v-else
        type="button"
        :class="[statusConfig.className, hasChangeItems ? 'project-status--interactive' : '']"
        :disabled="!hasChangeItems"
        :aria-expanded="hasChangeItems ? isExpanded : undefined"
        @click.stop="toggleExpanded"
      >
        <span class="flex items-center gap-2">
          <component :is="statusConfig.icon" class="h-4 w-4" :class="statusConfig.iconClass" />
          <span>{{ statusConfig.label }}</span>
        </span>
        <span v-if="hasChangeItems" class="project-change-toggle">
          <component :is="isExpanded ? ChevronUp : ChevronDown" class="h-4 w-4" />
          <span class="sr-only">Toggle change details</span>
        </span>
      </button>

      <div v-if="hasChangeItems && isExpanded" class="project-change-list">
        <ul class="text-muted list-disc space-y-2 pl-5 text-sm">
          <li v-for="item in changeItems" :key="item">{{ item }}</li>
        </ul>
        <button type="button" class="project-change-link" @click.stop="emit('click')">
          Open project to view all changes
        </button>
      </div>

      <div v-if="isLoading" class="skeleton-line h-4 w-1/2"></div>
      <p v-else class="text-muted text-sm">
        Last Change: <span class="text-foreground">{{ displayLastChange }}</span>
      </p>
    </div>
  </div>
</template>
