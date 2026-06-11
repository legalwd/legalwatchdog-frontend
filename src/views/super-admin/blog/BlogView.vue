<script setup lang="ts">
import { FileText, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'

import BlogGenerationPanel from './BlogGenerationPanel.vue'
import BlogPostsListPanel from './BlogPostsListPanel.vue'

const isCollapsed = ref(true)
const isHovered = ref(false)
const activePanel = ref<'generate' | 'posts'>('generate')
const route = useRoute()
const router = useRouter()

const sidebarExpanded = computed(() => !isCollapsed.value || isHovered.value)
const isGeneratePanel = computed(() => activePanel.value === 'generate')
const isPostsPanel = computed(() => activePanel.value === 'posts')

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const openGeneratePanel = () => {
  activePanel.value = 'generate'
  void router.replace({
    query: { ...route.query, panel: 'generate' },
  })
}

const openPostsPanel = () => {
  activePanel.value = 'posts'
  void router.replace({
    query: { ...route.query, panel: 'posts' },
  })
}

watch(
  () => route.query.panel,
  (panel) => {
    activePanel.value = panel === 'posts' ? 'posts' : 'generate'
  },
  { immediate: true },
)
</script>

<template>
  <main class="bg-page-bg min-h-[calc(100vh-72px)]">
    <section class="flex min-h-[calc(100vh-72px)]">
      <aside
        class="border-border bg-background relative border-r p-3 transition-all duration-200"
        :class="sidebarExpanded ? 'w-56' : 'w-20'"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div class="mb-3 flex items-center justify-between gap-2">
          <p
            class="text-foreground text-sm font-semibold whitespace-nowrap transition-opacity duration-150"
            :class="sidebarExpanded ? 'block' : 'pointer-events-none hidden'"
          >
            Blog Tools
          </p>

          <button
            type="button"
            class="border-border text-muted hover:text-foreground hover:bg-muted-background inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition"
            :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            @click="toggleSidebar"
          >
            <PanelLeftOpen v-if="isCollapsed" :size="16" />
            <PanelLeftClose v-else :size="16" />
          </button>
        </div>

        <nav aria-label="Blog actions" class="space-y-2">
          <Button
            variant="secondary"
            size="md"
            class="w-full justify-start border transition"
            :class="[
              sidebarExpanded ? 'px-3' : 'px-0',
              isGeneratePanel
                ? 'border-primary bg-accent-background text-foreground hover:bg-accent-background'
                : 'text-foreground hover:bg-muted-background',
            ]"
            @click="openGeneratePanel"
          >
            <span
              class="inline-flex w-full items-center"
              :class="sidebarExpanded ? 'gap-2' : 'justify-center'"
            >
              <Sparkles :size="16" />
              <span
                class="text-sm whitespace-nowrap transition-opacity duration-150"
                :class="
                  sidebarExpanded
                    ? 'opacity-100'
                    : 'pointer-events-none w-0 overflow-hidden opacity-0'
                "
              >
                Generate
              </span>
            </span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            class="w-full justify-start border transition"
            :class="[
              sidebarExpanded ? 'px-3' : 'px-0',
              isPostsPanel
                ? 'border-primary bg-accent-background text-foreground hover:bg-accent-background'
                : 'text-foreground hover:bg-muted-background',
            ]"
            @click="openPostsPanel"
          >
            <span
              class="inline-flex w-full items-center"
              :class="sidebarExpanded ? 'gap-2' : 'justify-center'"
            >
              <FileText :size="16" />
              <span
                class="text-sm whitespace-nowrap transition-opacity duration-150"
                :class="
                  sidebarExpanded
                    ? 'opacity-100'
                    : 'pointer-events-none w-0 overflow-hidden opacity-0'
                "
              >
                Posts List
              </span>
            </span>
          </Button>
        </nav>
      </aside>

      <section class="flex-1 p-6">
        <h1 class="text-foreground text-2xl font-semibold">Blog</h1>

        <BlogGenerationPanel v-if="isGeneratePanel" />
        <BlogPostsListPanel v-else-if="isPostsPanel" />
      </section>
    </section>
  </main>
</template>
