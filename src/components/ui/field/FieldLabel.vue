<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Label
    data-slot="field-label"
    :class="
      cn(
        'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4',
        'has-data-[state=checked]:border-neutral-900 has-data-[state=checked]:bg-neutral-900/5',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>
