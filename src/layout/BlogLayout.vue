<template>
  <div
    class="blog-content bg-background mx-auto min-h-screen max-w-4xl px-6 py-10 shadow-md lg:px-8"
  >
    <!-- Blog Metadata & Title -->
    <div class="mb-10 text-center">
      <h1 class="text-brand-850 mb-3 text-4xl font-extrabold">
        {{ blogPost.title }}
      </h1>
      <div class="flex items-center justify-center space-x-3 text-sm">
        <span class="text-accent rounded-full px-3 py-1 text-xs font-semibold">
          {{ blogPost.category }}
        </span>
        <span>| {{ blogPost.date }}</span>
      </div>
    </div>
    <figure class="mb-12">
      <img
        :src="blogPost.mainImage"
        :alt="blogPost.title"
        class="h-auto max-h-112.5 w-full rounded-xl object-cover shadow-lg"
        onerror="this.onerror=null; this.src='"
      />
    </figure>

    <!-- Main Text Content Area -->
    <article class="prose max-w-none">
      <div class="mb-10 text-center">
        <h2 class="mb-4 text-2xl font-bold">Introduction</h2>
        <template v-for="(p, index) in blogPost.introduction" :key="index">
          <p class="text-lg" :class="{ 'mt-4': index > 0 }">
            {{ p }}
          </p>
        </template>
      </div>

      <!-- Section 1: Emerging Focus Areas -->
      <div v-if="blogPost.sections?.focusAreas" class="mb-10">
        <h2 class="mb-4 text-center text-2xl font-bold">Emerging Focus Areas</h2>
        <p class="mb-4">
          {{ blogPost.sections.focusAreas.intro }}
        </p>
        <ul class="ml-6 list-outside list-disc space-y-2">
          <li v-for="(item, key) in blogPost.sections.focusAreas.items" :key="key">
            <span class="font-semibold">{{ key }}:</span> {{ item }}
          </li>
        </ul>
      </div>

      <!-- Section 2: Potential Impact on Businesses -->
      <div v-if="blogPost.sections?.impact" class="mb-10">
        <h2 class="mb-4 text-center text-2xl font-bold">Potential Impact on Businesses</h2>
        <p class="mb-4">
          {{ blogPost.sections.impact.intro }}
        </p>
        <ul class="ml-6 list-outside list-disc space-y-2">
          <li v-for="(item, key) in blogPost.sections.impact.items" :key="key">
            <span class="font-semibold">{{ key }}:</span> {{ item }}
          </li>
        </ul>
      </div>

      <!-- Section 3: How to Prepare -->
      <div v-if="blogPost.sections?.preparation" class="mb-10">
        <h2 class="mb-4 text-center text-2xl font-bold">How to Prepare</h2>
        <p class="mb-4">
          {{ blogPost.sections.preparation.intro }}
        </p>
        <ol class="ml-6 list-outside list-decimal space-y-2">
          <li v-for="(item, key) in blogPost.sections.preparation.items" :key="key">
            <span class="font-semibold">{{ key }}:</span> {{ item }}
          </li>
        </ol>
      </div>

      <!-- Summary -->
      <div v-if="blogPost.summary" class="mb-10 text-center">
        <h2 class="mb-4 text-2xl font-bold">Summary</h2>
        <p class="text-lg">
          {{ blogPost.summary }}
        </p>
      </div>
    </article>

    <!-- Related Posts Section (Dynamic content) -->
    <section v-if="blogPost.relatedPosts?.length" class="mt-16 border-t border-gray-200 pt-8">
      <h2 class="mb-8 text-2xl font-bold">Related Posts</h2>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div
          v-for="post in blogPost.relatedPosts"
          :key="post.id"
          class="bg-background cursor-pointer overflow-hidden rounded-xl border shadow-md transition duration-300 hover:shadow-lg"
          @click="emit('post-selected', post.id)"
        >
          <!-- Related Post Card -->
          <img
            :src="post.image"
            :alt="post.title"
            class="h-48 w-full object-cover"
            onerror="
              this.onerror = null
              this.src = 'https://placehold.co/400x192/e0e0e0/5D2D18?text=Related+Image'
            "
          />
          <div class="p-6">
            <div class="mb-3 flex items-center space-x-3 text-xs font-semibold">
              <span class="text-accent rounded-full px-3 py-1">
                {{ post.category }}
              </span>
              <span class="">| {{ post.date }}</span>
            </div>
            <h3 class="mb-3 text-xl font-bold">
              {{ post.title }}
            </h3>
            <p class="mb-4 line-clamp-3">
              {{ post.summary }}
            </p>
            <a
              href="#"
              class="text-accent hover:text-accent flex items-center space-x-1 text-sm font-semibold transition duration-150"
              @click.prevent="emit('post-selected', post.id)"
            >
              <span>Read More</span>
              <span class="text-accent">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
interface PostSection {
  intro: string
  items: { [key: string]: string }
}

interface BlogPost {
  title: string
  category: string
  date: string
  mainImage: string
  introduction: string[]
  sections: {
    focusAreas?: PostSection
    impact?: PostSection
    preparation?: PostSection
    [key: string]: PostSection | undefined
  }
  summary: string
  relatedPosts: {
    id: number
    title: string
    category: string
    date: string
    summary: string
    image: string
  }[]
}

const { blogPost } = defineProps<{
  blogPost: BlogPost
}>()

const emit = defineEmits<{
  (e: 'post-selected', id: number): void
}>()
</script>

<style scoped>
.blog-content {
  background-color: #ffffff;
}
.h-48 {
  height: 12rem;
}
</style>
