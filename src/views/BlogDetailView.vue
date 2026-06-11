<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { usePublicBlogStore } from '@/stores/public-blog-store'

const route = useRoute()
const store = usePublicBlogStore()
const { activePost, loading, error } = storeToRefs(store)

const relatedJurisdictions = computed(() => activePost.value?.related_jurisdictions ?? [])

const readRouteParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value.join('/')
  return value ?? ''
}

const fetchPost = async () => {
  if (route.name === 'blog-resource-detail') {
    const resourcePath = readRouteParam(route.params.resourcePath as string | string[] | undefined)
    if (resourcePath) {
      await store.fetchPostByResourcePath(resourcePath)
    }
    return
  }

  const slug = readRouteParam(route.params.slug as string | string[] | undefined)
  if (slug) {
    await store.fetchPostBySlug(slug)
  }
}

onMounted(fetchPost)
watch(() => route.fullPath, fetchPost)
</script>

<template>
  <div v-if="loading" class="min-h-screen bg-gray-50 py-40 text-center text-xl">Loading...</div>
  <div v-else-if="error" class="min-h-screen bg-gray-50 py-40 text-center text-xl text-red-500">
    {{ error }}
  </div>
  <div v-else-if="activePost" class="min-h-screen bg-gray-50 py-16">
    <div class="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article class="min-w-0">
        <nav v-if="activePost.breadcrumbs?.length" class="mb-6" aria-label="Breadcrumb">
          <ol class="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <li v-for="(breadcrumb, index) in activePost.breadcrumbs" :key="breadcrumb.url">
              <a
                v-if="index < (activePost.breadcrumbs?.length ?? 0) - 1"
                :href="breadcrumb.url"
                class="hover:text-primary"
              >
                {{ breadcrumb.name }}
              </a>
              <span v-else class="font-medium text-slate-700">{{ breadcrumb.name }}</span>
              <span v-if="index < (activePost.breadcrumbs?.length ?? 0) - 1" class="ml-2">/</span>
            </li>
          </ol>
        </nav>

        <h1 class="mb-4 text-4xl font-bold">
          {{ activePost.title }}
        </h1>

        <p v-if="activePost.published_at" class="mb-10 text-sm text-gray-500">
          {{ new Date(activePost.published_at).toLocaleDateString() }}
        </p>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="prose prose-lg max-w-none" v-html="activePost.content_html"></div>
      </article>

      <aside v-if="relatedJurisdictions.length" class="lg:sticky lg:top-24 lg:self-start">
        <section class="rounded-xl border border-slate-200 bg-white p-5">
          <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Recommended</p>
          <h2 class="mt-2 text-lg font-semibold text-slate-900">Related Jurisdictions</h2>

          <div class="mt-5 space-y-3">
            <a
              v-for="item in relatedJurisdictions"
              :key="`${item.type}-${item.name}-${item.url}`"
              :href="item.url"
              class="block rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {{ item.type }}
              </p>
              <h3 class="mt-2 text-base font-semibold text-slate-900">{{ item.name }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ item.region }}</p>
            </a>
          </div>
        </section>
      </aside>
    </div>
  </div>
  <div v-else class="min-h-screen bg-gray-50 py-40 text-center text-xl">Blog post not found.</div>
</template>
