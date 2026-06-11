<script setup lang="ts">
import axios from 'axios'
import { CircleAlert, CircleCheck, Clock3, Loader2, Sparkles } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import { blogApi, type BlogPost } from '@/api/blog'
import { jurisdictionApi } from '@/api/jurisdiction'
import { projectService } from '@/api/project'
import { superadminOrganizationsService } from '@/api/super-admin'
import MarkdownRenderer from '@/components/reusable/MarkdownRenderer'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Option = {
  id: string
  label: string
}

type GenerationStatus = 'idle' | 'checking' | 'pending' | 'generating' | 'completed' | 'error'

const ALL_PROJECTS_VALUE = '__all__'

const organizations = ref<Option[]>([])
const projects = ref<Option[]>([])
const jurisdictions = ref<Option[]>([])

const selectedOrganization = ref('')
const selectedProject = ref(ALL_PROJECTS_VALUE)
const selectedJurisdiction = ref('')

const loadingOrganizations = ref(false)
const loadingProjects = ref(false)
const loadingJurisdictions = ref(false)
const isGenerating = ref(false)
const isCheckingStatus = ref(false)
const isPublishing = ref(false)

const generationStatus = ref<GenerationStatus>('idle')
const generationJobId = ref<string | null>(null)
const blogPost = ref<BlogPost | null>(null)
const errorMessage = ref<string | null>(null)

const canGenerate = computed(() =>
  Boolean(selectedOrganization.value && selectedJurisdiction.value && !isGenerating.value),
)

const canCheckStatus = computed(() =>
  Boolean(
    selectedOrganization.value &&
    selectedJurisdiction.value &&
    !isGenerating.value &&
    !isCheckingStatus.value,
  ),
)

const hasGeneratedPost = computed(() => Boolean(blogPost.value))

const statusText = computed(() => {
  if (generationStatus.value === 'checking') return 'Checking for existing blog post...'
  if (generationStatus.value === 'pending') return 'Generation queued'
  if (generationStatus.value === 'generating') return 'Generation in progress'
  if (generationStatus.value === 'completed') return 'Blog post ready'
  if (generationStatus.value === 'error') return 'Generation check failed'
  return 'Not started'
})

const mapJobStatus = (status?: string): GenerationStatus => {
  const normalized = (status || '').toUpperCase()
  if (!normalized) return 'pending'
  if (normalized.includes('COMPLETE') || normalized.includes('SUCCESS')) return 'completed'
  if (
    normalized.includes('GENERAT') ||
    normalized.includes('RUNNING') ||
    normalized.includes('PROCESS')
  ) {
    return 'generating'
  }
  if (normalized.includes('PENDING') || normalized.includes('QUEUE')) return 'pending'
  if (normalized.includes('FAIL') || normalized.includes('ERROR')) return 'error'
  return 'pending'
}

const toOptions = (
  items: Array<{
    id?: string
    organization_id?: string
    organizationId?: string
    name?: string
    title?: string
    owner_name?: string
    customer_name?: string
    owner?: { name?: string }
    user?: { name?: string }
  }>,
): Option[] => {
  return items
    .map((item) => {
      const id = item.id || item.organization_id || item.organizationId || ''
      const orgName = item.name || item.title || ''
      const customerName =
        item.customer_name || item.owner_name || item.owner?.name || item.user?.name || ''
      const label = customerName ? `${orgName} (${customerName})` : orgName
      return { id, label }
    })
    .filter((item) => Boolean(item.id && item.label))
}

const parseOrganizations = (payload: unknown): Option[] => {
  const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

  if (Array.isArray(payload)) {
    return toOptions(
      payload as Array<{
        id?: string
        organization_id?: string
        organizationId?: string
        name?: string
        owner_name?: string
        customer_name?: string
        owner?: { name?: string }
        user?: { name?: string }
      }>,
    )
  }

  if (!payload || typeof payload !== 'object') return []

  const data = payload as {
    organisations?: unknown
    organizations?: unknown
    data?: unknown
  }

  const candidates = [
    ...asList(data.organisations),
    ...asList(data.organizations),
    ...asList(data.data),
    ...asList((data.data as { organisations?: unknown } | undefined)?.organisations),
    ...asList((data.data as { organizations?: unknown } | undefined)?.organizations),
  ]

  return toOptions(
    candidates as Array<{
      id?: string
      organization_id?: string
      organizationId?: string
      name?: string
      owner_name?: string
      customer_name?: string
      owner?: { name?: string }
      user?: { name?: string }
    }>,
  )
}

const resetOrganizationAndBelow = () => {
  organizations.value = []
  projects.value = []
  jurisdictions.value = []
  selectedOrganization.value = ''
  selectedProject.value = ALL_PROJECTS_VALUE
  selectedJurisdiction.value = ''
  blogPost.value = null
  generationStatus.value = 'idle'
  generationJobId.value = null
}

