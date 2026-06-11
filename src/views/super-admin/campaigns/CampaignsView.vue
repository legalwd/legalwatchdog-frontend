<script setup lang="ts">
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { superadminOrganizationsService } from '@/api/super-admin'
import CampaignCreateDialog from '@/components/super-admin/campaigns/CampaignCreateDialog.vue'
import CampaignListTable from '@/components/super-admin/campaigns/CampaignListTable.vue'
import { Button } from '@/components/ui/button'
import { useCampaignStore } from '@/stores/campaign-store'
import type { CampaignCreatePayload, CampaignStatus } from '@/types/campaign'

type OrganizationOption = {
  id: string
  label: string
}

const campaignStore = useCampaignStore()
const route = useRoute()
const router = useRouter()

const {
  campaigns,
  campaignsTotal,
  campaignsPage,
  campaignsLimit,
  loading,
  saving,
  error,
  requestError,
} = storeToRefs(campaignStore)

const organizationOptions = ref<OrganizationOption[]>([])
const loadingOrganizations = ref(false)
const showCreateDialog = ref(false)

const parsePositiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const statusOptions: CampaignStatus[] = [
  'DRAFT',
  'GENERATING_TAXONOMY',
  'TAXONOMY_READY',
  'HYDRATING',
  'DISCOVERING_SOURCES',
  'SCRAPING',
  'PUBLISHING',
  'MONITORING',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]

const isStatusQuery = (value: unknown): value is CampaignStatus =>
  typeof value === 'string' && statusOptions.includes(value as CampaignStatus)

const filters = ref<{
  organization_id: string
  status: '' | CampaignStatus
  industry: string
  page: number
  limit: number
}>({
  organization_id:
    typeof route.query.organization_id === 'string' ? route.query.organization_id : '',
  status: isStatusQuery(route.query.status) ? route.query.status : '',
  industry: typeof route.query.industry === 'string' ? route.query.industry : '',
  page: parsePositiveInteger(route.query.page, 1),
  limit: parsePositiveInteger(route.query.limit, 20),
})

const totalPages = computed(() => {
  const limit = campaignsLimit.value || filters.value.limit
  if (!limit) return 1
  return Math.max(1, Math.ceil(campaignsTotal.value / limit))
})

const syncFiltersToQuery = async () => {
  const nextQuery: Record<string, string> = {}

  if (filters.value.organization_id) {
    nextQuery.organization_id = filters.value.organization_id
  }
  if (filters.value.status) {
    nextQuery.status = filters.value.status
  }
  if (filters.value.industry.trim()) {
    nextQuery.industry = filters.value.industry.trim()
  }
  if (filters.value.page > 1) {
    nextQuery.page = String(filters.value.page)
  }
  if (filters.value.limit !== 20) {
    nextQuery.limit = String(filters.value.limit)
  }

  await router.replace({
    query: nextQuery,
  })
}

const parseOrganizations = (payload: unknown): OrganizationOption[] => {
  if (!payload || typeof payload !== 'object') return []

  const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
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

  return candidates
    .map((item) => {
      const org = item as {
        id?: string
        organization_id?: string
        organizationId?: string
        name?: string
        owner_name?: string
        customer_name?: string
        owner?: { name?: string }
        user?: { name?: string }
      }
      const id = org.id || org.organization_id || org.organizationId || ''
      const name = org.name || ''
      const owner = org.customer_name || org.owner_name || org.owner?.name || org.user?.name || ''
      const label = owner ? `${name} (${owner})` : name
      return { id, label }
    })
    .filter((item) => Boolean(item.id && item.label))
}

const fetchCampaigns = async () => {
  const params: {
    organization_id?: string
    status?: CampaignStatus
    industry?: string
    page: number
    limit: number
  } = {
    page: filters.value.page,
    limit: filters.value.limit,
  }

  if (filters.value.organization_id) {
    params.organization_id = filters.value.organization_id
  }
  if (filters.value.status) {
    params.status = filters.value.status
  }

  const industry = filters.value.industry.trim()
  if (industry) {
    params.industry = industry
  }

  await campaignStore.fetchCampaigns(params)
}

