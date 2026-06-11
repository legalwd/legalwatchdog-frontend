<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner/index'

import GlobalConfirmDialog from './components/ui/GlobalConfirmDialog.vue'
</script>

<template>
  <RouterView />
  <Toaster position="top-right" rich-colors />
  <GlobalConfirmDialog />
</template>
