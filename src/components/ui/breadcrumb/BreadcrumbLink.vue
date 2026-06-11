<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import { Primitive } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes['class'] }>(), {
  as: 'a',
})
</script>

<template>
  <Primitive
    data-slot="breadcrumb-link"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'text-accent-main transition-colors hover:text-[#2a1102] focus-visible:ring-2 focus-visible:ring-[#f1a75f]/60 focus-visible:ring-offset-2 focus-visible:outline-none',
        props.class,
      )
    "
  >
    <slot />
  </Primitive>
</template>
