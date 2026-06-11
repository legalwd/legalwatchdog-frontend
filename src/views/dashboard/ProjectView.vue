<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import dashboardIllustration from '@/assets/images/dashboardillustration.png'
import ProjectsList from '@/components/composables/project/ProjectsList.vue'
import ProjectFormModal from '@/components/dashboard/ProjectFormModal.vue'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'
import { useProjectStore } from '@/stores/project-store'
import type { ProjectChangeItem } from '@/types/project'

const LAST_PROJECT_KEY = 'lwd:last-project-id'
const LAST_JURISDICTION_KEY = 'lwd:last-jurisdiction-id'

const clearLastProjectContext = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(LAST_PROJECT_KEY)
    localStorage.removeItem(LAST_JURISDICTION_KEY)
  } catch {
    // Ignore persistence errors
  }
}

const projectStore = useProjectStore()
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()

const { projects, loading, error, projectStatsById } = storeToRefs(projectStore)
const { organizations } = storeToRefs(organizationStore)

const router = useRouter()
const route = useRoute()

const showProjectModal = ref(false)
const projectModalMode = ref<'create' | 'edit'>('create')
const organizationsRequested = ref(false)
const projectSaving = ref(false)

const inviteForm = ref({
  email: '',
  role: 'Member',
})

const inviteMessage = ref<string | null>(null)
const inviteError = ref<string | null>(null)

const organizationId = computed(() => {
  const id = route.params.organizationId
  return typeof id === 'string' ? id : ''
})

const organizationName = computed(() => {
  const currentId = organizationId.value
  if (!currentId) return ''
  return organizations.value.find((org) => org.id === currentId)?.name || 'Organization'
})

const organizationOptions = computed(() =>
  organizations.value.map((org) => ({ id: org.id, name: org.name })),
)

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

const resolveChangeItemLabel = (item: ProjectChangeItem | string) => {
  if (typeof item === 'string') return item
  return (
    item.summary ||
    item.change_summary ||
    item.title ||
    item.name ||
    item.description ||
    'Change detected'
  )
}

const changeItemsByProjectId = computed<Record<string, string[]>>(() => {
  const entries = Object.entries(projectStatsById.value)
  return entries.reduce<Record<string, string[]>>((acc, [projectId, stats]) => {
    if (Array.isArray(stats.change_items)) {
      acc[projectId] = stats.change_items.map((item) => resolveChangeItemLabel(item))
    }
    return acc
  }, {})
})

const changeCountByProjectId = computed<Record<string, number>>(() => {
  const entries = Object.entries(projectStatsById.value)
  return entries.reduce<Record<string, number>>((acc, [projectId, stats]) => {
    if (typeof stats.change_count === 'number') {
      acc[projectId] = stats.change_count
    }
    return acc
  }, {})
})

const changeSeverityByProjectId = computed<Record<string, 'none' | 'minor' | 'major'>>(() => {
  const entries = Object.entries(projectStatsById.value)
  return entries.reduce<Record<string, 'none' | 'minor' | 'major'>>((acc, [projectId, stats]) => {
    const severity = stats.severity?.toLowerCase()
    if (severity === 'major' || severity === 'minor') {
      acc[projectId] = severity
    } else if (stats.change_count === 0) {
      acc[projectId] = 'none'
    }
    return acc
  }, {})
})

const lastChangeLabelByProjectId = computed<Record<string, string>>(() => {
  const entries = Object.entries(projectStatsById.value)
  return entries.reduce<Record<string, string>>((acc, [projectId, stats]) => {
    acc[projectId] = stats.last_change_at
      ? formatRelativeTime(stats.last_change_at)
      : 'Not available'
    return acc
  }, {})
})

const ensureOrganizations = async () => {
  if (organizations.value.length || organizationsRequested.value) return

  let userId = authStore.user?.id
  if (!userId) {
    const loaded = await authStore.loadCurrentUser?.()
    userId = loaded?.id
  }

  if (userId) {
    organizationsRequested.value = true
    await organizationStore.fetchOrganizations(userId)
  }
}

const openCreateModal = async () => {
  await ensureOrganizations()

  if (!organizationId.value && !organizations.value.length) {
    projectStore.setError('Add an organization before creating a project.')
    router.push({ name: 'organizations' })
    return
  }

  projectModalMode.value = 'create'
  showProjectModal.value = true
  projectStore.setError(null)
}

const closeProjectModal = () => {
  showProjectModal.value = false
  projectStore.setError(null)
}

