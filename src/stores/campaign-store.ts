import { defineStore } from 'pinia'

import { campaignApi, normalizeCampaignError } from '@/api/campaign'
import type {
  Campaign,
  CampaignApprovalData,
  CampaignBlogPost,
  CampaignContentTriggerPayload,
  CampaignCreatePayload,
  CampaignExecutionLog,
  CampaignFailedDiscoveryNode,
  CampaignListParams,
  CampaignMutationAck,
  CampaignNormalizedError,
  CampaignResetPayload,
  CampaignRuntimeStatusData,
  CampaignStatus,
  CampaignTaxonomyNode,
  CampaignTaxonomyPreviewStats,
  CampaignTaxonomyUpdatePayload,
  CampaignUpdatePayload,
  CampaignPublishBlogsPayload,
} from '@/types/campaign'

interface State {
  campaigns: Campaign[]
  campaignsTotal: number
  campaignsPage: number
  campaignsLimit: number
  activeCampaign: Campaign | null
  executionLogs: CampaignExecutionLog[]
  campaignBlogs: CampaignBlogPost[]
  failedDiscoveryNodes: CampaignFailedDiscoveryNode[]
  taxonomy: CampaignTaxonomyNode[]
  taxonomyWarnings: string[]
  taxonomyPreviewStats: CampaignTaxonomyPreviewStats | null
  runtimeStatus: CampaignStatus | null
  streamConnected: boolean
  loading: boolean
  loadingStatus: boolean
  saving: boolean
  requestError: CampaignNormalizedError | null
  error: string | null
}

const TERMINAL_STATUSES: CampaignStatus[] = ['FAILED', 'COMPLETED', 'CANCELLED']
const POLLING_STOP_STATUSES: CampaignStatus[] = ['ACTIVE', 'FAILED', 'COMPLETED', 'CANCELLED']
const RUNNING_STATUSES: CampaignStatus[] = [
  'LAUNCHING',
  'GENERATING_TAXONOMY',
  'HYDRATING',
  'DISCOVERING_SOURCES',
  'SCRAPING',
  'GENERATING_CONTENT',
  'PUBLISHING',
  'MONITORING',
  'ACTIVE',
]

let progressStream: EventSource | null = null
let pollingTimer: number | null = null
let progressStreamCampaignId: string | null = null
let pollingCampaignId: string | null = null

const emptyPreviewStats = (): CampaignTaxonomyPreviewStats => ({
  total_nodes: 0,
  countries: 0,
  states: 0,
  cities: 0,
})

const isTerminalStatus = (status: CampaignStatus | null | undefined) =>
  Boolean(status && TERMINAL_STATUSES.includes(status))

const isRunningStatus = (status: CampaignStatus | null | undefined) =>
  Boolean(status && RUNNING_STATUSES.includes(status))

const shouldStopPollingForStatus = (status: CampaignStatus | null | undefined) =>
  Boolean(status && POLLING_STOP_STATUSES.includes(status))

const safeJsonParse = (value: string) => {
  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return null
  }
}

