<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

import { useGuidesStore } from '@/stores/guides-store'
import type { GuideSort } from '@/types/guides'

const route = useRoute()
const store = useGuidesStore()
const { jurisdictions, loading, error } = storeToRefs(store)

const sort = ref<GuideSort>('name')

const fetchJurisdictions = async () => {
  const industry = route.params.industry as string
  const region = route.params.region as string
  if (industry && region) {
    await store.fetchRegionJurisdictions(industry, region, { sort: sort.value })
  }
}

const handleSortChange = () => {
  fetchJurisdictions()
}

onMounted(fetchJurisdictions)
watch([() => route.params.industry, () => route.params.region], fetchJurisdictions)
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-16">
    <div class="mx-auto max-w-4xl px-6">
      <div class="mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <h1 class="text-4xl font-bold capitalize">{{ route.params.region }} Jurisdictions</h1>

        <div class="mt-4 flex gap-4 sm:mt-0">
          <select v-model="sort" class="rounded-md border p-2 text-sm" @change="handleSortChange">
            <option value="name">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="updated">Recently updated</option>
            <option value="updated_asc">Oldest updated</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="py-10 text-center text-xl text-gray-500">
        Loading jurisdictions...
      </div>
      <div v-else-if="error" class="py-10 text-center text-xl text-red-500">{{ error }}</div>

      <div v-else-if="jurisdictions.length" class="space-y-4">
        <RouterLink
          v-for="jurisdiction in jurisdictions"
          :key="jurisdiction.id"
          :to="`/guides/${route.params.industry}/${route.params.region}/${jurisdiction.slug}`"
          class="block rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 class="text-xl font-semibold">{{ jurisdiction.name }}</h2>
          <p v-if="jurisdiction.summary" class="mt-2 text-gray-600">
            {{ jurisdiction.summary }}
          </p>
          <div v-if="jurisdiction.key_topics?.length" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="topic in jurisdiction.key_topics"
              :key="topic"
              class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
            >
              {{ topic }}
            </span>
          </div>
          <p v-if="jurisdiction.updated_at" class="mt-2 text-xs text-gray-400">
            Updated: {{ new Date(jurisdiction.updated_at).toLocaleDateString() }}
          </p>
        </RouterLink>
      </div>

      <div v-else class="py-10 text-center text-xl text-gray-500">No jurisdictions found.</div>
    </div>
  </div>
</template>
