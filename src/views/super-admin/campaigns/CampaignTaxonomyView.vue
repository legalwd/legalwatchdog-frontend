<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import CampaignTaxonomyNodeEditor from '@/components/super-admin/campaigns/CampaignTaxonomyNodeEditor.vue'
import CampaignTaxonomyTree from '@/components/super-admin/campaigns/CampaignTaxonomyTree.vue'
import CampaignTaxonomyWarnings from '@/components/super-admin/campaigns/CampaignTaxonomyWarnings.vue'
import { Button } from '@/components/ui/button'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useCampaignStore } from '@/stores/campaign-store'
import type { CampaignTaxonomyNode } from '@/types/campaign'

const route = useRoute()
const router = useRouter()
const campaignStore = useCampaignStore()
const { confirm: openConfirm } = useConfirmDialog()

const {
  activeCampaign,
  error,
  errorDetails,
  loading,
  saving,
  taxonomy,
  taxonomyPreviewStats,
  taxonomyWarnings,
} = storeToRefs(campaignStore)

const editableTaxonomy = ref<CampaignTaxonomyNode[]>([])
const selectedPath = ref<number[] | null>(null)

const campaignId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : ''
})

const parsePathFromQuery = (value: unknown): number[] | null => {
  if (typeof value !== 'string' || !value.trim()) return null

  const path = value
    .split('.')
    .map((segment) => Number(segment))
    .filter((segment) => Number.isInteger(segment) && segment >= 0)

  return path.length ? path : null
}

const serializePath = (path: number[] | null) => (path?.length ? path.join('.') : null)

const cloneTaxonomy = (nodes: CampaignTaxonomyNode[]) =>
  JSON.parse(JSON.stringify(nodes)) as CampaignTaxonomyNode[]

const getNodeAtPath = (
  nodes: CampaignTaxonomyNode[],
  path: number[] | null,
): CampaignTaxonomyNode | null => {
  if (!path?.length) return null

  let current: CampaignTaxonomyNode | undefined
  let level = nodes

  for (const index of path) {
    current = level[index]
    if (!current) return null
    level = current.children ?? []
  }

  return current ?? null
}

const replaceNodeAtPath = (
  nodes: CampaignTaxonomyNode[],
  path: number[],
  nextNode: CampaignTaxonomyNode,
): CampaignTaxonomyNode[] =>
  nodes.map((node, index) => {
    if (index !== path[0]) {
      return node
    }

    if (path.length === 1) {
      return nextNode
    }

    return {
      ...node,
      children: replaceNodeAtPath(node.children ?? [], path.slice(1), nextNode),
    }
  })

const selectedNode = computed(() => getNodeAtPath(editableTaxonomy.value, selectedPath.value))
const hasUnsavedChanges = computed(
  () => JSON.stringify(editableTaxonomy.value) !== JSON.stringify(taxonomy.value),
)

const syncEditableTaxonomy = () => {
  editableTaxonomy.value = cloneTaxonomy(taxonomy.value)

  if (!editableTaxonomy.value.length) {
    selectedPath.value = null
    return
  }

  const current = getNodeAtPath(editableTaxonomy.value, selectedPath.value)
  if (!current) {
    selectedPath.value = parsePathFromQuery(route.query.node) ?? [0]
  }
}

const loadTaxonomy = async () => {
  if (!campaignId.value) return

  const [campaign, taxonomyData] = await Promise.all([
    campaignStore.fetchCampaign(campaignId.value),
    campaignStore.fetchTaxonomy(campaignId.value),
  ])

  if (!campaign) {
    toast.error(campaignStore.error || 'Failed to load campaign')
    return
  }

  if (!taxonomyData) {
    toast.error(campaignStore.error || 'Failed to load taxonomy')
  }
}

const openDetailView = async () => {
  if (!campaignId.value) return

  await router.push({
    name: 'super-admin-campaign-detail',
    params: { id: campaignId.value },
  })
}

const handleSelectNode = (path: number[]) => {
  selectedPath.value = path
}

