<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { NavigationMenuLinkEmits, NavigationMenuLinkProps } from 'reka-ui'
import { NavigationMenuLink, useForwardPropsEmits } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

import { cn, filterUndefined } from '@/lib/utils'

const props = defineProps<NavigationMenuLinkProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<NavigationMenuLinkEmits>()

const delegatedProps = computed(() => filterUndefined(reactiveOmit(props, 'class')))
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <NavigationMenuLink
    data-slot="navigation-menu-link"
    v-bind="forwarded"
    :class="
      cn(
        'outline-ring/50 flex flex-col gap-1 rounded-sm p-2 text-sm ring-neutral-950/10 transition-[color,box-shadow] hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus-visible:ring-4 focus-visible:outline-1 data-[active=true]:bg-neutral-100/50 data-[active=true]:text-neutral-900 data-[active=true]:hover:bg-neutral-100 data-[active=true]:focus:bg-neutral-100 [&_svg:not([class*=\'size-\'])]:size-4 [&_svg:not([class*=\'text-\'])]:text-neutral-500',
        props.class,
      )
    "
  >
    <slot />
  </NavigationMenuLink>
</template>