const handleProjectSave = async (payload: {
  title: string
  description: string | null
  organizationId: string
  projectId?: string
}) => {
  projectStore.setError(null)
  if (projectSaving.value) return
  projectSaving.value = true

  const orgIdToUse = payload.organizationId || organizationId.value

  if (!orgIdToUse) {
    projectStore.setError('Select an organization before creating a project.')
    projectSaving.value = false
    return
  }

  // EDIT PROJECT
  if (projectModalMode.value === 'edit' && payload.projectId) {
    try {
      await projectStore.updateProject(orgIdToUse, payload.projectId, {
        title: payload.title,
        description: payload.description,
      })
      toast.success('Project updated successfully.')
      closeProjectModal()
    } catch (error) {
      void error
      toast.error(projectStore.error || 'Could not update project')
    }
    projectSaving.value = false
    return
  }

  // CREATE PROJECT
  try {
    const newProject = await projectStore.addProject({
      title: payload.title,
      description: payload.description,
      organization_id: orgIdToUse,
    })

    if (newProject) {
      toast.success('Project created successfully.')
      closeProjectModal()

      router.push({
        name: 'organization-projects',
        params: { organizationId: orgIdToUse },
      })
    }
  } catch (error) {
    void error
    toast.error(projectStore.error || 'Could not create project')
  } finally {
    projectSaving.value = false
  }
}

const goToProject = (id: string) => {
  router.push({
    name: 'project-detail',
    params: { organizationId: organizationId.value, id },
  })
}

onMounted(async () => {
  if (organizationId.value) {
    await projectStore.fetchProjects(organizationId.value)
    clearLastProjectContext()
  } else {
    projectStore.setError('Select an organization to view projects.')
  }
  void ensureOrganizations()
})

watch(
  () => route.params.organizationId,
  async (newVal) => {
    const id = typeof newVal === 'string' ? newVal : ''
    inviteMessage.value = null
    inviteError.value = null
    inviteForm.value.email = ''
    inviteForm.value.role = 'Member'

    if (id) {
      await projectStore.fetchProjects(id)
      clearLastProjectContext()
    } else {
      projectStore.projects = []
      projectStore.setError('Select an organization to view projects.')
    }
  },
)

watch(
  () => ({
    organizationId: organizationId.value,
    projectIds: projects.value.map((project) => project.id),
  }),
  ({ organizationId: orgId, projectIds }) => {
    if (!orgId || projectIds.length === 0) return
    projectStore.fetchProjectStatsForProjects(orgId, projectIds)
  },
  { deep: true },
)
</script>

<template>
  <section class="app-container min-h-11/12 flex-1 bg-gray-50 px-0 py-10 lg:py-14">
    <div
      v-if="!organizationId"
      class="bg-background mx-auto max-w-4xl rounded-2xl p-10 text-center shadow-sm ring-1 ring-gray-100"
    >
      <h1 class="text-2xl font-bold text-gray-900">Choose an organization first</h1>
      <p class="mt-2 text-sm">
        Projects live under organizations. Select an organization to view or create projects.
      </p>
      <div class="mt-6 flex justify-center">
        <RouterLink to="/app/organizations" class="btn--default btn--lg">
          Go to Organizations
        </RouterLink>
      </div>
    </div>
    <div v-else class="mx-auto max-w-7xl space-y-6">
      <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div>
          <div v-if="error" class="flex min-h-150 items-center justify-center">
            <div class="text-center">
              <p class="mb-4 text-red-600">{{ error }}</p>
              <button
                :disabled="!organizationId"
                class="btn btn--link"
                @click="organizationId && projectStore.fetchProjects(organizationId)"
              >
                Retry
              </button>
            </div>
          </div>

          <div
            v-else-if="projects.length === 0 && !loading"
            class="flex items-center justify-center"
          >
            <div class="flex flex-col items-center self-center text-center">
              <div class="mt-5 mb-10 flex justify-center">
                <img :src="dashboardIllustration" alt="Dashboard Illustration" />
              </div>
              <h2 class="text-preset-heading-sm mb-3 text-gray-900">No Project Created</h2>
              <p class="text-preset-body-md mb-1">
                Create a project to start tracking changes on any website.
              </p>
              <p class="text-preset-body-md mb-8">
                Our AI will monitor the sites and send you summarized updates automatically.
              </p>
              <button class="btn--default btn--lg btn--with-icon" @click="openCreateModal">
                <Plus :size="16" />
                Create Project
              </button>
            </div>
          </div>

          <div v-else class="space-y-8">
            <!-- Header with Create Button -->
            <div
              class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
            >
              <h1 class="text-3xl font-bold text-gray-900 lg:text-4xl">
                {{ organizationName || 'Organization' }}'s Projects
              </h1>
              <button class="btn--with-icon btn--lg btn--default" @click="openCreateModal">
                <Plus :size="16" />
                Create Project
              </button>
            </div>

            <!-- Projects List -->
            <ProjectsList
              :projects="projects"
              :loading="loading"
              :change-items-by-project-id="changeItemsByProjectId"
              :change-count-by-project-id="changeCountByProjectId"
              :change-severity-by-project-id="changeSeverityByProjectId"
              :last-change-label-by-project-id="lastChangeLabelByProjectId"
              @project-click="(project) => goToProject(project.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  <ProjectFormModal
    :open="showProjectModal"
    :mode="projectModalMode"
    :loading="projectSaving"
    :organizations="organizationOptions"
    :default-organization-id="organizationId ?? (organizations[0]?.id || undefined)"
    :error="projectStore.error"
    @close="closeProjectModal"
    @save="handleProjectSave"
  />
</template>
