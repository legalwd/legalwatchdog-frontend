<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { NavigationMenuIndicatorProps } from 'reka-ui'
import { NavigationMenuIndicator, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<NavigationMenuIndicatorProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <NavigationMenuIndicator
    data-slot="navigation-menu-indicator"
    v-bind="forwardedProps"
    :class="
      cn(
        'data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-1 flex h-1.5 items-end justify-center overflow-hidden',
        props.class,
      )
    "
  >
    <div class="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-neutral-200 shadow-md" />
  </NavigationMenuIndicator>
</template>
