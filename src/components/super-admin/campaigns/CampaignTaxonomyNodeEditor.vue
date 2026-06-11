<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button } from '@/components/ui/button'
import type { CampaignTaxonomyNode } from '@/types/campaign'

const props = defineProps<{
  node: CampaignTaxonomyNode | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'apply', node: CampaignTaxonomyNode): void
}>()

const formState = ref({
  name: '',
  description: '',
  suggested_prompt: '',
  iso_code: '',
  suggested_search_queries: '',
})

const hasNode = computed(() => Boolean(props.node))

const syncForm = () => {
  formState.value = {
    name: props.node?.name ?? '',
    description: props.node?.description ?? '',
    suggested_prompt: props.node?.suggested_prompt ?? '',
    iso_code: props.node?.iso_code ?? '',
    suggested_search_queries: Array.isArray(props.node?.suggested_search_queries)
      ? props.node?.suggested_search_queries.join(', ')
      : '',
  }
}

watch(
  () => props.node,
  () => {
    syncForm()
  },
  { immediate: true },
)

const applyChanges = () => {
  if (!props.node) return

  emit('apply', {
    ...props.node,
    name: formState.value.name.trim(),
    description: formState.value.description.trim() || null,
    suggested_prompt: formState.value.suggested_prompt.trim() || null,
    iso_code: formState.value.iso_code.trim() || null,
    suggested_search_queries: formState.value.suggested_search_queries
      .split(',')
      .map((query) => query.trim())
      .filter(Boolean),
  })
}
</script>

<template>
  <section class="border-border bg-background rounded-xl border p-6">
    <div>
      <h2 class="text-foreground text-lg font-semibold">Node Editor</h2>
      <p class="mt-2 text-sm text-slate-500">
        Apply changes to the selected node, then save the taxonomy draft.
      </p>
    </div>

    <template v-if="hasNode">
      <div class="mt-6 grid gap-4">
        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Name</label>
          <input
            v-model="formState.name"
            type="text"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Description</label>
          <textarea
            v-model="formState.description"
            rows="4"
            class="border-border bg-background w-full rounded-lg border px-3 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Suggested Prompt</label>
          <textarea
            v-model="formState.suggested_prompt"
            rows="3"
            class="border-border bg-background w-full rounded-lg border px-3 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">ISO Code</label>
          <input
            v-model="formState.iso_code"
            type="text"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Suggested Search Queries</label>
          <textarea
            v-model="formState.suggested_search_queries"
            rows="4"
            placeholder="Separate queries with commas"
            class="border-border bg-background w-full rounded-lg border px-3 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div class="mt-6">
        <Button :disabled="loading || !formState.name.trim()" @click="applyChanges">
          Apply Node Changes
        </Button>
      </div>
    </template>

    <p v-else class="mt-6 text-sm text-slate-500">
      Select a taxonomy node from the tree to edit it.
    </p>
  </section>
</template>
