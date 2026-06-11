<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { LabelProps } from 'reka-ui'
import { Label } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<LabelProps & { row?: boolean } & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))
</script>

<template>
  <Label
    data-slot="label"
    v-bind="delegatedProps"
    :class="
      cn(
        'flex items-start gap-2 text-sm font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        props.row ? 'flex-row' : 'flex-col',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>
