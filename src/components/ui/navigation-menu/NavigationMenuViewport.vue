<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { NavigationMenuViewportProps } from 'reka-ui'
import { NavigationMenuViewport, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<NavigationMenuViewportProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <div class="absolute top-full left-0 isolate z-50 flex justify-center">
    <NavigationMenuViewport
      data-slot="navigation-menu-viewport"
      v-bind="forwardedProps"
      :class="
        cn(
          'origin-top-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 bg-background relative left-[var(--reka-navigation-menu-viewport-left)] mt-1.5 h-[var(--reka-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border border-neutral-200 text-neutral-950 shadow md:w-[var(--reka-navigation-menu-viewport-width)]',
          props.class,
        )
      "
    />
  </div>
</template>
