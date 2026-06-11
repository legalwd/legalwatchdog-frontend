<script setup lang="ts">
import axios from 'axios'
import { ArrowLeft, ExternalLink } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { blogApi, type BlogPost } from '@/api/blog'
import MarkdownRenderer from '@/components/reusable/MarkdownRenderer'

const route = useRoute()

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const post = ref<BlogPost | null>(null)

const organizationId = computed(() => String(route.params.organizationId || ''))
const jurisdictionId = computed(() => String(route.params.jurisdictionId || ''))
const publicBlogHref = computed(() => {
  if (post.value?.public_url) return post.value.public_url

  if (post.value?.resource_path) {
    return `/resources/${post.value.resource_path.replace(/^\/+/, '')}`
  }

  if (post.value?.slug) {
    return `/blog/${post.value.slug}`
  }

  return ''
})

const loadPost = async () => {
  if (!organizationId.value || !jurisdictionId.value) return

  loading.value = true
  errorMessage.value = null

  try {
    const res = await blogApi.getBlogPost(organizationId.value, jurisdictionId.value)
    post.value = res.data?.data ?? null
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ||
        'Failed to load blog post'
      : 'Failed to load blog post'

    errorMessage.value = message
    post.value = null
  } finally {
    loading.value = false
  }
}

watch([organizationId, jurisdictionId], () => {
  void loadPost()
})

onMounted(() => {
  void loadPost()
})
</script>

<template>
  <main class="bg-page-bg min-h-[calc(100vh-72px)] p-6">
    <section class="border-border bg-background rounded-xl border p-6">
      <div class="mb-5">
        <RouterLink
          :to="{
            name: 'super-admin-blog',
            query: { panel: 'posts', organizationId: organizationId },
          }"
          class="text-muted hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft :size="16" />
          Back to posts list
        </RouterLink>
      </div>

      <div v-if="loading" class="text-muted text-sm">Loading blog post...</div>
      <p v-else-if="errorMessage" class="text-error text-sm">{{ errorMessage }}</p>

      <article v-else-if="post" class="space-y-4">
        <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 class="text-foreground text-2xl font-semibold">{{ post.title }}</h1>
            <p v-if="post.meta_description" class="text-muted mt-2 text-sm">
              {{ post.meta_description }}
            </p>
          </div>

          <a
            v-if="publicBlogHref"
            :href="publicBlogHref"
            target="_blank"
            rel="noopener noreferrer"
            class="border-border text-foreground hover:bg-muted/10 inline-flex shrink-0 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
          >
            <ExternalLink :size="14" />
            Open public page
          </a>
        </header>

        <section class="border-border border-t pt-4">
          <MarkdownRenderer :markdown="post.content" />
        </section>
      </article>

      <p v-else class="text-muted text-sm">No blog post found.</p>
    </section>
  </main>
</template>
