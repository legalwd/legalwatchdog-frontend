<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { NavigationMenuListProps } from 'reka-ui'
import { NavigationMenuList, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<NavigationMenuListProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <NavigationMenuList
    data-slot="navigation-menu-list"
    v-bind="forwardedProps"
    :class="cn('group flex flex-1 list-none items-center justify-center gap-1', props.class)"
  >
    <slot />
  </NavigationMenuList>
</template>
