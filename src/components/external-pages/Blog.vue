<script setup lang="ts">
import { Rss, Search } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BlogMetaTree from '@/components/external-pages/BlogMetaTree.vue'
import { Button } from '@/components/ui/button'
import { usePublicBlogStore } from '@/stores/public-blog-store'

const PAGE_LIMIT = 20

const route = useRoute()
const router = useRouter()
const store = usePublicBlogStore()
const { posts, loading, loadingMeta, error, pagination, tree, countries, topics } =
  storeToRefs(store)

const selectedCountry = ref('')
const selectedTopic = ref('')
const searchInput = ref('')
const syncingFromRoute = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const activeSearch = computed(() => searchInput.value.trim())
const hasMore = computed(() =>
  Boolean(pagination.value && pagination.value.page < pagination.value.total_pages),
)

const readQueryString = (value: unknown) => (typeof value === 'string' ? value : '')

const buildQuery = () => {
  const query: Record<string, string> = {}
  if (selectedCountry.value) query.country = selectedCountry.value
  if (selectedTopic.value) query.topic = selectedTopic.value
  if (activeSearch.value) query.q = activeSearch.value
  return query
}

const syncQuery = async () => {
  await router.replace({ query: buildQuery() })
}

const fetchCurrentPosts = async (options?: { append?: boolean; page?: number }) => {
  const page = options?.page ?? 1
  const append = options?.append ?? false

  if (activeSearch.value) {
    await store.searchPosts({
      q: activeSearch.value,
      page,
      limit: PAGE_LIMIT,
      append,
    })
    return
  }

  await store.fetchPosts({
    page,
    limit: PAGE_LIMIT,
    country: selectedCountry.value || null,
    topic: selectedTopic.value || null,
    append,
  })
}

const loadMore = async () => {
  if (!pagination.value || !hasMore.value) return
  await fetchCurrentPosts({
    page: pagination.value.page + 1,
    append: true,
  })
}

const clearFilters = async () => {
  selectedCountry.value = ''
  selectedTopic.value = ''
  searchInput.value = ''
  await syncQuery()
}

watch(
  () => route.query,
  async (query) => {
    syncingFromRoute.value = true
    selectedCountry.value = readQueryString(query.country)
    selectedTopic.value = readQueryString(query.topic)
    searchInput.value = readQueryString(query.q)
    store.setFilters({
      country: selectedCountry.value,
      topic: selectedTopic.value,
      search: searchInput.value,
    })
    syncingFromRoute.value = false
    await fetchCurrentPosts()
  },
  { immediate: true },
)

watch([selectedCountry, selectedTopic], () => {
  if (syncingFromRoute.value) return
  void syncQuery()
})

watch(searchInput, () => {
  if (syncingFromRoute.value) return
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void syncQuery()
  }, 300)
})

onMounted(() => {
  void Promise.all([store.fetchMetaTree(), store.fetchCountries(), store.fetchTopics()])
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <div class="blogs-page relative overflow-hidden">
    <div class="app-container relative z-10 mx-auto px-6 lg:px-8">
      <section class="pt-20 pb-12 text-center">
        <div
          class="shadow-4xl bg-background mb-4 inline-flex items-center space-x-2 rounded-full px-4 py-1.5 text-sm font-medium"
        >
          <Rss class="size-6" />
          <span>Blogs</span>
        </div>

        <h1 class="text-brand-850 mb-4 text-center text-3xl font-extrabold md:text-4xl">
          Insights & Updates
        </h1>

        <p class="mx-auto max-w-2xl text-center text-slate-600">
          Stay informed with the latest insights, updates, and analysis in law, policy, and
          compliance.
        </p>
      </section>

      <section class="pb-16">
        <div
          class="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-end"
        >
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-600">Search</label>
            <div class="relative">
              <Search
                class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                v-model="searchInput"
                type="search"
                placeholder="Search guides"
                class="border-border bg-background h-11 w-full rounded-lg border pr-3 pl-10 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-600">Country</label>
            <select
              v-model="selectedCountry"
              class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
            >
              <option value="">All countries</option>
              <option v-for="country in countries" :key="country.slug" :value="country.slug">
                {{ country.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-600">Topic</label>
            <select
              v-model="selectedTopic"
              class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
            >
              <option value="">All topics</option>
              <option v-for="topic in topics" :key="topic" :value="topic">
                {{ topic }}
              </option>
            </select>
          </div>

          <Button variant="secondary" class="h-11" @click="clearFilters">Clear</Button>
        </div>

        <div class="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside class="lg:sticky lg:top-24 lg:self-start">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <div class="mb-4">
                <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Jurisdictions
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">Browse Guides</h2>
              </div>

              <div v-if="loadingMeta && !tree.length" class="space-y-3">
                <div class="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div class="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div class="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              </div>
              <BlogMetaTree v-else-if="tree.length" :nodes="tree" />
              <p v-else class="text-sm text-slate-500">No jurisdictions available.</p>
            </div>
          </aside>

          <div>
            <div class="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 class="text-3xl font-bold">Guides</h2>
                <p v-if="pagination" class="mt-1 text-sm text-slate-500">
                  {{ pagination.total_items }} result{{ pagination.total_items === 1 ? '' : 's' }}
                </p>
              </div>
            </div>

            <div v-if="loading && !posts.length" class="py-20 text-center text-xl">
              Loading guides...
            </div>
            <div v-else-if="error" class="py-20 text-center text-xl text-red-500">
              {{ error }}
            </div>
            <div v-else-if="posts.length" class="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
              <RouterLink v-for="post in posts" :key="post.id" :to="`/blog/${post.slug}`">
                <article
                  class="group bg-background h-full overflow-hidden rounded-xl border shadow-md transition duration-300 ease-in-out hover:shadow-xl"
                >
                  <div class="p-6">
                    <div class="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span v-if="post.published_at" class="text-muted">
                        {{ new Date(post.published_at).toLocaleDateString() }}
                      </span>
                      <span
                        v-for="keyword in post.keywords?.slice(0, 2)"
                        :key="keyword"
                        class="rounded-full bg-slate-100 px-2 py-1 text-slate-500"
                      >
                        {{ keyword }}
                      </span>
                    </div>
                    <h3
                      class="group-hover:text-primary mb-3 text-xl font-bold transition duration-150"
                    >
                      {{ post.title }}
                    </h3>
                    <p class="mb-4 line-clamp-3 text-slate-600">
                      {{ post.meta_description || 'Read more about this compliance guide...' }}
                    </p>
                  </div>
                </article>
              </RouterLink>
            </div>
            <div
              v-else
              class="bg-background rounded-xl border border-gray-100 p-10 text-center shadow-md"
            >
              No blog posts match the current filters.
            </div>

            <div v-if="hasMore" class="mt-12 flex justify-center">
              <Button size="lg" variant="default" :disabled="loading" @click="loadMore">
                {{ loading ? 'Loading...' : 'Load More' }}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
