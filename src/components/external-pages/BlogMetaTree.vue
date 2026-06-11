<script setup lang="ts">
import type { PublicBlogMetaTreeNode } from '@/types/public-blog'

defineProps<{
  nodes: PublicBlogMetaTreeNode[]
}>()
</script>

<template>
  <ul class="space-y-2">
    <li v-for="node in nodes" :key="node.id">
      <details v-if="node.children.length" class="group">
        <summary
          class="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <a :href="node.url" class="hover:text-primary min-w-0 truncate" @click.stop>
            {{ node.name }}
          </a>
          <span class="text-xs text-slate-400 group-open:hidden">+</span>
          <span class="hidden text-xs text-slate-400 group-open:inline">-</span>
        </summary>
        <div class="mt-2 border-l border-slate-200 pl-3">
          <BlogMetaTree :nodes="node.children" />
        </div>
      </details>

      <a
        v-else
        :href="node.url"
        class="hover:text-primary block truncate rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        {{ node.name }}
      </a>
    </li>
  </ul>
</template>