const resetProjectAndBelow = () => {
  projects.value = []
  jurisdictions.value = []
  selectedProject.value = ALL_PROJECTS_VALUE
  selectedJurisdiction.value = ''
  blogPost.value = null
  generationStatus.value = 'idle'
  generationJobId.value = null
}

const resetJurisdictionAndBelow = () => {
  jurisdictions.value = []
  selectedJurisdiction.value = ''
  blogPost.value = null
  generationStatus.value = 'idle'
  generationJobId.value = null
}

const loadOrganizations = async () => {
  loadingOrganizations.value = true
  errorMessage.value = null
  try {
    const res = await superadminOrganizationsService.listOrganizations({
      page: 1,
      limit: 100,
      sort_by: 'created_at',
      sort_order: 'desc',
    })
    organizations.value = parseOrganizations(res.data?.data)
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ||
        'Failed to load organizations'
      : 'Failed to load organizations'
    errorMessage.value = message
  } finally {
    loadingOrganizations.value = false
  }
}

const loadProjectsForOrganization = async (organizationId: string) => {
  loadingProjects.value = true
  errorMessage.value = null
  try {
    const res = await projectService.listProjects(organizationId, { page: 1, limit: 100 })
    const list = res.data?.data?.projects ?? []
    projects.value = list
      .map((project) => ({ id: project.id, label: project.title }))
      .filter((project) => Boolean(project.id && project.label))
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ||
        'Failed to load projects'
      : 'Failed to load projects'
    errorMessage.value = message
  } finally {
    loadingProjects.value = false
  }
}

const loadJurisdictions = async (organizationId: string, projectId?: string) => {
  loadingJurisdictions.value = true
  errorMessage.value = null
  try {
    const res =
      projectId && projectId !== ALL_PROJECTS_VALUE
        ? await jurisdictionApi.getByProject(organizationId, projectId)
        : await jurisdictionApi.getAll(organizationId)

    const list = res.data?.data?.jurisdictions ?? []
    jurisdictions.value = list
      .map((jurisdiction) => ({ id: jurisdiction.id, label: jurisdiction.name }))
      .filter((jurisdiction) => Boolean(jurisdiction.id && jurisdiction.label))
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ||
        'Failed to load jurisdictions'
      : 'Failed to load jurisdictions'
    errorMessage.value = message
  } finally {
    loadingJurisdictions.value = false
  }
}

const fetchExistingBlogPost = async () => {
  if (!selectedOrganization.value || !selectedJurisdiction.value) return

  isCheckingStatus.value = true
  generationStatus.value = 'checking'
  errorMessage.value = null

  try {
    const res = await blogApi.getBlogPost(selectedOrganization.value, selectedJurisdiction.value)
    blogPost.value = res.data?.data ?? null
    generationStatus.value = blogPost.value ? 'completed' : 'idle'
    if (blogPost.value) {
      toast.success('Existing blog post found for this jurisdiction')
    }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      blogPost.value = null
      generationStatus.value = generationJobId.value ? 'generating' : 'idle'
      return
    }

    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ||
        'Failed to check blog post'
      : 'Failed to check blog post'

    errorMessage.value = message
    generationStatus.value = 'error'
  } finally {
    isCheckingStatus.value = false
  }
}

const startGeneration = async () => {
  if (!selectedOrganization.value || !selectedJurisdiction.value) return

  isGenerating.value = true
  errorMessage.value = null
  blogPost.value = null

  try {
    const res = await blogApi.generateBlogPost(
      selectedOrganization.value,
      selectedJurisdiction.value,
    )
    const payload = res.data?.data

    generationJobId.value = payload?.job_id || null
    generationStatus.value = mapJobStatus(payload?.status)

    toast.success(res.data?.message || 'Blog generation triggered successfully')
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ||
        'Failed to generate blog post'
      : 'Failed to generate blog post'

    errorMessage.value = message
    generationStatus.value = 'error'
  } finally {
    isGenerating.value = false
  }
}

const publishBlogPost = async () => {
  if (!selectedOrganization.value || !selectedJurisdiction.value || !blogPost.value) return

  isPublishing.value = true
  errorMessage.value = null

  try {
    const res = await blogApi.publishBlogPost(
      selectedOrganization.value,
      selectedJurisdiction.value,
      {
        is_published: true,
      },
    )

    blogPost.value = res.data?.data ?? blogPost.value
    toast.success(res.data?.message || 'Blog post published successfully')
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ||
        'Failed to publish blog post'
      : 'Failed to publish blog post'

    errorMessage.value = message
    toast.error(message)
  } finally {
    isPublishing.value = false
  }
}

watch(selectedOrganization, async (organizationId) => {
  resetProjectAndBelow()
  if (!organizationId) return
  await loadProjectsForOrganization(organizationId)
  await loadJurisdictions(organizationId)
})

watch(selectedProject, async (projectId) => {
  if (!selectedOrganization.value) return
  resetJurisdictionAndBelow()
  await loadJurisdictions(selectedOrganization.value, projectId)
})

