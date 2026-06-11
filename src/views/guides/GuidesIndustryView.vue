<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

import { useGuidesStore } from '@/stores/guides-store'

const route = useRoute()
const store = useGuidesStore()
const { regions, loading, error } = storeToRefs(store)

const fetchRegions = async () => {
  const industry = route.params.industry as string
  if (industry) {
    await store.fetchIndustryRegions(industry)
  }
}

onMounted(fetchRegions)
watch(() => route.params.industry, fetchRegions)
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-16">
    <div class="mx-auto max-w-4xl px-6">
      <h1 class="mb-8 text-4xl font-bold capitalize">{{ route.params.industry }} Guides</h1>

      <div v-if="loading" class="py-10 text-center text-xl text-gray-500">Loading regions...</div>
      <div v-else-if="error" class="py-10 text-center text-xl text-red-500">{{ error }}</div>

      <div v-else-if="regions.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="region in regions"
          :key="region.id"
          :to="`/guides/${route.params.industry}/${region.slug}`"
          class="block rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 class="text-xl font-semibold">{{ region.name }}</h2>
          <p class="mt-2 text-sm text-gray-500">{{ region.jurisdiction_count }} jurisdictions</p>
          <p v-if="region.latest_update" class="mt-2 text-xs text-gray-400">
            Updated: {{ new Date(region.latest_update).toLocaleDateString() }}
          </p>
        </RouterLink>
      </div>

      <div v-else class="py-10 text-center text-xl text-gray-500">No regions found.</div>
    </div>
  </div>
</template>
