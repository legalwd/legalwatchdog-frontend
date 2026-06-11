<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { AlertDialogDescriptionProps } from 'reka-ui'
import { AlertDialogDescription } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<AlertDialogDescriptionProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))
</script>

<template>
  <AlertDialogDescription
    data-slot="alert-dialog-description"
    v-bind="delegatedProps"
    :class="cn('text-sm text-neutral-500 dark:text-neutral-400', props.class)"
  >
    <slot />
  </AlertDialogDescription>
</template>