watch(selectedJurisdiction, async (jurisdictionId) => {
  blogPost.value = null
  generationJobId.value = null
  if (!jurisdictionId || !selectedOrganization.value) {
    generationStatus.value = 'idle'
    return
  }
  await fetchExistingBlogPost()
})

onMounted(() => {
  resetOrganizationAndBelow()
  void loadOrganizations()
})
</script>

<template>
  <div class="border-border bg-background mt-6 rounded-xl border p-6">
    <div class="mb-4 flex items-center gap-2">
      <Sparkles :size="18" class="text-primary" />
      <h2 class="text-foreground text-lg font-semibold">Blog Generation</h2>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- <div class="space-y-2">
        <label class="text-foreground text-sm font-medium">Customer</label>
        <Select v-model="selectedCustomer" :disabled="true">
          <SelectTrigger class="border-border text-foreground bg-background w-full">
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div> -->

      <div class="space-y-2">
        <label class="text-foreground text-sm font-medium">Organization</label>
        <Select v-model="selectedOrganization" :disabled="loadingOrganizations">
          <SelectTrigger class="border-border text-foreground bg-background w-full">
            <SelectValue
              :placeholder="
                loadingOrganizations ? 'Loading organizations...' : 'Select organization'
              "
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="organization in organizations"
              :key="organization.id"
              :value="organization.id"
            >
              {{ organization.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <label class="text-foreground text-sm font-medium">Project</label>
        <Select v-model="selectedProject" :disabled="!selectedOrganization || loadingProjects">
          <SelectTrigger class="border-border text-foreground bg-background w-full">
            <SelectValue
              :placeholder="
                !selectedOrganization
                  ? 'Select organization first'
                  : loadingProjects
                    ? 'Loading projects...'
                    : 'All projects'
              "
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL_PROJECTS_VALUE">All projects</SelectItem>
            <SelectItem v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <label class="text-foreground text-sm font-medium">Jurisdiction</label>
        <Select
          v-model="selectedJurisdiction"
          :disabled="!selectedOrganization || loadingJurisdictions"
        >
          <SelectTrigger class="border-border text-foreground bg-background w-full">
            <SelectValue
              :placeholder="
                !selectedOrganization
                  ? 'Select organization first'
                  : loadingJurisdictions
                    ? 'Loading jurisdictions...'
                    : 'Select jurisdiction'
              "
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="jurisdiction in jurisdictions"
              :key="jurisdiction.id"
              :value="jurisdiction.id"
            >
              {{ jurisdiction.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <Button
        variant="primary"
        size="md"
        :disabled="!canGenerate"
        :loading="isGenerating"
        @click="startGeneration"
      >
        Generate
      </Button>
      <Button
        variant="secondary"
        size="md"
        :disabled="!canCheckStatus"
        :loading="isCheckingStatus"
        @click="fetchExistingBlogPost"
      >
        Check generation status
      </Button>
    </div>

    <div class="border-border bg-page-bg mt-6 rounded-lg border p-4">
      <p class="text-foreground mb-2 text-sm font-semibold">Generation Status</p>
      <div class="text-muted flex items-center gap-2 text-sm">
        <Clock3 v-if="generationStatus === 'idle' || generationStatus === 'pending'" :size="16" />
        <Loader2
          v-else-if="generationStatus === 'checking' || generationStatus === 'generating'"
          :size="16"
          class="animate-spin"
        />
        <CircleCheck v-else-if="generationStatus === 'completed'" :size="16" class="text-success" />
        <CircleAlert v-else :size="16" class="text-error" />
        <span>{{ statusText }}</span>
        <span v-if="generationJobId" class="text-muted text-xs">Job: {{ generationJobId }}</span>
      </div>
    </div>

    <div class="border-border bg-background mt-6 rounded-lg border p-4">
      <div class="mb-3 flex items-center justify-between gap-3">
        <p class="text-foreground text-sm font-semibold">Generated Post</p>
        <Button
          variant="primary"
          size="sm"
          :disabled="!hasGeneratedPost || (blogPost?.is_published ?? false)"
          :loading="isPublishing"
          @click="publishBlogPost"
        >
          {{ blogPost?.is_published ? 'Published' : 'Publish post' }}
        </Button>
      </div>

      <div class="border-border rounded-md border border-dashed p-4">
        <template v-if="blogPost">
          <h3 class="text-foreground text-base font-semibold">{{ blogPost.title }}</h3>
          <p v-if="blogPost.meta_description" class="text-muted mt-2 text-sm">
            {{ blogPost.meta_description }}
          </p>
          <div class="border-border mt-4 border-t pt-4">
            <MarkdownRenderer :markdown="blogPost.content" />
          </div>
        </template>
        <p v-else class="text-muted text-sm">No generated post yet for this jurisdiction.</p>
      </div>
    </div>

    <p v-if="errorMessage" class="text-error mt-4 text-sm">{{ errorMessage }}</p>
  </div>
</template>