const loadOrganizations = async () => {
  loadingOrganizations.value = true
  try {
    const response = await superadminOrganizationsService.listOrganizations({
      page: 1,
      limit: 100,
      sort_by: 'created_at',
      sort_order: 'desc',
    })
    organizationOptions.value = parseOrganizations(response.data?.data)
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ||
        'Failed to load organizations'
      : 'Failed to load organizations'
    toast.error(message)
  } finally {
    loadingOrganizations.value = false
  }
}

const openCampaign = (campaignId: string) => {
  void router.push({
    name: 'super-admin-campaign-detail',
    params: { id: campaignId },
  })
}

const openCreateDialog = () => {
  showCreateDialog.value = true
  campaignStore.setError(null)
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  campaignStore.setError(null)
}

const handleCreateCampaign = async (payload: CampaignCreatePayload) => {
  const created = await campaignStore.createCampaign(payload)
  if (!created) {
    toast.error(error.value || 'Failed to create campaign')
    return
  }

  toast.success('Campaign created successfully')
  closeCreateDialog()
  await fetchCampaigns()
  openCampaign(created.id)
}

const goToPreviousPage = async () => {
  if (filters.value.page <= 1) return
  filters.value.page -= 1
  await fetchCampaigns()
}

const goToNextPage = async () => {
  if (filters.value.page >= totalPages.value) return
  filters.value.page += 1
  await fetchCampaigns()
}

watch(
  () => [filters.value.organization_id, filters.value.status, filters.value.limit],
  async () => {
    filters.value.page = 1
    await syncFiltersToQuery()
    await fetchCampaigns()
  },
)

watch(
  () => filters.value.industry,
  async () => {
    filters.value.page = 1
    await syncFiltersToQuery()
    await fetchCampaigns()
  },
)

watch(
  () => filters.value.page,
  async () => {
    await syncFiltersToQuery()
  },
)

onMounted(async () => {
  await Promise.all([loadOrganizations(), fetchCampaigns()])
})
</script>

<template>
  <main class="bg-page-bg min-h-[calc(100vh-72px)] p-6">
    <section class="mx-auto max-w-7xl">
      <header class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-semibold">Campaigns</h1>
          <p class="text-muted mt-2 text-sm">
            Create and manage campaign drafts before taxonomy generation and launch.
          </p>
        </div>

        <Button :disabled="loadingOrganizations || saving" @click="openCreateDialog">
          New Campaign
        </Button>
      </header>

      <section
        class="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4"
      >
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-600">Organization</label>
          <select
            v-model="filters.organization_id"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          >
            <option value="">All organizations</option>
            <option
              v-for="organization in organizationOptions"
              :key="organization.id"
              :value="organization.id"
            >
              {{ organization.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-600">Status</label>
          <select
            v-model="filters.status"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          >
            <option value="">All statuses</option>
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-600">Industry</label>
          <input
            v-model="filters.industry"
            type="text"
            placeholder="Search industry"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-600">Page Size</label>
          <select
            v-model.number="filters.limit"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </section>

      <div
        v-if="error"
        class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <CampaignListTable :campaigns="campaigns" :loading="loading" @select="openCampaign" />

      <footer
        class="mt-4 flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between"
      >
        <p>
          Showing page <span class="font-semibold">{{ campaignsPage }}</span> of
          <span class="font-semibold">{{ totalPages }}</span>
          <span class="ml-2"
            >Total campaigns: <span class="font-semibold">{{ campaignsTotal }}</span></span
          >
        </p>

        <div class="flex items-center gap-2">
          <Button
            variant="secondary"
            :disabled="loading || filters.page <= 1"
            @click="goToPreviousPage"
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            :disabled="loading || filters.page >= totalPages"
            @click="goToNextPage"
          >
            Next
          </Button>
        </div>
      </footer>
    </section>

    <CampaignCreateDialog
      :open="showCreateDialog"
      :organizations="organizationOptions"
      :loading="saving"
      :error="error"
      :field-errors="requestError?.fieldErrors ?? {}"
      @close="closeCreateDialog"
      @save="handleCreateCampaign"
    />
  </main>
</template>
