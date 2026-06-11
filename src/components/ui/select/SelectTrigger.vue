<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import type { SelectTriggerProps } from 'reka-ui'
import { SelectIcon, SelectTrigger, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = withDefaults(
  defineProps<SelectTriggerProps & { class?: HTMLAttributes['class']; size?: 'sm' | 'default' }>(),
  { size: 'default' },
)

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class', 'size')))
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size"
    v-bind="forwardedProps"
    :class="
      cn(
        'focus-visible:ring-accent aria-invalid:border-error aria-invalid:ring-error flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3.5 py-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-neutral-950 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-gray-400 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4 [&_svg:not([class*=\'text-\'])]:text-neutral-500',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="size-4 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>
