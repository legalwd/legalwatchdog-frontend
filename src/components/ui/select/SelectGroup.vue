<script setup lang="ts">
import type { SelectGroupProps } from 'reka-ui'
import { SelectGroup, useForwardProps } from 'reka-ui'
import { computed } from 'vue'

import { filterUndefined } from '@/lib/utils'

const props = defineProps<SelectGroupProps>()

const forwarded = computed(() => filterUndefined(useForwardProps(props).value))
</script>

<template>
  <SelectGroup data-slot="select-group" v-bind="forwarded">
    <slot />
  </SelectGroup>
</template>
