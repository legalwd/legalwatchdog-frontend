<script setup lang="ts">
import type { DialogCloseProps } from 'reka-ui'
import { DialogClose } from 'reka-ui'

defineProps<DialogCloseProps>()
</script>

<template>
  <DialogClose data-slot="dialog-close" class="cursor-pointer p-0">
    <slot />
  </DialogClose>
</template>
