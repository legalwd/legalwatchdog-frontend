<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import type { Jurisdiction } from '@/api/jurisdiction'
import SourceDialog from '@/components/composables/jurisdiction/dialogs/SourceDialog.vue'
import JurisdictionSources from '@/components/composables/jurisdiction/JurisdictionSources.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useSourceStore } from '@/stores/source-store'
import type { Source, ScrapeFrequency, SourceType } from '@/types/source'

const props = withDefaults(
  defineProps<{
    jurisdiction: Jurisdiction | null
    projectName: string
    isLoading?: boolean
  }>(),
  {
    isLoading: false,
  },
)

const { confirm: openConfirm } = useConfirmDialog()
const sourceStore = useSourceStore()

const sources = computed(() => sourceStore.sources)
const sourcesLoading = computed(() => sourceStore.loading)
const sourcesError = computed(() => sourceStore.error)
const sourcesRequested = ref(false)
const showTabLoading = computed(
  () => props.isLoading || !sourcesRequested.value || sourcesLoading.value,
)

const addSourceModalOpen = ref(false)

const sourceForm = ref<{
  id?: string | null
  name: string
  url: string
  source_type: SourceType
  scrape_frequency: ScrapeFrequency
  is_active: boolean
}>({
  id: null,
  name: '',
  url: '',
  source_type: 'web',
  scrape_frequency: 'DAILY',
  is_active: true,
})

const jurisdictionInstruction = computed(() => props.jurisdiction?.prompt || '')

const loadSources = async () => {
  if (!props.jurisdiction?.id) return
  sourcesRequested.value = true
  await sourceStore.fetchSources(props.jurisdiction.id)
}

const handleSourcesAdded = async () => {
  if (props.jurisdiction?.id) {
    await sourceStore.fetchSources(props.jurisdiction.id)
  }
}

const openAddSourceModal = () => {
  addSourceModalOpen.value = true
}

const closeAddSourceModal = () => {
  addSourceModalOpen.value = false
  sourceStore.clearError()
  // Note: Form values are preserved unless successfully submitted
}

const handleAddSourceDialogToggle = (value: boolean) => {
  addSourceModalOpen.value = value
  if (!value) {
    sourceStore.clearError()
  }
}

const resetSourceForm = () => {
  sourceForm.value = {
    id: null,
    name: '',
    url: '',
    source_type: 'web',
    scrape_frequency: 'DAILY',
    is_active: true,
  }
}

const createSourceFromForm = async () => {
  if (!props.jurisdiction) return

  const name = sourceForm.value.name.trim()
  const url = sourceForm.value.url.trim()
  if (!url) return toast.error('URL required')

  const payload = {
    jurisdiction_id: props.jurisdiction.id,
    name,
    url,
    source_type: sourceForm.value.source_type,
    scrape_frequency: sourceForm.value.scrape_frequency,
    is_active: sourceForm.value.is_active,
  }

  const res = await sourceStore.createSource(payload)

  if (res) {
    resetSourceForm()
    closeAddSourceModal()
    toast.success('Source added successfully')
  } else if (sourceStore.error) {
    toast.error(sourceStore.error)
  }
}

const deleteSource = async (src: Source) => {
  openConfirm({
    title: 'Remove Source',
    description:
      'Do you want to archive (soft delete) this source or permanently delete it? Permanent delete cannot be undone.',
    confirmText: 'Delete Permanently',
    cancelText: 'Cancel',
    secondaryText: 'Archive',
    async onConfirm() {
      const ok = await sourceStore.deleteSource(src.id, true)
      if (ok) toast.success('Source permanently deleted')
    },
    onSecondary() {
      // Soft delete via PATCH is_active: false or is_deleted: true depending on API
      sourceStore
        .patchSource(src.id, { is_deleted: true })
        .then(() => toast.success('Source archived'))
        .catch(() => toast.error(sourceStore.error || 'Failed to archive source'))
    },
  })
}

watch(
  () => props.jurisdiction?.id,
  (id) => {
    sourcesRequested.value = false
    if (id) {
      loadSources()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4 p-6">
    <JurisdictionSources
      :sources="sources"
      :sources-loading="showTabLoading"
      :sources-error="sourcesError"
      :jurisdiction-id="jurisdiction?.id || ''"
      :jurisdiction-name="jurisdiction?.name || ''"
      :jurisdiction-description="jurisdiction?.description || ''"
      :project-description="projectName"
      :jurisdiction-prompt="jurisdictionInstruction"
      @add-manual="openAddSourceModal"
      @delete="deleteSource"
      @sources-added="handleSourcesAdded"
    />

    <SourceDialog
      :open="addSourceModalOpen"
      :editing-id="null"
      :form="sourceForm"
      :loading="sourcesLoading"
      :error="sourcesError"
      @update:open="handleAddSourceDialogToggle"
      @update:form="(payload) => (sourceForm = { ...sourceForm, ...payload })"
      @submit="createSourceFromForm()"
      @cancel="
        () => {
          resetSourceForm()
          closeAddSourceModal()
        }
      "
    />
  </div>
</template>
