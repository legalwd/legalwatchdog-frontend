import axios from 'axios'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { superadminOrganizationsService } from '@/api/super-admin'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useCampaignStore } from '@/stores/campaign-store'
import type {
  CampaignBlogPost,
  CampaignContentTriggerPayload,
  CampaignCreatePayload,
  CampaignStatus,
} from '@/types/campaign'

type OrganizationOption = {
  id: string
  label: string
}

const TRACKED_RUNTIME_STATUSES = new Set([
  'GENERATING_TAXONOMY',
  'HYDRATING',
  'DISCOVERING_SOURCES',
  'SCRAPING',
  'PUBLISHING',
  'MONITORING',
  'ACTIVE',
])

const RECOVERABLE_STATUSES = new Set([
  'FAILED',
  'MONITORING',
  'DISCOVERING_SOURCES',
  'SCRAPING',
  'PUBLISHING',
  'PAUSED',
] as const)

const isRecoverableStatus = (status: CampaignStatus | null | undefined) =>
  Boolean(
    status &&
    RECOVERABLE_STATUSES.has(
      status as typeof RECOVERABLE_STATUSES extends Set<infer T> ? T : never,
    ),
  )

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

const openHtmlPreview = (html: string, title?: string) => {
  if (typeof window === 'undefined') return false

  const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${title || 'Campaign blog preview'}</title></head><body>${html}</body></html>`
  const blob = new Blob([documentHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const previewWindow = window.open(url, '_blank', 'noopener,noreferrer')

  window.setTimeout(() => URL.revokeObjectURL(url), 30000)
  return Boolean(previewWindow)
}

export function useCampaignDetailController() {
  const campaignStore = useCampaignStore()
  const route = useRoute()
  const router = useRouter()
  const { confirm: openConfirm } = useConfirmDialog()

  const {
    activeCampaign,
    campaignBlogs,
    executionLogs,
    failedDiscoveryNodes,
    runtimeStatus,
    streamConnected,
    loading,
    loadingStatus,
    saving,
    error,
    requestError,
  } = storeToRefs(campaignStore)

  const organizationOptions = ref<OrganizationOption[]>([])
  const loadingOrganizations = ref(false)
  const showEditDialog = ref(false)
  const loadingCampaignBlogs = ref(false)
  const loadingFailedDiscoveryNodes = ref(false)
  const loadedCampaignBlogs = ref(false)
  const loadedFailedDiscoveryNodes = ref(false)

  const campaignId = computed(() => {
    const id = route.params.id
    return typeof id === 'string' ? id : ''
  })

  const trackedRuntimeStatus = computed(
    () => runtimeStatus.value || activeCampaign.value?.status || null,
  )

  const remediationStatus = computed(
    () => trackedRuntimeStatus.value || activeCampaign.value?.status || null,
  )

  const canRetryFailedJobs = computed(() => isRecoverableStatus(remediationStatus.value))
  const canResetToDiscovery = computed(() => isRecoverableStatus(remediationStatus.value))
  const canResetCampaign = computed(() => isRecoverableStatus(remediationStatus.value))
  const canSmartReset = computed(() => isRecoverableStatus(remediationStatus.value))
  const canStartOver = computed(() => {
    const status = remediationStatus.value?.toUpperCase()
    return status === 'CANCELLED' || status === 'CANCELED'
  })

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

  const loadCampaign = async () => {
    if (!campaignId.value) return
    const [campaign, status] = await Promise.all([
      campaignStore.fetchCampaign(campaignId.value),
      campaignStore.fetchRuntimeStatus(campaignId.value),
    ])
    if (!campaign) {
      toast.error(campaignStore.error || 'Failed to load campaign')
    }
    if (!status && campaignStore.error) {
      toast.error(campaignStore.error)
    }
  }

  const syncRuntimeUpdates = () => {
    if (
      campaignId.value &&
      trackedRuntimeStatus.value &&
      TRACKED_RUNTIME_STATUSES.has(trackedRuntimeStatus.value)
    ) {
      campaignStore.startPolling(campaignId.value)
      campaignStore.connectProgressStream(campaignId.value)
      return
    }

    campaignStore.stopRuntimeUpdates()
  }

  const openEditDialog = () => {
    if (!campaignStore.canEditCampaign) return
    showEditDialog.value = true
    campaignStore.setError(null)
    void router.replace({
      query: {
        ...route.query,
        dialog: 'edit',
      },
    })
  }

  const closeEditDialog = () => {
    showEditDialog.value = false
    campaignStore.setError(null)
    const nextQuery = { ...route.query }
    delete nextQuery.dialog
    void router.replace({ query: nextQuery })
  }

  const handleSaveCampaign = async (payload: CampaignCreatePayload) => {
    if (!campaignId.value) return

    const updatePayload = {
      name: payload.name,
      industry: payload.industry,
      domain_description: payload.domain_description,
      target_depth: payload.target_depth,
      monitor_backend: payload.monitor_backend,
      monitor_cadence: payload.monitor_cadence,
      sources_per_jurisdiction: payload.sources_per_jurisdiction,
      max_jurisdictions: payload.max_jurisdictions,
      ...(payload.project_id !== undefined ? { project_id: payload.project_id } : {}),
      ...(payload.target_countries !== undefined
        ? { target_countries: payload.target_countries }
        : {}),
      ...(payload.target_states !== undefined ? { target_states: payload.target_states } : {}),
    }

    const updated = await campaignStore.updateCampaign(campaignId.value, updatePayload)

    if (!updated) {
      toast.error(error.value || 'Failed to update campaign')
      return
    }

    toast.success('Campaign updated successfully')
    closeEditDialog()
  }

  const handleDeleteCampaign = () => {
    if (!campaignId.value || !activeCampaign.value) return

    openConfirm({
      title: 'Delete campaign?',
      description:
        'This campaign draft will be permanently removed. Only draft campaigns can be deleted.',
      confirmText: 'Delete campaign',
      cancelText: 'Cancel',
      async onConfirm() {
        const deleted = await campaignStore.deleteCampaign(campaignId.value)
        if (!deleted) {
          toast.error(campaignStore.error || 'Failed to delete campaign')
          return
        }

        toast.success('Campaign deleted successfully')
        await router.replace({ name: 'super-admin-campaigns' })
      },
    })
  }

  const navigateToTaxonomy = async () => {
    if (!campaignId.value) return

    await router.push({
      name: 'super-admin-campaign-taxonomy',
      params: { id: campaignId.value },
    })
  }

  const handleGenerateTaxonomy = async () => {
    if (!campaignId.value) return

    const generated = await campaignStore.generateTaxonomy(campaignId.value)
    if (!generated) {
      toast.error(campaignStore.error || 'Failed to generate taxonomy')
      return
    }

    toast.success('Campaign taxonomy generated')
    await navigateToTaxonomy()
  }

  const handleLaunchCampaign = async () => {
    if (!campaignId.value) return
    const launched = await campaignStore.launchCampaign(campaignId.value)
    if (!launched) {
      toast.error(campaignStore.error || 'Failed to launch campaign')
      return
    }
    toast.success('Campaign launch initiated')
  }

  const handlePauseCampaign = async () => {
    if (!campaignId.value) return
    const paused = await campaignStore.pauseCampaign(campaignId.value)
    if (!paused) {
      toast.error(campaignStore.error || 'Failed to pause campaign')
      return
    }
    toast.success('Campaign paused')
  }

  const handleResumeCampaign = async () => {
    if (!campaignId.value) return
    const resumed = await campaignStore.resumeCampaign(campaignId.value)
    if (!resumed) {
      toast.error(campaignStore.error || 'Failed to resume campaign')
      return
    }
    toast.success('Campaign resumed')
  }

  const handleCancelCampaign = () => {
    if (!campaignId.value || !activeCampaign.value) return

    openConfirm({
      title: 'Cancel campaign?',
      description:
        'This will stop an active or paused campaign. Use this only when you want to halt the run.',
      confirmText: 'Cancel campaign',
      cancelText: 'Keep running',
      async onConfirm() {
        const cancelled = await campaignStore.cancelCampaign(campaignId.value)
        if (!cancelled) {
          toast.error(campaignStore.error || 'Failed to cancel campaign')
          return
        }
        toast.success('Campaign cancelled')
      },
    })
  }

  const loadCampaignBlogs = async () => {
    if (!campaignId.value) return
    loadingCampaignBlogs.value = true
    try {
      const blogs = await campaignStore.fetchCampaignBlogs(campaignId.value)
      if (!blogs) {
        toast.error(campaignStore.error || 'Failed to load campaign blogs')
        return
      }
      loadedCampaignBlogs.value = true
    } finally {
      loadingCampaignBlogs.value = false
    }
  }

  const loadFailedDiscoveryNodes = async () => {
    if (!campaignId.value) return
    loadingFailedDiscoveryNodes.value = true
    try {
      const nodes = await campaignStore.fetchFailedDiscoveryNodes(campaignId.value)
      if (!nodes) {
        toast.error(campaignStore.error || 'Failed to load failed discovery nodes')
        return
      }
      loadedFailedDiscoveryNodes.value = true
    } finally {
      loadingFailedDiscoveryNodes.value = false
    }
  }

  const refreshOptionalSections = async () => {
    const refreshTasks: Promise<unknown>[] = []

    if (loadedCampaignBlogs.value) {
      refreshTasks.push(loadCampaignBlogs())
    }

    if (loadedFailedDiscoveryNodes.value) {
      refreshTasks.push(loadFailedDiscoveryNodes())
    }

    await Promise.all(refreshTasks)
  }

  const handleStartOver = () => {
    if (!campaignId.value) return

    openConfirm({
      title: 'Start over?',
      description:
        'This will reset the cancelled campaign to a draft state, allowing you to edit and launch it again.',
      confirmText: 'Start over',
      cancelText: 'Cancel',
      async onConfirm() {
        const reset = await campaignStore.resetCampaign(campaignId.value, {
          target_status: 'DRAFT',
        })
        if (!reset) {
          toast.error(campaignStore.error || 'Failed to restart campaign')
          return
        }

        await refreshOptionalSections()
        toast.success('Campaign reset to draft')
      },
    })
  }

  const refreshCampaignBlogsIfLoaded = async () => {
    if (loadedCampaignBlogs.value) {
      await loadCampaignBlogs()
    }
  }

  const handleContentAction = (
    action: 'run' | 'retry_failed' | 'backfill_missing',
    options: { title: string; description: string; confirmText: string; successMessage: string },
    payload?: CampaignContentTriggerPayload | null,
  ) => {
    if (!campaignId.value) return

    openConfirm({
      title: options.title,
      description: options.description,
      confirmText: options.confirmText,
      cancelText: 'Cancel',
      async onConfirm() {
        const result =
          action === 'run'
            ? await campaignStore.runContentGeneration(campaignId.value, payload)
            : action === 'retry_failed'
              ? await campaignStore.retryFailedContent(campaignId.value, payload)
              : await campaignStore.backfillMissingContent(campaignId.value, payload)

        if (!result) {
          toast.error(campaignStore.error || 'Failed to queue content job')
          return
        }

        await refreshCampaignBlogsIfLoaded()
        toast.success(
          result.task_id ? `${options.successMessage}: ${result.task_id}` : options.successMessage,
        )
      },
    })
  }

  const handleRunContentGeneration = (payload?: CampaignContentTriggerPayload | null) => {
    handleContentAction(
      'run',
      {
        title: 'Run content generation?',
        description:
          'This queues campaign-level content generation for eligible jurisdictions in this campaign.',
        confirmText: 'Run content generation',
        successMessage: 'Content generation queued',
      },
      payload,
    )
  }

  const handleRetryFailedContent = (payload?: CampaignContentTriggerPayload | null) => {
    handleContentAction(
      'retry_failed',
      {
        title: 'Retry failed content?',
        description:
          'This queues content generation only for jurisdictions that failed most recently.',
        confirmText: 'Retry failed content',
        successMessage: 'Failed content retry queued',
      },
      payload,
    )
  }

  const handleBackfillMissingContent = (payload?: CampaignContentTriggerPayload | null) => {
    handleContentAction(
      'backfill_missing',
      {
        title: 'Backfill missing content?',
        description:
          'This queues content generation for jurisdictions that do not have generated blogs.',
        confirmText: 'Backfill missing content',
        successMessage: 'Missing content backfill queued',
      },
      payload,
    )
  }

  const handlePublishCampaignBlogs = (isPublished: boolean, blog?: CampaignBlogPost) => {
    if (!campaignId.value) return

    const targetText = blog ? blog.title || blog.slug || blog.id : 'all generated blogs'
    const actionText = isPublished ? 'publish' : 'unpublish'

    openConfirm({
      title: `${isPublished ? 'Publish' : 'Unpublish'} ${blog ? 'blog' : 'all blogs'}?`,
      description: `This will ${actionText} ${targetText}.`,
      confirmText: isPublished ? 'Publish' : 'Unpublish',
      cancelText: 'Cancel',
      async onConfirm() {
        const result = await campaignStore.publishCampaignBlogs(campaignId.value, {
          is_published: isPublished,
          ...(blog ? { blog_ids: [blog.id] } : { publish_all: true }),
        })

        if (!result) {
          toast.error(campaignStore.error || `Failed to ${actionText} campaign blogs`)
          return
        }

        await refreshCampaignBlogsIfLoaded()
        toast.success(
          `${result.processed_count} ${result.processed_count === 1 ? 'blog' : 'blogs'} ${isPublished ? 'published' : 'unpublished'}`,
        )
      },
    })
  }

  const handlePreviewCampaignBlog = async (blog: CampaignBlogPost) => {
    if (!campaignId.value) return

    const preview = await campaignStore.previewCampaignBlog(campaignId.value, blog.id)
    if (!preview) {
      toast.error(campaignStore.error || 'Failed to preview campaign blog')
      return
    }

    if (preview.preview_url && typeof window !== 'undefined') {
      window.open(preview.preview_url, '_blank', 'noopener,noreferrer')
      return
    }

    const html = preview.html || preview.content_html
    if (html && openHtmlPreview(html, preview.title || blog.title || undefined)) {
      return
    }

    toast.info('Preview request completed, but no renderable preview was returned.')
  }

  const handleRetryFailedJobs = () => {
    if (!campaignId.value) return

    openConfirm({
      title: 'Retry failed jobs?',
      description:
        'This retries failed jurisdiction scrape jobs for the current campaign and refreshes campaign status.',
      confirmText: 'Retry failed jobs',
      cancelText: 'Cancel',
      async onConfirm() {
        const retried = await campaignStore.retryFailedJobs(campaignId.value)
        if (!retried) {
          toast.error(campaignStore.error || 'Failed to retry failed campaign jobs')
          return
        }

        await refreshOptionalSections()
        toast.success('Failed campaign jobs retried')
      },
    })
  }

  const handleResetToDiscovery = () => {
    if (!campaignId.value) return

    openConfirm({
      title: 'Reset to discovery?',
      description:
        'This moves the campaign back to source discovery so recovery work can continue from that phase.',
      confirmText: 'Reset to discovery',
      cancelText: 'Cancel',
      async onConfirm() {
        const reset = await campaignStore.resetToDiscovery(campaignId.value)
        if (!reset) {
          toast.error(campaignStore.error || 'Failed to reset campaign to discovery')
          return
        }

        await refreshOptionalSections()
        toast.success('Campaign reset to discovery')
      },
    })
  }

  const handleResetCampaign = () => {
    if (!campaignId.value) return

    openConfirm({
      title: 'Reset campaign?',
      description:
        'This triggers a full campaign reset. Use it when the current run state is no longer recoverable.',
      confirmText: 'Reset campaign',
      cancelText: 'Keep current state',
      async onConfirm() {
        const reset = await campaignStore.resetCampaign(campaignId.value, {
          target_status: 'DRAFT',
        })
        if (!reset) {
          toast.error(campaignStore.error || 'Failed to reset campaign')
          return
        }

        await refreshOptionalSections()
        toast.success('Campaign reset')
      },
    })
  }

  const handleSmartReset = () => {
    if (!campaignId.value) return

    openConfirm({
      title: 'Run smart reset?',
      description:
        'This asks the backend to detect the failed phase and reset the campaign to the most appropriate recovery point.',
      confirmText: 'Smart reset',
      cancelText: 'Cancel',
      async onConfirm() {
        const reset = await campaignStore.smartResetCampaign(campaignId.value)
        if (!reset) {
          toast.error(campaignStore.error || 'Failed to smart reset campaign')
          return
        }

        await refreshOptionalSections()
        toast.success('Smart reset triggered')
      },
    })
  }

  watch(
    () => route.params.id,
    async () => {
      campaignStore.stopRuntimeUpdates()
      campaignStore.resetCampaignRemediationState()
      loadedCampaignBlogs.value = false
      loadedFailedDiscoveryNodes.value = false
      await loadCampaign()
    },
  )

  watch([campaignId, trackedRuntimeStatus], () => {
    syncRuntimeUpdates()
  })

  watch(
    [() => route.query.dialog, () => campaignStore.canEditCampaign],
    ([dialog]) => {
      showEditDialog.value = dialog === 'edit' && campaignStore.canEditCampaign
    },
    { immediate: true },
  )

  onMounted(async () => {
    campaignStore.resetCampaignRemediationState()
    await Promise.all([loadOrganizations(), loadCampaign()])
    syncRuntimeUpdates()
  })

  onBeforeUnmount(() => {
    campaignStore.stopRuntimeUpdates()
  })

  return {
    campaignStore,
    activeCampaign,
    campaignBlogs,
    executionLogs,
    failedDiscoveryNodes,
    runtimeStatus,
    streamConnected,
    loading,
    loadingStatus,
    saving,
    error,
    requestError,
    organizationOptions,
    showEditDialog,
    loadingCampaignBlogs,
    loadingFailedDiscoveryNodes,
    loadedCampaignBlogs,
    loadedFailedDiscoveryNodes,
    remediationStatus,
    canRetryFailedJobs,
    canResetToDiscovery,
    canResetCampaign,
    canSmartReset,
    canStartOver,
    openEditDialog,
    closeEditDialog,
    handleSaveCampaign,
    handleDeleteCampaign,
    navigateToTaxonomy,
    handleGenerateTaxonomy,
    handleLaunchCampaign,
    handlePauseCampaign,
    handleResumeCampaign,
    handleCancelCampaign,
    handleStartOver,
    loadCampaignBlogs,
    loadFailedDiscoveryNodes,
    handleRunContentGeneration,
    handleRetryFailedContent,
    handleBackfillMissingContent,
    handlePublishCampaignBlogs,
    handlePreviewCampaignBlog,
    handleRetryFailedJobs,
    handleResetToDiscovery,
    handleResetCampaign,
    handleSmartReset,
  }
}
