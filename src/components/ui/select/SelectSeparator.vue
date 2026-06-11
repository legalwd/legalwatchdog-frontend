<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { SelectSeparatorProps } from 'reka-ui'
import { SelectSeparator } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<SelectSeparatorProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))
</script>

<template>
  <SelectSeparator
    data-slot="select-separator"
    v-bind="delegatedProps"
    :class="cn('pointer-events-none -mx-1 my-1 h-px bg-neutral-200', props.class)"
  />
</template>
