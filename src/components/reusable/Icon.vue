<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    icon: unknown
    altIcon?: unknown
    showAlt?: boolean
    size?: number
    color?: string
    strokeWidth?: number
  }>(),
  {
    altIcon: () => ({}),
    showAlt: false,
    size: 16,
    color: 'white',
    strokeWidth: 1.5,
  },
)

const renderedIcon = computed(() => (props.showAlt && props.altIcon ? props.altIcon : props.icon))
</script>

<template>
  <HugeiconsIcon
    :icon="renderedIcon"
    :size="props.size"
    :color="props.color"
    :stroke-width="props.strokeWidth"
    v-bind="$attrs"
  />
</template>
