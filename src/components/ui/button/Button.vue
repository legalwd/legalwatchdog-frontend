<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import { Primitive } from 'reka-ui'
import { computed } from 'vue'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

import type { ButtonVariants } from '.'
import { buttonVariants } from '.'

interface Props extends /* @vue-ignore */ PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  layout?: ButtonVariants['layout']
  loading?: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  layout: 'default',
  loading: false,
})

const isDisabled = computed(() => Boolean(props.disabled || props.loading))
</script>

<template>
  <Primitive
    data-slot="button"
    :as="props.as ?? 'button'"
    :as-child="props.asChild"
    :aria-busy="props.loading || undefined"
    :aria-disabled="isDisabled || undefined"
    :data-loading="props.loading || undefined"
    :disabled="isDisabled || undefined"
    :class="
      cn(
        buttonVariants({ variant: props.variant, size: props.size, layout: props.layout }),
        props.class,
      )
    "
  >
    <span class="inline-flex items-center justify-center gap-2">
      <span v-if="props.loading" class="grid place-items-center">
        <span
          class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      </span>
      <slot />
    </span>
  </Primitive>
</template>
