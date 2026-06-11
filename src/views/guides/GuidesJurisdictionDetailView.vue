<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

import { useGuidesStore } from '@/stores/guides-store'

const route = useRoute()
const store = useGuidesStore()
const { activeDetail, loading, error } = storeToRefs(store)

const fetchDetail = async () => {
  const industry = route.params.industry as string
  const region = route.params.region as string
  const jurisdiction = route.params.jurisdiction as string
  if (industry && region && jurisdiction) {
    await store.fetchJurisdictionDetail(industry, region, jurisdiction)
  }
}

const formatGuideDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : ''

onMounted(fetchDetail)
watch(
  [() => route.params.industry, () => route.params.region, () => route.params.jurisdiction],
  fetchDetail,
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-16">
    <div class="mx-auto max-w-4xl px-6">
      <div v-if="loading" class="py-10 text-center text-xl text-gray-500">Loading...</div>
      <div v-else-if="error" class="py-10 text-center text-xl text-red-500">{{ error }}</div>

      <div v-else-if="activeDetail">
        <nav class="mb-6 flex text-sm text-gray-500" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li
              v-for="(crumb, index) in activeDetail.breadcrumbs"
              :key="index"
              class="inline-flex items-center"
            >
              <span v-if="index > 0" class="mx-2 text-gray-400">/</span>
              <RouterLink :to="crumb.url" class="hover:text-gray-900">
                {{ crumb.name }}
              </RouterLink>
            </li>
          </ol>
        </nav>

        <h1 class="mb-4 text-4xl font-bold">{{ activeDetail.title || activeDetail.name }}</h1>
        <p v-if="activeDetail.meta_description" class="mb-4 text-lg text-gray-600">
          {{ activeDetail.meta_description }}
        </p>
        <p v-if="activeDetail.updated_at" class="mb-6 text-sm text-gray-500">
          Last updated: {{ formatGuideDate(activeDetail.updated_at) }}
        </p>

        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="activeDetail.content_html"
          class="prose prose-lg max-w-none"
          v-html="activeDetail.content_html"
        ></div>
        <!-- eslint-enable vue/no-v-html -->
        <div v-else class="space-y-4 py-6">
          <div v-if="activeDetail.keywords?.length" class="flex flex-wrap gap-2">
            <span
              v-for="keyword in activeDetail.keywords"
              :key="keyword"
              class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
            >
              {{ keyword }}
            </span>
          </div>
          <a
            v-if="activeDetail.post_url"
            :href="activeDetail.post_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex text-sm font-medium text-gray-900 underline"
          >
            Open published guide
          </a>
          <p v-else class="text-gray-500 italic">No content available for this jurisdiction.</p>
        </div>
      </div>

      <div v-else class="py-10 text-center text-xl text-gray-500">Jurisdiction not found.</div>
    </div>
  </div>
</template>
