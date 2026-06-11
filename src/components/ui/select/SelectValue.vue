<script setup lang="ts">
import type { SelectValueProps } from 'reka-ui'
import { SelectValue, useForwardProps } from 'reka-ui'
import { computed } from 'vue'

import { filterUndefined } from '@/lib/utils'

const props = defineProps<SelectValueProps>()

const forwarded = computed(() => filterUndefined(useForwardProps(props).value))
</script>

<template>
  <SelectValue data-slot="select-value" v-bind="forwarded">
    <slot />
  </SelectValue>
</template>
