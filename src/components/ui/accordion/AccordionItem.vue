<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { AccordionItemProps } from 'reka-ui'
import { AccordionItem } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<AccordionItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(
  () => filterUndefined(reactiveOmit(props, 'class')) as AccordionItemProps,
)
</script>

<template>
  <AccordionItem
    v-slot="slotProps"
    data-slot="accordion-item"
    v-bind="delegatedProps"
    :class="cn('border-b last:border-b-0', props.class)"
  >
    <slot v-bind="slotProps" />
  </AccordionItem>
</template>
