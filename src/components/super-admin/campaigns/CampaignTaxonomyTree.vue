<script setup lang="ts">
import { computed } from 'vue'

import type { CampaignTaxonomyNode } from '@/types/campaign'

defineOptions({
  name: 'CampaignTaxonomyTree',
})

const props = defineProps<{
  nodes: CampaignTaxonomyNode[]
  selectedPath?: number[] | null
  basePath?: number[]
}>()

const emit = defineEmits<{
  (e: 'select', path: number[]): void
}>()

const resolvedBasePath = computed(() => props.basePath ?? [])

const isSelected = (path: number[]) =>
  JSON.stringify(path) === JSON.stringify(props.selectedPath ?? null)

const buildSummary = (node: CampaignTaxonomyNode) => {
  const fragments = [
    node.iso_code ? `ISO: ${node.iso_code}` : null,
    Array.isArray(node.children) && node.children.length
      ? `${node.children.length} children`
      : null,
    Array.isArray(node.suggested_search_queries) && node.suggested_search_queries.length
      ? `${node.suggested_search_queries.length} queries`
      : null,
  ]

  return fragments.filter(Boolean).join(' • ')
}
</script>

<template>
  <ul class="space-y-3">
    <li v-for="(node, index) in nodes" :key="`${resolvedBasePath.join('-')}-${node.name}-${index}`">
      <button
        type="button"
        class="w-full rounded-xl border px-4 py-3 text-left transition"
        :class="
          isSelected([...resolvedBasePath, index])
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300'
        "
        @click="emit('select', [...resolvedBasePath, index])"
      >
        <p class="text-sm font-semibold">{{ node.name }}</p>
        <p
          v-if="buildSummary(node)"
          class="mt-1 text-xs"
          :class="isSelected([...resolvedBasePath, index]) ? 'text-slate-200' : 'text-slate-500'"
        >
          {{ buildSummary(node) }}
        </p>
      </button>

      <div
        v-if="Array.isArray(node.children) && node.children.length"
        class="mt-3 border-l border-slate-200 pl-4"
      >
        <CampaignTaxonomyTree
          :nodes="node.children"
          :selected-path="selectedPath ?? null"
          :base-path="[...resolvedBasePath, index]"
          @select="emit('select', $event)"
        />
      </div>
    </li>
  </ul>
</template>
