<script setup lang="ts">
import axios from 'axios'
import { ExternalLink, FileText, Search } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { blogApi, type PublishedBlogPostListItem } from '@/api/blog'
import { superadminOrganizationsService } from '@/api/super-admin'
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

const organizations = ref<Option[]>([])
const selectedOrganization = ref('')
const queryTermsInput = ref('')
const router = useRouter()
const route = useRoute()
const LAST_ORG_KEY = 'superadmin:blog-posts:last-organization-id'

const posts = ref<PublishedBlogPostListItem[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const totalPages = ref(1)

const loadingOrganizations = ref(false)
const loadingPosts = ref(false)
const errorMessage = ref<string | null>(null)

const hasPosts = computed(() => posts.value.length > 0)
const selectedOrganizationLabel = computed(
  () =>
    organizations.value.find((organization) => organization.id === selectedOrganization.value)
      ?.label || '',
)

const buildPublicBlogHref = (post: PublishedBlogPostListItem) => {
  if (post.public_url) return post.public_url

  if (post.resource_path) {
    return `/resources/${post.resource_path.replace(/^\/+/, '')}`
  }

  if (post.slug) {
    return `/blog/${post.slug}`
  }

  return ''
}

const toOptions = (
  items: Array<{
    id?: string
    organization_id?: string
    organizationId?: string
    name?: string
    owner_name?: string
    customer_name?: string
    owner?: { name?: string }
    user?: { name?: string }
  }>,
): Option[] => {
  return items
    .map((item) => {
      const id = item.id || item.organization_id || item.organizationId || ''
      const orgName = item.name || ''
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

const getQueryTerms = (): string[] => {
  return queryTermsInput.value
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean)
}

const readLastOrganizationId = (): string => {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(LAST_ORG_KEY) || ''
  } catch {
    return ''
  }
}

const saveLastOrganizationId = (organizationId: string) => {
  if (typeof window === 'undefined' || !organizationId) return
  try {
    localStorage.setItem(LAST_ORG_KEY, organizationId)
  } catch {
    // ignore storage errors
  }
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

const loadPosts = async () => {
  if (!selectedOrganization.value) return

  loadingPosts.value = true
  errorMessage.value = null

  try {
    const queryTerms = getQueryTerms()
    const params: { query_terms?: string[]; page: number; limit: number } = {
      page: page.value,
      limit: limit.value,
    }

    if (queryTerms.length) {
      params.query_terms = queryTerms
    }

    const res = await blogApi.listPublishedBlogPosts(selectedOrganization.value, params)
    const data = res.data?.data

    posts.value = data?.items ?? []
    total.value = data?.pagination?.total ?? posts.value.length
    totalPages.value = data?.pagination?.total_pages ?? 1
    page.value = data?.pagination?.page ?? page.value
    limit.value = data?.pagination?.limit ?? limit.value
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ||
        'Failed to load blog posts'
      : 'Failed to load blog posts'

    errorMessage.value = message
    posts.value = []
  } finally {
    loadingPosts.value = false
  }
}

const searchPosts = async () => {
  page.value = 1
  await loadPosts()
}

const openPost = async (post: PublishedBlogPostListItem) => {
  const jurisdictionId = post.jurisdiction_id
  if (!selectedOrganization.value || !jurisdictionId) {
    toast.error('Missing jurisdiction information for this post')
    return
  }

  await router.push({
    name: 'super-admin-blog-post',
    params: {
      organizationId: selectedOrganization.value,
      jurisdictionId,
    },
  })
}

const goToPrev = async () => {
  if (page.value <= 1 || loadingPosts.value) return
  page.value -= 1
  await loadPosts()
}

const goToNext = async () => {
  if (page.value >= totalPages.value || loadingPosts.value) return
  page.value += 1
  await loadPosts()
}

watch(selectedOrganization, async () => {
  saveLastOrganizationId(selectedOrganization.value)
  posts.value = []
  page.value = 1
  total.value = 0
  totalPages.value = 1

  if (!selectedOrganization.value) return
  await loadPosts()
})

onMounted(() => {
  void loadOrganizations().then(() => {
    const requestedOrgId = String(route.query.organizationId || '')
    const fallbackOrgId = readLastOrganizationId()
    const initialOrgId = requestedOrgId || fallbackOrgId
    const found = organizations.value.some((organization) => organization.id === initialOrgId)

    if (found) {
      selectedOrganization.value = initialOrgId
    }
  })
})
</script>

<template>
  <div class="border-border bg-background mt-6 rounded-xl border p-6">
    <div class="mb-4 flex items-center gap-2">
      <FileText :size="18" class="text-primary" />
      <h2 class="text-foreground text-lg font-semibold">Posts List</h2>
    </div>

    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
      <Select v-model="selectedOrganization" :disabled="loadingOrganizations">
        <SelectTrigger class="border-border text-foreground bg-background w-full">
          <SelectValue
            :placeholder="loadingOrganizations ? 'Loading organizations...' : 'Select organization'"
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

      <div class="relative">
        <Search class="text-muted absolute top-1/2 left-3 -translate-y-1/2" :size="16" />
        <input
          v-model="queryTermsInput"
          type="text"
          placeholder="Query terms (comma-separated)"
          class="border-border bg-background text-foreground w-full rounded-md border py-2 pr-3 pl-9 text-sm"
          @keyup.enter="searchPosts"
        />
      </div>

      <Button
        variant="secondary"
        size="md"
        :disabled="!selectedOrganization || loadingPosts"
        @click="searchPosts"
      >
        Search
      </Button>
    </div>

    <div class="border-border rounded-lg border">
      <div v-if="loadingPosts" class="text-muted p-6 text-sm">Loading blog posts...</div>

      <div v-else-if="!selectedOrganization" class="text-muted p-6 text-sm">
        Select an organization to view published blog posts.
      </div>

      <div v-else-if="!hasPosts" class="text-muted p-6 text-sm">No published blog posts found.</div>

      <div v-else class="divide-border divide-y">
        <div v-for="post in posts" :key="post.id" class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-foreground text-sm font-medium">{{ post.title }}</p>
              <p
                v-if="selectedOrganizationLabel || post.jurisdiction_name"
                class="text-muted mt-1 text-xs"
              >
                {{ selectedOrganizationLabel }}
                <span v-if="selectedOrganizationLabel && post.jurisdiction_name"> · </span>
                {{ post.jurisdiction_name || '' }}
              </p>
            </div>

            <div class="flex flex-wrap justify-end gap-2">
              <Button
                v-if="buildPublicBlogHref(post)"
                as="a"
                variant="secondary"
                size="sm"
                :href="buildPublicBlogHref(post)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink :size="14" />
                Open public page
              </Button>

              <Button
                variant="secondary"
                size="sm"
                :disabled="!post.jurisdiction_id"
                @click="openPost(post)"
              >
                View blog post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <p class="text-muted text-xs">Page {{ page }} of {{ totalPages }} · Total {{ total }}</p>

      <div class="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          :disabled="page <= 1 || loadingPosts"
          @click="goToPrev"
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          :disabled="page >= totalPages || loadingPosts"
          @click="goToNext"
        >
          Next
        </Button>
      </div>
    </div>

    <p v-if="errorMessage" class="text-error mt-4 text-sm">{{ errorMessage }}</p>
  </div>
</template>
