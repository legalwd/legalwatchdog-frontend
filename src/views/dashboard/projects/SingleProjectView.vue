<script setup lang="ts">
import { FolderOpen, Plus, Settings } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import JurisdictionDialog from '@/components/composables/jurisdiction/dialogs/JurisdictionDialog.vue'
import JurisdictionCard from '@/components/composables/jurisdiction/JurisdictionCard.vue'
import ProjectInstructionDialog from '@/components/composables/project/ProjectInstructionDialog.vue'
import DetailHeader from '@/components/dashboard/DetailHeader.vue'
import ProjectFormModal from '@/components/dashboard/ProjectFormModal.vue'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import { useAuthStore } from '@/stores/auth-store'
import { useJurisdictionStore } from '@/stores/jurisdiction-store'
import { useOrganizationStore } from '@/stores/organization-store'
import { useProjectStore } from '@/stores/project-store'

const LAST_PROJECT_KEY = 'lwd:last-project-id'
const LAST_JURISDICTION_KEY = 'lwd:last-jurisdiction-id'

const clearLastJurisdictionId = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(LAST_JURISDICTION_KEY)
  } catch {
    // Ignore persistence errors
  }
}

const saveLastProjectId = (projectId: string) => {
  if (!projectId || typeof window === 'undefined') return
  try {
    localStorage.setItem(LAST_PROJECT_KEY, projectId)
  } catch {
    // Ignore persistence errors
  }
}

const route = useRoute()
const router = useRouter()

const projectStore = useProjectStore()
const organizationStore = useOrganizationStore()
const jurisdictionStore = useJurisdictionStore()
const authStore = useAuthStore()

const { projects, loading: projectLoading, error: projectError } = storeToRefs(projectStore)
const { organizations } = storeToRefs(organizationStore)
const {
  jurisdictions,
  jurisdictionStatsById,
  loading: jurisdictionsLoading,
  error: jurisdictionsError,
} = storeToRefs(jurisdictionStore)

const organizationId = computed(() =>
  typeof route.params.organizationId === 'string' ? route.params.organizationId : '',
)
const projectId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const project = computed(() => projects.value.find((p) => p.id === projectId.value) || null)