const handleApplyNode = (node: CampaignTaxonomyNode) => {
  if (!selectedPath.value) return
  editableTaxonomy.value = replaceNodeAtPath(editableTaxonomy.value, selectedPath.value, node)
}

const handleResetDraft = () => {
  syncEditableTaxonomy()
}

const handleSaveTaxonomy = async () => {
  if (!campaignId.value) return

  const updated = await campaignStore.updateTaxonomy(campaignId.value, {
    taxonomy: editableTaxonomy.value,
  })

  if (!updated) {
    toast.error(campaignStore.error || 'Failed to update taxonomy')
    return
  }

  toast.success('Taxonomy saved successfully')
}

const handleApproveTaxonomy = () => {
  if (!campaignId.value) return

  openConfirm({
    title: 'Approve taxonomy?',
    description:
      'Approving the taxonomy finalizes the current structure and enables campaign launch.',
    confirmText: 'Approve taxonomy',
    cancelText: 'Keep editing',
    async onConfirm() {
      if (hasUnsavedChanges.value) {
        const updated = await campaignStore.updateTaxonomy(campaignId.value, {
          taxonomy: editableTaxonomy.value,
        })

        if (!updated) {
          toast.error(campaignStore.error || 'Failed to update taxonomy')
          return
        }
      }

      const approved = await campaignStore.approveTaxonomy(campaignId.value)
      if (!approved) {
        toast.error(campaignStore.error || 'Failed to approve taxonomy')
        return
      }

      toast.success('Taxonomy approved successfully')
    },
  })
}

watch(
  taxonomy,
  () => {
    syncEditableTaxonomy()
  },
  { deep: true, immediate: true },
)

watch(
  selectedPath,
  async (path) => {
    const nextQuery = { ...route.query }
    const serializedPath = serializePath(path)

    if (serializedPath) {
      nextQuery.node = serializedPath
    } else {
      delete nextQuery.node
    }

    await router.replace({ query: nextQuery })
  },
  { deep: true },
)

watch(
  () => route.query.node,
  (nodeQuery) => {
    const nextPath = parsePathFromQuery(nodeQuery)
    if (JSON.stringify(nextPath) !== JSON.stringify(selectedPath.value)) {
      selectedPath.value = nextPath
    }
  },
  { immediate: true },
)

watch(
  () => route.params.id,
  async () => {
    await loadTaxonomy()
  },
)

onMounted(async () => {
  await loadTaxonomy()
})
</script>

