<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { DialogDescriptionProps } from 'reka-ui'
import { DialogDescription } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))
</script>

<template>
  <DialogDescription
    data-slot="sheet-description"
    :class="cn('text-sm text-neutral-500', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogDescription>
</template>
