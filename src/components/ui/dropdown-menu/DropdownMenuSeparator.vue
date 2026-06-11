<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { DropdownMenuSeparatorProps } from 'reka-ui'
import { DropdownMenuSeparator } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<
  DropdownMenuSeparatorProps & {
    class?: HTMLAttributes['class']
  }
>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))
</script>

<template>
  <DropdownMenuSeparator
    data-slot="dropdown-menu-separator"
    v-bind="delegatedProps"
    :class="cn('-mx-1 my-1 h-px bg-neutral-200', props.class)"
  />
</template>
