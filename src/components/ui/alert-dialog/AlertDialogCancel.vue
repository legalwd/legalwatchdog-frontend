<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { AlertDialogCancelProps } from 'reka-ui'
import { AlertDialogCancel } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { buttonVariants } from '@/components/ui/button'
import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<AlertDialogCancelProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))
</script>

<template>
  <AlertDialogCancel
    v-bind="delegatedProps"
    :class="cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', props.class)"
  >
    <slot />
  </AlertDialogCancel>
</template>