export const useCampaignStore = defineStore('campaigns', {
  state: (): State => ({
    campaigns: [],
    campaignsTotal: 0,
    campaignsPage: 1,
    campaignsLimit: 20,
    activeCampaign: null,
    executionLogs: [],
    campaignBlogs: [],
    failedDiscoveryNodes: [],
    taxonomy: [],
    taxonomyWarnings: [],
    taxonomyPreviewStats: null,
    runtimeStatus: null,
    streamConnected: false,
    loading: false,
    loadingStatus: false,
    saving: false,
    requestError: null,
    error: null,
  }),

  getters: {
    isDraft: (state) => state.activeCampaign?.status === 'DRAFT',
    isTaxonomyReady: (state) => state.activeCampaign?.status === 'TAXONOMY_READY',
    isPaused: (state) => state.activeCampaign?.status === 'PAUSED',
    isRunning: (state) => isRunningStatus(state.runtimeStatus || state.activeCampaign?.status),
    isTerminal: (state) => isTerminalStatus(state.runtimeStatus || state.activeCampaign?.status),
    canEditCampaign: (state) => state.activeCampaign?.status === 'DRAFT',
    canDeleteCampaign: (state) => state.activeCampaign?.status === 'DRAFT',
    canGenerateTaxonomy: (state) => state.activeCampaign?.status === 'DRAFT',
    canApproveTaxonomy: (state) => state.activeCampaign?.status === 'TAXONOMY_READY',
    canLaunchCampaign: (state) => {
      const status = state.activeCampaign?.status
      return status === 'TAXONOMY_READY' || status === 'FAILED'
    },
    canPauseCampaign: (state) => {
      const status = state.runtimeStatus || state.activeCampaign?.status
      return isRunningStatus(status)
    },
    canResumeCampaign: (state) =>
      (state.runtimeStatus || state.activeCampaign?.status) === 'PAUSED',
    canCancelCampaign: (state) => {
      const status = state.runtimeStatus || state.activeCampaign?.status
      return status === 'PAUSED' || isRunningStatus(status)
    },
    fieldErrors: (state) => state.requestError?.fieldErrors ?? {},
    errorDetails: (state) => state.requestError?.details ?? [],
    isResourceLockedError: (state) =>
      state.requestError?.statusCode === 423 || state.requestError?.errorCode === 'RESOURCE_LOCKED',
    isNotFoundError: (state) =>
      state.requestError?.statusCode === 404 || state.requestError?.errorCode === 'NOT_FOUND',
  },

  actions: {
    setError(message: string | null) {
      this.error = message
      if (!message) {
        this.requestError = null
      }
    },

    setRequestError(error: CampaignNormalizedError | null) {
      this.requestError = error
      this.error = error?.message ?? null
    },

    clearRequestError() {
      this.requestError = null
      this.error = null
    },

    applyRequestError(error: unknown, fallback: string) {
      this.setRequestError(normalizeCampaignError(error, fallback))
    },

    syncCampaignInList(campaign: Campaign) {
      const index = this.campaigns.findIndex((item) => item.id === campaign.id)
      if (index === -1) {
        this.campaigns.unshift(campaign)
        return
      }
      this.campaigns[index] = campaign
    },

    removeCampaignFromList(campaignId: string) {
      this.campaigns = this.campaigns.filter((campaign) => campaign.id !== campaignId)
    },

    applyCampaignDetail(campaign: Campaign) {
      this.activeCampaign = campaign
      this.executionLogs = campaign.execution_logs ?? []
      this.runtimeStatus = campaign.status
      this.syncCampaignInList(campaign)
    },

    applyTaxonomyData(data: {
      taxonomy: CampaignTaxonomyNode[]
      warnings: string[]
      preview_stats: CampaignTaxonomyPreviewStats
    }) {
      this.taxonomy = Array.isArray(data.taxonomy) ? data.taxonomy : []
      this.taxonomyWarnings = Array.isArray(data.warnings) ? data.warnings : []
      this.taxonomyPreviewStats = data.preview_stats ?? emptyPreviewStats()
    },

    applyRuntimeStatus(data: CampaignRuntimeStatusData) {
      this.runtimeStatus = data.status
      if (this.activeCampaign) {
        this.activeCampaign = {
          ...this.activeCampaign,
          status: data.status,
        }
        this.syncCampaignInList(this.activeCampaign)
      }
    },

    resetTaxonomyState() {
      this.taxonomy = []
      this.taxonomyWarnings = []
      this.taxonomyPreviewStats = null
    },

    resetCampaignRemediationState() {
      this.campaignBlogs = []
      this.failedDiscoveryNodes = []
    },

    async refreshCampaignSnapshot(campaignId: string) {
      try {
        const [campaignResponse, statusResponse] = await Promise.all([
          campaignApi.getCampaign(campaignId),
          campaignApi.getCampaignStatus(campaignId),
        ])

        this.applyCampaignDetail(campaignResponse.data.data)
        this.applyRuntimeStatus(statusResponse.data.data)
      } catch (error) {
        this.applyRequestError(error, 'Failed to refresh campaign state')
      }
    },

    async fetchCampaigns(params?: CampaignListParams) {
      this.loading = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.listCampaigns(params)
        this.campaigns = data.data.campaigns ?? []
        this.campaignsTotal = data.data.total ?? 0
        this.campaignsPage = data.data.page ?? params?.page ?? 1
        this.campaignsLimit = data.data.limit ?? params?.limit ?? 20
      } catch (error) {
        this.applyRequestError(error, 'Failed to load campaigns')
      } finally {
        this.loading = false
      }
    },

    async fetchCampaign(campaignId: string) {
      this.loading = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.getCampaign(campaignId)
        this.applyCampaignDetail(data.data)
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to load campaign')
        return null
      } finally {
        this.loading = false
      }
    },

    async createCampaign(payload: CampaignCreatePayload) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.createCampaign(payload)
        this.syncCampaignInList(data.data)
        this.applyCampaignDetail(data.data)
        this.campaignsTotal += 1
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to create campaign')
        return null
      } finally {
        this.saving = false
      }
    },

    async updateCampaign(campaignId: string, payload: CampaignUpdatePayload) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.updateCampaign(campaignId, payload)
        this.applyCampaignDetail(data.data)
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to update campaign')
        return null
      } finally {
        this.saving = false
      }
    },

    async deleteCampaign(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        await campaignApi.deleteCampaign(campaignId)
        this.removeCampaignFromList(campaignId)
        if (this.activeCampaign?.id === campaignId) {
          this.activeCampaign = null
          this.executionLogs = []
          this.runtimeStatus = null
          this.resetCampaignRemediationState()
          this.resetTaxonomyState()
        }
        this.campaignsTotal = Math.max(0, this.campaignsTotal - 1)
        return true
      } catch (error) {
        this.applyRequestError(error, 'Failed to delete campaign')
        return false
      } finally {
        this.saving = false
      }
    },

    async generateTaxonomy(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.generateTaxonomy(campaignId)
        if (this.activeCampaign && this.activeCampaign.id === campaignId) {
          this.applyRuntimeStatus({
            campaign_id: campaignId,
            status: data.data.status,
          })
        }
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to generate taxonomy')
        return null
      } finally {
        this.saving = false
      }
    },

    async fetchTaxonomy(campaignId: string) {
      this.loading = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.getTaxonomy(campaignId)
        this.applyTaxonomyData(data.data)
        this.applyRuntimeStatus({
          campaign_id: campaignId,
          status: data.data.status,
        })
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to load taxonomy')
        return null
      } finally {
        this.loading = false
      }
    },

    async updateTaxonomy(campaignId: string, payload: CampaignTaxonomyUpdatePayload) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.updateTaxonomy(campaignId, payload)
        this.applyTaxonomyData(data.data)
        this.applyRuntimeStatus({
          campaign_id: campaignId,
          status: data.data.status,
        })
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to update taxonomy')
        return null
      } finally {
        this.saving = false
      }
    },

    async approveTaxonomy(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.approveTaxonomy(campaignId)
        const approval = data.data as CampaignApprovalData
        if (this.activeCampaign?.id === campaignId) {
          this.activeCampaign = {
            ...this.activeCampaign,
            status: approval.status,
            taxonomy_approved_by: approval.taxonomy_approved_by,
            taxonomy_approved_at: approval.taxonomy_approved_at,
          }
          this.syncCampaignInList(this.activeCampaign)
        }
        this.runtimeStatus = approval.status
        return approval
      } catch (error) {
        this.applyRequestError(error, 'Failed to approve taxonomy')
        return null
      } finally {
        this.saving = false
      }
    },

    async launchCampaign(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.launchCampaign(campaignId)
        await this.fetchRuntimeStatus(campaignId)
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to launch campaign')
        return null
      } finally {
        this.saving = false
      }
    },

    async fetchRuntimeStatus(campaignId: string) {
      this.loadingStatus = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.getCampaignStatus(campaignId)
        this.applyRuntimeStatus(data.data)
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to load campaign status')
        return null
      } finally {
        this.loadingStatus = false
      }
    },

    async pauseCampaign(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        await campaignApi.pauseCampaign(campaignId)
        await this.fetchRuntimeStatus(campaignId)
        return true
      } catch (error) {
        this.applyRequestError(error, 'Failed to pause campaign')
        return false
      } finally {
        this.saving = false
      }
    },

    async resumeCampaign(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        await campaignApi.resumeCampaign(campaignId)
        await this.fetchRuntimeStatus(campaignId)
        return true
      } catch (error) {
        this.applyRequestError(error, 'Failed to resume campaign')
        return false
      } finally {
        this.saving = false
      }
    },

    async cancelCampaign(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        await campaignApi.cancelCampaign(campaignId)
        await this.fetchRuntimeStatus(campaignId)
        return true
      } catch (error) {
        this.applyRequestError(error, 'Failed to cancel campaign')
        return false
      } finally {
        this.saving = false
      }
    },

    async fetchCampaignBlogs(campaignId: string) {
      this.loading = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.listCampaignBlogs(campaignId)
        this.campaignBlogs = Array.isArray(data.data) ? data.data : []
        return this.campaignBlogs
      } catch (error) {
        this.applyRequestError(error, 'Failed to load campaign blogs')
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchFailedDiscoveryNodes(campaignId: string) {
      this.loading = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.getFailedDiscoveryNodes(campaignId)
        this.failedDiscoveryNodes = Array.isArray(data.data) ? data.data : []
        return this.failedDiscoveryNodes
      } catch (error) {
        this.applyRequestError(error, 'Failed to load failed discovery nodes')
        return null
      } finally {
        this.loading = false
      }
    },

    async retryFailedJobs(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.retryFailedJobs(campaignId)
        await this.refreshCampaignSnapshot(campaignId)
        return data.data as CampaignMutationAck | null
      } catch (error) {
        this.applyRequestError(error, 'Failed to retry failed campaign jobs')
        return null
      } finally {
        this.saving = false
      }
    },

    async resetToDiscovery(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.resetToDiscovery(campaignId)
        await this.refreshCampaignSnapshot(campaignId)
        return data.data as CampaignMutationAck | null
      } catch (error) {
        this.applyRequestError(error, 'Failed to reset campaign to discovery')
        return null
      } finally {
        this.saving = false
      }
    },

    async resetCampaign(campaignId: string, payload: CampaignResetPayload) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.resetCampaign(campaignId, payload)
        await this.refreshCampaignSnapshot(campaignId)
        return data.data as CampaignMutationAck | null
      } catch (error) {
        this.applyRequestError(error, 'Failed to reset campaign')
        return null
      } finally {
        this.saving = false
      }
    },

    async smartResetCampaign(campaignId: string) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.smartResetCampaign(campaignId)
        await this.refreshCampaignSnapshot(campaignId)
        return data.data as CampaignMutationAck | null
      } catch (error) {
        this.applyRequestError(error, 'Failed to smart reset campaign')
        return null
      } finally {
        this.saving = false
      }
    },

    async runContentGeneration(campaignId: string, payload?: CampaignContentTriggerPayload | null) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.runContentGeneration(campaignId, payload)
        await this.refreshCampaignSnapshot(campaignId)
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to run content generation')
        return null
      } finally {
        this.saving = false
      }
    },

    async retryFailedContent(campaignId: string, payload?: CampaignContentTriggerPayload | null) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.retryFailedContent(campaignId, payload)
        await this.refreshCampaignSnapshot(campaignId)
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to retry failed content')
        return null
      } finally {
        this.saving = false
      }
    },

    async backfillMissingContent(
      campaignId: string,
      payload?: CampaignContentTriggerPayload | null,
    ) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.backfillMissingContent(campaignId, payload)
        await this.refreshCampaignSnapshot(campaignId)
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to backfill missing content')
        return null
      } finally {
        this.saving = false
      }
    },

    async publishCampaignBlogs(campaignId: string, payload: CampaignPublishBlogsPayload) {
      this.saving = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.publishCampaignBlogs(campaignId, payload)
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to publish campaign blogs')
        return null
      } finally {
        this.saving = false
      }
    },

    async previewCampaignBlog(campaignId: string, blogId: string) {
      this.loading = true
      this.clearRequestError()
      try {
        const { data } = await campaignApi.previewCampaignBlog(campaignId, blogId)
        return data.data
      } catch (error) {
        this.applyRequestError(error, 'Failed to preview campaign blog')
        return null
      } finally {
        this.loading = false
      }
    },

    connectProgressStream(campaignId: string) {
      if (import.meta.env.SSR || typeof EventSource === 'undefined') return
      if (progressStream && progressStreamCampaignId === campaignId) return

      this.disconnectProgressStream()

      progressStream = campaignApi.openCampaignProgressStream(campaignId)
      progressStreamCampaignId = campaignId

      progressStream.onopen = () => {
        this.streamConnected = true
        this.stopPolling()
      }

      progressStream.onmessage = (event) => {
        const payload = safeJsonParse(event.data)
        if (!payload) return

        const status =
          typeof payload.status === 'string'
            ? (payload.status as CampaignStatus)
            : typeof payload.campaign_status === 'string'
              ? (payload.campaign_status as CampaignStatus)
              : null

        if (status) {
          this.applyRuntimeStatus({
            campaign_id: campaignId,
            status,
          })
        }

        if (isTerminalStatus(this.runtimeStatus)) {
          this.disconnectProgressStream()
          this.stopPolling()
        }
      }

      progressStream.onerror = () => {
        this.streamConnected = false
        this.disconnectProgressStream()
        this.startPolling(campaignId)
      }
    },

    disconnectProgressStream() {
      if (progressStream) {
        progressStream.close()
        progressStream = null
      }
      progressStreamCampaignId = null
      this.streamConnected = false
    },

    startPolling(campaignId: string, intervalMs = 10000) {
      if (import.meta.env.SSR) return
      if (pollingTimer && pollingCampaignId === campaignId) return

      this.stopPolling()
      pollingCampaignId = campaignId
      pollingTimer = window.setInterval(async () => {
        const data = await this.fetchRuntimeStatus(campaignId)
        if (!data || shouldStopPollingForStatus(data.status)) {
          this.stopPolling()
        }
      }, intervalMs)
    },

    stopPolling() {
      if (pollingTimer) {
        window.clearInterval(pollingTimer)
        pollingTimer = null
      }
      pollingCampaignId = null
    },

    stopRuntimeUpdates() {
      this.disconnectProgressStream()
      this.stopPolling()
    },
  },
})