const filteredJurisdictions = computed(() =>
  jurisdictions.value
    .filter((j) => j.project_id === projectId.value && !j.is_deleted && !j.parent_id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
)

const addJurisdictionOpen = ref(false)
const jurisdictionForm = ref({ name: '', description: '' })

const projectModalOpen = ref(false)
const projectModalMode = ref<'edit'>('edit')
const projectSaving = ref(false)
const jurisdictionSaving = ref(false)
const expandedJurisdictionIds = ref<Record<string, boolean>>({})

const organizationsRequested = ref(false)
const projectRequested = ref(false)
const jurisdictionsRequested = ref(false)

const organizationOptions = computed(() =>
  organizations.value.map((org) => ({ id: org.id, name: org.name })),
)

const projectFormModalProps = computed(() => ({
  open: projectModalOpen.value,
  mode: projectModalMode.value,
  loading: projectSaving.value,
  organizations: organizationOptions.value,
  defaultOrganizationId: organizationId.value,
  ...(project.value ? { project: project.value } : {}),
  error: projectError.value,
  onClose: () => {
    projectModalOpen.value = false
  },
  onSave: handleProjectSave,
}))

// const organizationName = computed(
//   () => organizations.value.find((org) => org.id === organizationId.value)?.name || 'Organization',
// )

const projectInstruction = ref('')
const originalProjectInstruction = ref('')
const instructionSaving = ref(false)
const instructionModalOpen = ref(false)
const isInstructionDirty = computed(
  () => projectInstruction.value.trim() !== originalProjectInstruction.value.trim(),
)
const instructionActionLabel = computed(() =>
  projectInstruction.value.trim() ? 'Edit Instruction' : 'Add Instruction',
)
const instructionPlaceholder = computed(() =>
  projectInstruction.value.trim()
    ? 'Describe the monitoring focus, keywords, and context that apply to this project.'
    : 'No instruction set. Add guidance for this project.',
)

const ensureOrganizations = async () => {
  if (organizations.value.length || organizationsRequested.value) return
  organizationsRequested.value = true
  let userId = authStore.user?.id
  if (!userId && authStore.accessToken) {
    const loaded = await authStore.loadCurrentUser?.()
    userId = loaded?.id
  }
  if (userId) await organizationStore.fetchOrganizations(userId)
}

const loadProject = async () => {
  if (!organizationId.value) return
  projectRequested.value = true
  if (!projects.value.length || !project.value) {
    await projectStore.fetchProjects(organizationId.value)
  }
}

const loadJurisdictions = async () => {
  if (!organizationId.value || !projectId.value) return
  jurisdictionsRequested.value = true
  await jurisdictionStore.fetchJurisdictions(projectId.value, organizationId.value)
}

const openEditProject = () => {
  projectModalMode.value = 'edit'
  projectModalOpen.value = true
}

const handleProjectSave = async (payload: {
  title: string
  description: string | null
  organizationId: string
  projectId?: string
}) => {
  if (!projectId.value || projectSaving.value) return
  projectSaving.value = true
  try {
    await projectStore.updateProject(payload.organizationId, projectId.value, {
      title: payload.title,
      description: payload.description,
    })
    projectModalOpen.value = false
    toast.success('Project updated')
    await loadProject()
  } catch (error) {
    void error
    toast.error(projectStore.error || 'Could not update project')
  } finally {
    projectSaving.value = false
  }
}

const deleteProject = async () => {
  if (!projectId.value || !organizationId.value) return
  const confirmed = confirm('Delete this project? This action cannot be undone.')
  if (!confirmed) return
  await projectStore.deleteProject(projectId.value, organizationId.value)
  toast.success('Project deleted')
  router.push({ name: 'organization-projects', params: { organizationId: organizationId.value } })
}

const openAddJurisdiction = () => {
  jurisdictionForm.value = { name: '', description: '' }
  addJurisdictionOpen.value = true
}

const handleCreateJurisdiction = async () => {
  if (!projectId.value || jurisdictionSaving.value) return
  if (!jurisdictionForm.value.name.trim()) {
    toast.error('Name is required')
    return
  }

  jurisdictionSaving.value = true
  try {
    const description = jurisdictionForm.value.description.trim()
    const created = await jurisdictionStore.addJurisdiction(projectId.value, {
      name: jurisdictionForm.value.name.trim(),
      description: description || null,
    })

    if (created) {
      toast.success('Jurisdiction added')
      addJurisdictionOpen.value = false
      await loadJurisdictions()
    } else if (jurisdictionStore.error) {
      toast.error(jurisdictionStore.error)
    }
  } finally {
    jurisdictionSaving.value = false
  }
}

const goToJurisdiction = (jurisdictionId: string) => {
  router.push({
    name: 'jurisdiction-detail',
    params: { id: jurisdictionId },
    query: { organizationId: organizationId.value },
  })
}

const handleDialogOpenChange = (val: boolean) => {
  addJurisdictionOpen.value = val
}

const handleDialogFormUpdate = (payload: Partial<{ name: string; description: string }>) => {
  jurisdictionForm.value = { ...jurisdictionForm.value, ...payload }
}

const closeAddJurisdiction = () => {
  addJurisdictionOpen.value = false
}

const openInstructionModal = () => {
  instructionModalOpen.value = true
}

const closeInstructionModal = () => {
  instructionModalOpen.value = false
}

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

const toggleJurisdictionExpanded = (jurisdictionId: string) => {
  expandedJurisdictionIds.value[jurisdictionId] = !expandedJurisdictionIds.value[jurisdictionId]
}

const saveProjectInstruction = async () => {
  if (!projectId.value) return
  instructionSaving.value = true
  try {
    await projectStore.updateProject(organizationId.value, projectId.value, {
      master_prompt: projectInstruction.value.trim() || null,
    })
    toast.success('Project instruction updated')
    const saved = projectInstruction.value.trim()
    originalProjectInstruction.value = saved
    projectInstruction.value = saved
    instructionModalOpen.value = false
    await loadProject()
  } catch (err) {
    console.error(err)
    toast.error(projectStore.error || 'Failed to update project instruction')
  } finally {
    instructionSaving.value = false
  }
}

watch(
  project,
  (val) => {
    const incoming = val?.master_prompt || ''
    projectInstruction.value = incoming
    originalProjectInstruction.value = incoming
  },
  { immediate: true },
)

onMounted(async () => {
  if (projectId.value) {
    saveLastProjectId(projectId.value)
  }
  clearLastJurisdictionId()
  await ensureOrganizations()
  await loadProject()
  await loadJurisdictions()
})

watch(
  () => route.params.id,
  async () => {
    if (projectId.value) {
      saveLastProjectId(projectId.value)
    }
    clearLastJurisdictionId()
    await loadProject()
    await loadJurisdictions()
  },
)

watch(
  () => route.params.organizationId,
  async () => {
    await ensureOrganizations()
    await loadProject()
    await loadJurisdictions()
  },
)

watch(
  () => ({
    orgId: organizationId.value,
    jurisdictionIds: filteredJurisdictions.value.map((jurisdiction) => jurisdiction.id),
  }),
  ({ orgId, jurisdictionIds }) => {
    if (!orgId || jurisdictionIds.length === 0) return
    jurisdictionStore.fetchJurisdictionStatsForIds(jurisdictionIds, orgId)
  },
  { deep: true },
)
</script>

<template>
  <main class="min-h-screen flex-1 px-4 py-6 lg:py-10">
    <div class="app-container mx-auto flex flex-col gap-6">
      <div class="flex flex-col gap-4">
        <DetailHeader
          :back-to="{ name: 'organization-projects', params: { organizationId } }"
          back-label="Back to projects"
        >
          <BreadcrumbItem>
            <BreadcrumbLink as-child>
              <RouterLink :to="{ name: 'organization-projects', params: { organizationId } }">
                Projects
              </RouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage class="text-foreground">
              {{ project?.title || 'Project' }}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <template #detail>
            <section class="single-project-card sm:p-8">
              <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div class="space-y-2">
                  <div v-if="!projectRequested || projectLoading" class="space-y-2">
                    <div class="skeleton-line h-7 w-48"></div>
                    <div class="skeleton-line h-4 w-72"></div>
                  </div>
                  <template v-else>
                    <h1 class="text-foreground text-2xl font-semibold sm:text-3xl">
                      {{ project?.title || 'Project title' }}
                    </h1>
                    <p class="text-muted text-sm">
                      {{
                        project?.description ||
                        'Monitor changes to this project and its jurisdictions.'
                      }}
                    </p>
                  </template>
                </div>

                <div class="flex items-center gap-3">
                  <div v-if="!projectRequested || projectLoading" class="flex items-center gap-3">
                    <div class="skeleton-line h-9 w-28 rounded-sm"></div>
                    <div class="skeleton-line h-10 w-10 rounded-lg"></div>
                  </div>
                  <template v-else>
                    <button
                      class="btn--secondary btn--sm sm:btn--md"
                      type="button"
                      @click="openInstructionModal"
                    >
                      {{ instructionActionLabel }}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <button class="single-project-icon-button" aria-label="Project settings">
                          <Settings :size="18" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-40">
                        <DropdownMenuItem @click="openEditProject">Edit</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" @click="deleteProject">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </template>
                </div>
              </div>
            </section>
          </template>
        </DetailHeader>
      </div>

      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-foreground text-lg font-semibold">
            Jurisdiction ({{ filteredJurisdictions.length }})
          </h2>
          <button
            class="btn--default btn--with-icon btn--sm sm:btn--lg"
            @click="openAddJurisdiction"
          >
            <Plus :size="16" />
            Add Jurisdiction
          </button>
        </div>

        <div
          v-if="!jurisdictionsRequested || jurisdictionsLoading"
          class="single-project-jurisdiction-list"
        >
          <JurisdictionCard
            v-for="n in 3"
            :key="`jurisdiction-skeleton-${n}`"
            title=""
            :is-loading="true"
          />
        </div>

        <div v-else>
          <div v-if="filteredJurisdictions.length" class="space-y-3">
            <div
              v-if="jurisdictionsError"
              class="bg-error-background text-error mb-3 rounded-lg px-4 py-3 text-sm"
            >
              {{ jurisdictionsError }}
            </div>

            <div class="single-project-jurisdiction-list">
              <JurisdictionCard
                v-for="j in filteredJurisdictions"
                :key="j.id"
                :title="j.name"
                :description="j.description"
                :change-count="resolveChangeCount(j.id)"
                :change-items="resolveChangeItems(j.id)"
                :change-severity="resolveChangeSeverity(j.id)"
                :last-change-label="resolveLastChangeLabel(j.id)"
                :expanded="!!expandedJurisdictionIds[j.id]"
                @click="goToJurisdiction(j.id)"
                @toggle="toggleJurisdictionExpanded(j.id)"
              />
            </div>
          </div>

          <div v-else class="single-project-empty-card border-dashed">
            <div class="single-project-empty-icon">
              <FolderOpen :size="40" :absolute-stroke-width="true" />
            </div>
            <p class="text-preset-label-lg text-foreground">No Jurisdictions added</p>
            <p class="text-muted text-preset-body-sm mt-1 max-w-155">
              A Jurisdiction is a specific focus area for your project. It acts as a targeted lens,
              directing our AI to monitor only the regions, sectors, or categories that matter to
              this project's goals
            </p>
          </div>
        </div>
      </section>
    </div>

    <ProjectFormModal v-bind="projectFormModalProps" />

    <ProjectInstructionDialog
      :open="instructionModalOpen"
      :instruction="projectInstruction"
      :placeholder="instructionPlaceholder"
      :saving="instructionSaving"
      :can-save="isInstructionDirty"
      @update:open="instructionModalOpen = $event"
      @update:instruction="projectInstruction = $event"
      @save="saveProjectInstruction"
      @cancel="closeInstructionModal"
    />

    <JurisdictionDialog
      :open="addJurisdictionOpen"
      :form="jurisdictionForm"
      :loading="jurisdictionSaving"
      title="Create Jurisdiction"
      description="Define the region or legal domain you want to monitor."
      name-label="Jurisdiction Name"
      name-placeholder="e.g. United Kingdom Immigration"
      description-label="Description"
      description-placeholder="What scope or topics will you track?"
      submit-text="Create Jurisdiction"
      @update:open="handleDialogOpenChange"
      @update:form="handleDialogFormUpdate"
      @submit="handleCreateJurisdiction"
      @cancel="closeAddJurisdiction"
    />
  </main>
</template>
