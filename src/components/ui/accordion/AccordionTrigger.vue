<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { Minus, Plus } from 'lucide-vue-next'
import type { AccordionTriggerProps } from 'reka-ui'
import { AccordionHeader, AccordionTrigger } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      data-slot="accordion-trigger"
      v-bind="delegatedProps"
      :class="
        cn(
          'group flex flex-1 items-start justify-between gap-4 rounded-md py-8 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-neutral-950 focus-visible:ring-[3px] focus-visible:ring-neutral-950/50 disabled:pointer-events-none disabled:opacity-50',
          props.class,
        )
      "
    >
      <slot />
      <slot name="icon">
        <Plus
          class="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:hidden"
        />
        <Minus
          class="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=closed]:hidden"
        />
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>