<template>
  <main class="bg-page-bg min-h-[calc(100vh-72px)] p-6">
    <section class="mx-auto max-w-7xl">
      <header class="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-semibold">Campaign Taxonomy</h1>
          <p class="text-muted mt-2 text-sm">
            Review, edit, and approve the generated taxonomy before launch.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button variant="secondary" @click="openDetailView">Back To Campaign</Button>
          <Button
            variant="secondary"
            :disabled="saving || !hasUnsavedChanges"
            @click="handleResetDraft"
          >
            Reset Draft
          </Button>
          <Button :disabled="saving || !hasUnsavedChanges" @click="handleSaveTaxonomy">
            {{ saving ? 'Saving...' : 'Save Taxonomy' }}
          </Button>
          <Button
            :disabled="saving || !campaignStore.canApproveTaxonomy"
            @click="handleApproveTaxonomy"
          >
            {{ saving ? 'Working...' : 'Approve Taxonomy' }}
          </Button>
        </div>
      </header>

      <div
        v-if="error"
        class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <p>{{ error }}</p>
        <ul v-if="errorDetails.length" class="mt-2 list-disc space-y-1 pl-5 text-xs text-red-600">
          <li v-for="detail in errorDetails" :key="detail">{{ detail }}</li>
        </ul>
      </div>

      <div class="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <section class="border-border bg-background rounded-xl border p-6">
          <template v-if="loading && !activeCampaign">
            <div class="space-y-3">
              <div class="h-5 w-56 animate-pulse rounded bg-slate-200" />
              <div class="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div class="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
          </template>

          <template v-else-if="activeCampaign">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 class="text-foreground text-lg font-semibold">{{ activeCampaign.name }}</h2>
                <p class="mt-2 text-sm text-slate-500">{{ activeCampaign.domain_description }}</p>
              </div>
              <div
                class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                Status: {{ activeCampaign.status }}
              </div>
            </div>

            <dl class="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <dt class="text-muted text-xs font-semibold uppercase">Campaign ID</dt>
                <dd class="mt-1 text-sm text-slate-700">{{ activeCampaign.id }}</dd>
              </div>
              <div>
                <dt class="text-muted text-xs font-semibold uppercase">Industry</dt>
                <dd class="mt-1 text-sm text-slate-700">{{ activeCampaign.industry }}</dd>
              </div>
              <div>
                <dt class="text-muted text-xs font-semibold uppercase">Target Depth</dt>
                <dd class="mt-1 text-sm text-slate-700">{{ activeCampaign.target_depth }}</dd>
              </div>
              <div>
                <dt class="text-muted text-xs font-semibold uppercase">Approved At</dt>
                <dd class="mt-1 text-sm text-slate-700">
                  {{
                    activeCampaign.taxonomy_approved_at
                      ? new Date(activeCampaign.taxonomy_approved_at).toLocaleString()
                      : 'Not approved'
                  }}
                </dd>
              </div>
            </dl>
          </template>

          <template v-else>
            <p class="text-sm text-slate-500">Campaign not found or unavailable.</p>
          </template>
        </section>

        <div class="space-y-6">
          <section class="border-border bg-background rounded-xl border p-6">
            <h2 class="text-foreground text-lg font-semibold">Preview Stats</h2>

            <dl class="mt-4 grid grid-cols-2 gap-4">
              <div>
                <dt class="text-muted text-xs font-semibold uppercase">Total Nodes</dt>
                <dd class="mt-1 text-lg font-semibold text-slate-800">
                  {{ taxonomyPreviewStats?.total_nodes ?? 0 }}
                </dd>
              </div>
              <div>
                <dt class="text-muted text-xs font-semibold uppercase">Countries</dt>
                <dd class="mt-1 text-lg font-semibold text-slate-800">
                  {{ taxonomyPreviewStats?.countries ?? 0 }}
                </dd>
              </div>
              <div>
                <dt class="text-muted text-xs font-semibold uppercase">States</dt>
                <dd class="mt-1 text-lg font-semibold text-slate-800">
                  {{ taxonomyPreviewStats?.states ?? 0 }}
                </dd>
              </div>
              <div>
                <dt class="text-muted text-xs font-semibold uppercase">Cities</dt>
                <dd class="mt-1 text-lg font-semibold text-slate-800">
                  {{ taxonomyPreviewStats?.cities ?? 0 }}
                </dd>
              </div>
            </dl>
          </section>

          <CampaignTaxonomyWarnings :warnings="taxonomyWarnings" />
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section class="border-border bg-background rounded-xl border p-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="text-foreground text-lg font-semibold">Taxonomy Tree</h2>
              <p class="mt-2 text-sm text-slate-500">
                Select a node to inspect and update its draft content.
              </p>
            </div>
            <div
              v-if="hasUnsavedChanges"
              class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
            >
              Unsaved changes
            </div>
          </div>

          <div v-if="loading && !taxonomy.length" class="mt-6 space-y-3">
            <div class="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div class="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            <div class="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
          </div>

          <div v-else-if="editableTaxonomy.length" class="mt-6">
            <CampaignTaxonomyTree
              :nodes="editableTaxonomy"
              :selected-path="selectedPath"
              @select="handleSelectNode"
            />
          </div>

          <p v-else class="mt-6 text-sm text-slate-500">
            No taxonomy data is available for this campaign yet.
          </p>
        </section>

        <CampaignTaxonomyNodeEditor
          :node="selectedNode"
          :loading="saving"
          @apply="handleApplyNode"
        />
      </div>
    </section>
  </main>
</template>
