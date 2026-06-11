<script setup lang="ts">
import type { DropdownMenuRadioGroupEmits, DropdownMenuRadioGroupProps } from 'reka-ui'
import { DropdownMenuRadioGroup, useForwardPropsEmits } from 'reka-ui'
import { computed } from 'vue'

import { filterUndefined } from '@/lib/utils'

const props = defineProps<DropdownMenuRadioGroupProps>()
const emits = defineEmits<DropdownMenuRadioGroupEmits>()

const forwarded = computed(() => filterUndefined(useForwardPropsEmits(props, emits).value))
</script>

<template>
  <DropdownMenuRadioGroup data-slot="dropdown-menu-radio-group" v-bind="forwarded">
    <slot />
  </DropdownMenuRadioGroup>
</template>
