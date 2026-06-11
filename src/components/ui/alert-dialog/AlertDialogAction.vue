<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { AlertDialogActionProps } from 'reka-ui'
import { AlertDialogAction } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { buttonVariants } from '@/components/ui/button'
import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<AlertDialogActionProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))
</script>

<template>
  <AlertDialogAction v-bind="delegatedProps" :class="cn(buttonVariants(), props.class)">
    <slot />
  </AlertDialogAction>
</template>
