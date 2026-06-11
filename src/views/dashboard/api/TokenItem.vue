<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'

interface Props {
  name: string
  lastUsed?: string
  expiresOn?: string
  isExpired?: boolean
}

defineProps<Props>()

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div
    class="flex flex-col gap-4 rounded-t-md border-b p-6 last-of-type:rounded-b-md last-of-type:border-0 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center gap-4">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F5E6D3] text-sm font-semibold text-[#8B4513]"
      >
        {{ getInitials(name) }}
      </div>

      <div class="flex flex-col gap-1">
        <h3 class="text-base font-semibold text-[#0F172A]">{{ name }}</h3>
        <div class="flex items-center gap-2 text-sm text-[#6B7280]">
          <span v-if="lastUsed">Last used {{ lastUsed }}</span>
          <span v-else>Never used</span>
          <template v-if="expiresOn && !isExpired">
            <span>•</span>
            <span>Expires on {{ expiresOn }}</span>
          </template>

          <div v-if="isExpired" class="text-peach-amber-400 flex items-center gap-1.5 text-sm">
            <TriangleAlert alt="warning" class="h-4 w-4" />
            <span class="underline">This token has expired</span>
          </div>
        </div>
      </div>
    </div>

    <Button
      variant="outline"
      class="border-[#DC2626] bg-[#F7F7F7] text-[#DC2626] hover:border-[#DC2626] hover:bg-[#F7F7F7] hover:text-[#DC2626]"
    >
      Delete
    </Button>
  </div>
</template>
