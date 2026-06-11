<script setup lang="ts">
import { FolderOpen, Plus } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import type { Jurisdiction } from '@/api/jurisdiction'
import JurisdictionDialog from '@/components/composables/jurisdiction/dialogs/JurisdictionDialog.vue'
import JurisdictionCard from '@/components/composables/jurisdiction/JurisdictionCard.vue'
import { useJurisdictionStore } from '@/stores/jurisdiction-store'

interface NestedJurisdiction extends Jurisdiction {
  depth: number
}

const props = withDefaults(
  defineProps<{
    jurisdiction: Jurisdiction | null
    activeOrganizationId: string
    isLoading?: boolean
  }>(),
  {
    isLoading: false,
  },
)

const router = useRouter()
const jurisdictionStore = useJurisdictionStore()
const { jurisdictionStatsById } = storeToRefs(jurisdictionStore)

const subJurisdictionModalOpen = ref(false)
const subJurisdictionSaving = ref(false)
const subJurisdictionForm = ref({ name: '', description: '' })

const subJurisdictions = computed(() => {
  if (!props.jurisdiction) return []

  const walk = (parentId: string, depth = 0): NestedJurisdiction[] =>
    jurisdictionStore.jurisdictions
      .filter((j) => j.parent_id === parentId)
      .flatMap((child) => [{ ...child, depth }, ...walk(child.id, depth + 1)])

  return walk(props.jurisdiction.id)
})

const formatRelativeTime = (dateString?: string | null) => {
  if (!dateString) return 'Not available'
  const timestamp = new Date(dateString).getTime()
  if (Number.isNaN(timestamp)) return 'Not available'
  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(timestamp).toLocaleDateString()
}

const resolveRevisionLabel = (item: unknown) => {
  if (typeof item === 'string') return item
  if (!item || typeof item !== 'object') return null
  const data = item as {
    summary?: string
    change_summary?: string
    title?: string
    name?: string
    description?: string
  }
  return data.summary || data.change_summary || data.title || data.name || data.description || null
}

const resolveChangeCount = (jurisdictionId: string) =>
  jurisdictionStatsById.value[jurisdictionId]?.change_count ?? 0

const resolveChangeItems = (jurisdictionId: string) => {
  const stats = jurisdictionStatsById.value[jurisdictionId]
  const revisions = stats?.revisions ?? []
  return revisions
    .map((item) => resolveRevisionLabel(item))
    .filter((item): item is string => Boolean(item))
    .concat(stats?.change_summary ? [stats.change_summary] : [])
}

const resolveChangeSeverity = (jurisdictionId: string) => {
  const stats = jurisdictionStatsById.value[jurisdictionId]
  const severity = stats?.severity?.toLowerCase()
  if (severity === 'major' || severity === 'minor') return severity
  if (stats?.change_count === 0) return 'none'
  return stats?.change_count ? 'major' : 'none'
}

const resolveLastChangeLabel = (jurisdictionId: string) => {
  const lastChange = jurisdictionStatsById.value[jurisdictionId]?.last_change_at
  return lastChange ? formatRelativeTime(lastChange) : 'Not available'
}

const openSubJurisdictionModal = () => {
  if (!props.jurisdiction?.id) return
  subJurisdictionModalOpen.value = true
  subJurisdictionForm.value = { name: '', description: '' }
}

const updateSubJurisdictionForm = (payload: Partial<{ name: string; description: string }>) => {
  subJurisdictionForm.value = { ...subJurisdictionForm.value, ...payload }
}

const closeSubJurisdictionModal = () => {
  subJurisdictionModalOpen.value = false
}

const createSubJurisdiction = async () => {
  if (!props.jurisdiction || subJurisdictionSaving.value) return

  if (!subJurisdictionForm.value.name.trim()) return toast.error('Name required')

  subJurisdictionSaving.value = true
  try {
    const description = subJurisdictionForm.value.description.trim()
    const created = await jurisdictionStore.addJurisdiction(props.jurisdiction.project_id, {
      name: subJurisdictionForm.value.name.trim(),
      description: description || null,
      parent_id: props.jurisdiction.id,
    })

    if (created) {
      closeSubJurisdictionModal()
      toast.success(`"${created.name}" added successfully`)
    } else if (jurisdictionStore.error) {
      toast.error(jurisdictionStore.error)
    }
  } finally {
    subJurisdictionSaving.value = false
  }
}

const goToJurisdiction = (id: string) => {
  router.push({
    path: `/app/jurisdictions/${id}`,
    query: { organizationId: props.activeOrganizationId },
  })
}

watch(
  () => ({
    orgId: props.activeOrganizationId,
    jurisdictionIds: subJurisdictions.value.map((node) => node.id),
  }),
  ({ orgId, jurisdictionIds }) => {
    if (!orgId || jurisdictionIds.length === 0) return
    jurisdictionStore.fetchJurisdictionStatsForIds(jurisdictionIds, orgId)
  },
  { deep: true },
)
</script>

<template>
  <section class="bg-background rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
    <div class="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <h3 class="text-lg font-semibold text-[#1F1F1F]">Sub-Jurisdictions</h3>

      <button
        class="btn--secondary btn--with-icon btn--sm sm-btn--lg"
        :disabled="isLoading || !jurisdiction"
        @click="openSubJurisdictionModal"
      >
        <Plus :size="16" /> Add Sub-jurisdiction
      </button>
    </div>

    <div v-if="isLoading" class="single-project-jurisdiction-list">
      <JurisdictionCard
        v-for="n in 3"
        :key="`subjurisdiction-skeleton-${n}`"
        title=""
        :is-loading="true"
      />
    </div>

    <div v-else-if="subJurisdictions.length === 0" class="single-project-empty-card border-dashed">
      <div class="single-project-empty-icon">
        <FolderOpen :size="40" :absolute-stroke-width="true" />
      </div>
      <p class="text-preset-label-lg text-foreground">No Sub-jurisdictions added</p>
      <p class="text-muted text-preset-body-sm mt-1 max-w-155">
        Add a sub-jurisdiction to break down this domain into focused areas for monitoring.
      </p>
    </div>

    <div v-else class="single-project-jurisdiction-list">
      <JurisdictionCard
        v-for="node in subJurisdictions"
        :key="node.id"
        :title="node.name"
        :description="node.description"
        :change-count="resolveChangeCount(node.id)"
        :change-items="resolveChangeItems(node.id)"
        :change-severity="resolveChangeSeverity(node.id)"
        :last-change-label="resolveLastChangeLabel(node.id)"
        :indent="node.depth * 16"
        @click="goToJurisdiction(node.id)"
      />
    </div>
    <JurisdictionDialog
      :open="subJurisdictionModalOpen"
      :form="subJurisdictionForm"
      :loading="subJurisdictionSaving"
      @update:open="(value) => !value && closeSubJurisdictionModal()"
      @update:form="updateSubJurisdictionForm"
      @submit="createSubJurisdiction"
      @cancel="closeSubJurisdictionModal"
    />
  </section>
</template>
