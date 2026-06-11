<script setup lang="ts">
import type { SelectItemTextProps } from 'reka-ui'
import { SelectItemText, useForwardProps } from 'reka-ui'
import { computed } from 'vue'

import { filterUndefined } from '@/lib/utils'

const props = defineProps<SelectItemTextProps>()

const forwarded = computed(() => filterUndefined(useForwardProps(props).value))
</script>

<template>
  <SelectItemText data-slot="select-item-text" v-bind="forwarded">
    <slot />
  </SelectItemText>
</template>
