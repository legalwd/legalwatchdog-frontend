import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCampaignStore } from '@/stores/campaign-store'
import type { Campaign, CampaignTaxonomyNode } from '@/types/campaign'

const { campaignApiMock, normalizeCampaignErrorMock } = vi.hoisted(() => ({
  campaignApiMock: {
    listCampaigns: vi.fn(),
    getCampaign: vi.fn(),
    createCampaign: vi.fn(),
    updateCampaign: vi.fn(),
    deleteCampaign: vi.fn(),
    launchCampaign: vi.fn(),
    getCampaignStatus: vi.fn(),
    pauseCampaign: vi.fn(),
    resumeCampaign: vi.fn(),
    cancelCampaign: vi.fn(),
    generateTaxonomy: vi.fn(),
    getTaxonomy: vi.fn(),
    updateTaxonomy: vi.fn(),
    approveTaxonomy: vi.fn(),
    retryFailedJobs: vi.fn(),
    listCampaignBlogs: vi.fn(),
    getFailedDiscoveryNodes: vi.fn(),
    resetToDiscovery: vi.fn(),
    resetCampaign: vi.fn(),
    smartResetCampaign: vi.fn(),
    runContentGeneration: vi.fn(),
    retryFailedContent: vi.fn(),
    backfillMissingContent: vi.fn(),
    publishCampaignBlogs: vi.fn(),
    previewCampaignBlog: vi.fn(),
    openCampaignProgressStream: vi.fn(),
  },
  normalizeCampaignErrorMock: vi.fn((error, fallback) => {
    const normalized = (error as { normalized?: unknown }).normalized
    return (
      normalized ?? {
        message: fallback,
        fieldErrors: {},
        details: [],
      }
    )
  }),
}))

vi.mock('@/api/campaign', () => ({
  campaignApi: campaignApiMock,
  normalizeCampaignError: normalizeCampaignErrorMock,
}))

class MockEventSource {
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent<string>) => void) | null = null
  onerror: (() => void) | null = null
  close = vi.fn()
}

const makeCampaign = (overrides: Partial<Campaign> = {}): Campaign => ({
  id: 'campaign-1',
  organization_id: 'org-1',
  name: 'Employment Watch',
  industry: 'Employment',
  domain_description: 'Track employment law changes',
  project_id: null,
  target_depth: 'COUNTRY',
  monitor_backend: 'CELERY_BEAT',
  monitor_cadence: '0 9 * * 1',
  sources_per_jurisdiction: 5,
  max_jurisdictions: 10,
  status: 'DRAFT',
  created_by: 'user-1',
  created_at: '2026-03-24T00:00:00.000Z',
  updated_at: '2026-03-24T00:00:00.000Z',
  execution_logs: [],
  ...overrides,
})

const wrap = <T>(data: T) => Promise.resolve({ data: { data } })

describe('useCampaignStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useRealTimers()
    vi.stubGlobal('EventSource', MockEventSource)
  })

  it('handles draft create, update, and delete workflow', async () => {
    const store = useCampaignStore()
    const created = makeCampaign()
    const updated = makeCampaign({ name: 'Updated Campaign' })

    campaignApiMock.createCampaign.mockImplementationOnce(() => wrap(created))
    campaignApiMock.updateCampaign.mockImplementationOnce(() => wrap(updated))
    campaignApiMock.deleteCampaign.mockResolvedValueOnce({ data: { data: {} } })

    const createdResult = await store.createCampaign({
      organization_id: 'org-1',
      name: 'Employment Watch',
      industry: 'Employment',
      domain_description: 'Track employment law changes',
      target_depth: 'COUNTRY',
      monitor_backend: 'CELERY_BEAT',
      monitor_cadence: '0 9 * * 1',
      sources_per_jurisdiction: 5,
      max_jurisdictions: 10,
    })

    expect(createdResult?.id).toBe('campaign-1')
    expect(store.activeCampaign?.name).toBe('Employment Watch')
    expect(store.campaignsTotal).toBe(1)

    const updatedResult = await store.updateCampaign('campaign-1', { name: 'Updated Campaign' })

    expect(updatedResult?.name).toBe('Updated Campaign')
    expect(store.activeCampaign?.name).toBe('Updated Campaign')

    const deleted = await store.deleteCampaign('campaign-1')

    expect(deleted).toBe(true)
    expect(store.activeCampaign).toBeNull()
    expect(store.campaigns).toHaveLength(0)
    expect(store.campaignsTotal).toBe(0)
  })

  it('handles taxonomy generation, editing, and approval workflow', async () => {
    const store = useCampaignStore()
    store.activeCampaign = makeCampaign()
    store.campaigns = [store.activeCampaign]

    const taxonomy: CampaignTaxonomyNode[] = [
      {
        name: 'Nigeria',
        description: 'Country node',
        children: [{ name: 'Lagos', description: 'State node' }],
      },
    ]

    campaignApiMock.generateTaxonomy.mockImplementationOnce(() =>
      wrap({ id: 'campaign-1', status: 'TAXONOMY_READY' }),
    )
    campaignApiMock.getTaxonomy.mockImplementationOnce(() =>
      wrap({
        campaign_id: 'campaign-1',
        status: 'TAXONOMY_READY',
        taxonomy,
        warnings: ['Review local naming conventions'],
        preview_stats: { total_nodes: 2, countries: 1, states: 1, cities: 0 },
      }),
    )
    campaignApiMock.updateTaxonomy.mockImplementationOnce(() =>
      wrap({
        campaign_id: 'campaign-1',
        status: 'TAXONOMY_READY',
        taxonomy,
        warnings: [],
        preview_stats: { total_nodes: 2, countries: 1, states: 1, cities: 0 },
      }),
    )
    campaignApiMock.approveTaxonomy.mockImplementationOnce(() =>
      wrap({
        campaign_id: 'campaign-1',
        taxonomy_approved_by: 'admin-1',
        taxonomy_approved_at: '2026-03-24T10:00:00.000Z',
        status: 'TAXONOMY_READY',
      }),
    )

    const generated = await store.generateTaxonomy('campaign-1')
    expect(generated?.status).toBe('TAXONOMY_READY')
    expect(store.runtimeStatus).toBe('TAXONOMY_READY')

    const fetched = await store.fetchTaxonomy('campaign-1')
    expect(fetched?.taxonomy).toHaveLength(1)
    expect(store.taxonomyWarnings).toEqual(['Review local naming conventions'])
    expect(store.taxonomyPreviewStats?.total_nodes).toBe(2)

    const updated = await store.updateTaxonomy('campaign-1', { taxonomy })
    expect(updated?.warnings).toEqual([])
    expect(store.taxonomyWarnings).toEqual([])

    const approved = await store.approveTaxonomy('campaign-1')
    expect(approved?.taxonomy_approved_by).toBe('admin-1')
    expect(store.activeCampaign?.taxonomy_approved_by).toBe('admin-1')
  })

  it('handles runtime launch, pause, resume, and cancel workflow', async () => {
    const store = useCampaignStore()
    store.activeCampaign = makeCampaign({ status: 'TAXONOMY_READY' })
    store.campaigns = [store.activeCampaign]

    campaignApiMock.launchCampaign.mockImplementationOnce(() =>
      wrap({ backend: 'celery', task_id: 'task-1' }),
    )
    campaignApiMock.pauseCampaign.mockResolvedValueOnce({ data: { data: {} } })
    campaignApiMock.resumeCampaign.mockResolvedValueOnce({ data: { data: {} } })
    campaignApiMock.cancelCampaign.mockResolvedValueOnce({ data: { data: {} } })
    campaignApiMock.getCampaignStatus
      .mockImplementationOnce(() => wrap({ campaign_id: 'campaign-1', status: 'HYDRATING' }))
      .mockImplementationOnce(() => wrap({ campaign_id: 'campaign-1', status: 'PAUSED' }))
      .mockImplementationOnce(() => wrap({ campaign_id: 'campaign-1', status: 'MONITORING' }))
      .mockImplementationOnce(() => wrap({ campaign_id: 'campaign-1', status: 'CANCELLED' }))

    const launched = await store.launchCampaign('campaign-1')
    expect(launched?.task_id).toBe('task-1')
    expect(store.runtimeStatus).toBe('HYDRATING')

    expect(await store.pauseCampaign('campaign-1')).toBe(true)
    expect(store.runtimeStatus).toBe('PAUSED')

    expect(await store.resumeCampaign('campaign-1')).toBe(true)
    expect(store.runtimeStatus).toBe('MONITORING')

    expect(await store.cancelCampaign('campaign-1')).toBe(true)
    expect(store.runtimeStatus).toBe('CANCELLED')
  })

  it('stores campaign blogs and failed discovery nodes', async () => {
    const store = useCampaignStore()

    campaignApiMock.listCampaignBlogs.mockImplementationOnce(() =>
      wrap([
        {
          id: 'blog-1',
          jurisdiction_id: 'jurisdiction-1',
          title: 'New labor rule',
          slug: 'new-labor-rule',
        },
      ]),
    )
    campaignApiMock.getFailedDiscoveryNodes.mockImplementationOnce(() =>
      wrap([
        {
          id: 'node-1',
          jurisdiction_id: 'jurisdiction-2',
          name: 'Lagos',
          missing_sources_count: 2,
        },
      ]),
    )

    const blogs = await store.fetchCampaignBlogs('campaign-1')
    const failedNodes = await store.fetchFailedDiscoveryNodes('campaign-1')

    expect(blogs).toHaveLength(1)
    expect(store.campaignBlogs[0]?.id).toBe('blog-1')
    expect(failedNodes).toHaveLength(1)
    expect(store.failedDiscoveryNodes[0]?.id).toBe('node-1')
  })

  it('refreshes campaign detail and runtime status after remediation mutations', async () => {
    const store = useCampaignStore()
    store.activeCampaign = makeCampaign({ status: 'FAILED' })
    store.campaigns = [store.activeCampaign]

    campaignApiMock.retryFailedJobs.mockImplementationOnce(() => wrap({ retried_jobs: 3 }))
    campaignApiMock.resetToDiscovery.mockImplementationOnce(() => wrap({ reset: true }))
    campaignApiMock.resetCampaign.mockImplementationOnce(() => wrap({ reset: 'full' }))
    campaignApiMock.smartResetCampaign.mockImplementationOnce(() => wrap({ reset: 'smart' }))
    campaignApiMock.runContentGeneration.mockImplementationOnce(() => wrap({ generated: true }))
    campaignApiMock.retryFailedContent.mockImplementationOnce(() => wrap({ retried_content: true }))
    campaignApiMock.backfillMissingContent.mockImplementationOnce(() => wrap({ backfilled: true }))

    campaignApiMock.getCampaign
      .mockImplementationOnce(() => wrap(makeCampaign({ status: 'SCRAPING' })))
      .mockImplementationOnce(() => wrap(makeCampaign({ status: 'DISCOVERING_SOURCES' })))
      .mockImplementationOnce(() => wrap(makeCampaign({ status: 'HYDRATING' })))
      .mockImplementationOnce(() => wrap(makeCampaign({ status: 'DISCOVERING_SOURCES' })))
      .mockImplementationOnce(() => wrap(makeCampaign({ status: 'GENERATING_CONTENT' })))
      .mockImplementationOnce(() => wrap(makeCampaign({ status: 'GENERATING_CONTENT' })))
      .mockImplementationOnce(() => wrap(makeCampaign({ status: 'GENERATING_CONTENT' })))
    campaignApiMock.getCampaignStatus
      .mockImplementationOnce(() => wrap({ campaign_id: 'campaign-1', status: 'SCRAPING' }))
      .mockImplementationOnce(() =>
        wrap({ campaign_id: 'campaign-1', status: 'DISCOVERING_SOURCES' }),
      )
      .mockImplementationOnce(() => wrap({ campaign_id: 'campaign-1', status: 'HYDRATING' }))
      .mockImplementationOnce(() =>
        wrap({ campaign_id: 'campaign-1', status: 'DISCOVERING_SOURCES' }),
      )
      .mockImplementationOnce(() =>
        wrap({ campaign_id: 'campaign-1', status: 'GENERATING_CONTENT' }),
      )
      .mockImplementationOnce(() =>
        wrap({ campaign_id: 'campaign-1', status: 'GENERATING_CONTENT' }),
      )
      .mockImplementationOnce(() =>
        wrap({ campaign_id: 'campaign-1', status: 'GENERATING_CONTENT' }),
      )

    const retried = await store.retryFailedJobs('campaign-1')
    expect(retried).toEqual({ retried_jobs: 3 })
    expect(store.runtimeStatus).toBe('SCRAPING')

    const resetToDiscovery = await store.resetToDiscovery('campaign-1')
    expect(resetToDiscovery).toEqual({ reset: true })
    expect(store.runtimeStatus).toBe('DISCOVERING_SOURCES')

    const reset = await store.resetCampaign('campaign-1', { target_status: 'DRAFT' })
    expect(reset).toEqual({ reset: 'full' })
    expect(store.runtimeStatus).toBe('HYDRATING')

    expect(campaignApiMock.resetCampaign).toHaveBeenCalledWith('campaign-1', {
      target_status: 'DRAFT',
    })

    const smartReset = await store.smartResetCampaign('campaign-1')
    expect(smartReset).toEqual({ reset: 'smart' })
    expect(store.runtimeStatus).toBe('DISCOVERING_SOURCES')

    const runContentPayload = { countries: ['MX'], states: ['Nuevo Leon'] }
    const retryContentPayload = { countries: ['US'], states: ['CA'] }
    const backfillContentPayload = { countries: ['Mexico'], states: null }

    const runContent = await store.runContentGeneration('campaign-1', runContentPayload)
    expect(runContent).toEqual({ generated: true })
    expect(store.runtimeStatus).toBe('GENERATING_CONTENT')
    expect(campaignApiMock.runContentGeneration).toHaveBeenCalledWith(
      'campaign-1',
      runContentPayload,
    )

    const retryContent = await store.retryFailedContent('campaign-1', retryContentPayload)
    expect(retryContent).toEqual({ retried_content: true })
    expect(store.runtimeStatus).toBe('GENERATING_CONTENT')
    expect(campaignApiMock.retryFailedContent).toHaveBeenCalledWith(
      'campaign-1',
      retryContentPayload,
    )

    const backfillContent = await store.backfillMissingContent('campaign-1', backfillContentPayload)
    expect(backfillContent).toEqual({ backfilled: true })
    expect(store.runtimeStatus).toBe('GENERATING_CONTENT')
    expect(campaignApiMock.backfillMissingContent).toHaveBeenCalledWith(
      'campaign-1',
      backfillContentPayload,
    )
  })

  it('surfaces normalized 404, 423, and 422 errors', async () => {
    const store = useCampaignStore()

    campaignApiMock.getCampaign.mockRejectedValueOnce({
      normalized: {
        message: 'Campaign missing',
        statusCode: 404,
        errorCode: 'NOT_FOUND',
        fieldErrors: {},
        details: [],
      },
    })
    campaignApiMock.updateCampaign.mockRejectedValueOnce({
      normalized: {
        message: 'Campaign is locked',
        statusCode: 423,
        errorCode: 'RESOURCE_LOCKED',
        fieldErrors: {},
        details: [],
      },
    })
    campaignApiMock.launchCampaign.mockRejectedValueOnce({
      normalized: {
        message: 'Launch processing failed',
        statusCode: 422,
        errorCode: 'PROCESSING_ERROR',
        fieldErrors: {
          launch: ['Unable to enqueue run'],
        },
        details: ['Launch processing failed'],
      },
    })

    await expect(store.fetchCampaign('missing')).resolves.toBeNull()
    expect(store.isNotFoundError).toBe(true)
    expect(store.error).toBe('Campaign missing')

    await expect(store.updateCampaign('campaign-1', { name: 'Locked' })).resolves.toBeNull()
    expect(store.isResourceLockedError).toBe(true)
    expect(store.error).toBe('Campaign is locked')

    await expect(store.launchCampaign('campaign-1')).resolves.toBeNull()
    expect(store.error).toBe('Launch processing failed')
    expect(store.fieldErrors.launch).toEqual(['Unable to enqueue run'])
  })

  it('surfaces normalized errors for remediation endpoints', async () => {
    const store = useCampaignStore()

    campaignApiMock.getFailedDiscoveryNodes.mockRejectedValueOnce({
      normalized: {
        message: 'Campaign missing',
        statusCode: 404,
        errorCode: 'NOT_FOUND',
        fieldErrors: {},
        details: [],
      },
    })
    campaignApiMock.retryFailedJobs.mockRejectedValueOnce({
      normalized: {
        message: 'Campaign recovery is locked',
        statusCode: 423,
        errorCode: 'RESOURCE_LOCKED',
        fieldErrors: {},
        details: [],
      },
    })

    await expect(store.fetchFailedDiscoveryNodes('missing')).resolves.toBeNull()
    expect(store.isNotFoundError).toBe(true)
    expect(store.error).toBe('Campaign missing')

    await expect(store.retryFailedJobs('campaign-1')).resolves.toBeNull()
    expect(store.isResourceLockedError).toBe(true)
    expect(store.error).toBe('Campaign recovery is locked')
  })

  it('falls back to polling when SSE fails and stops after terminal status', async () => {
    vi.useFakeTimers()
    const eventSource = new MockEventSource()
    const store = useCampaignStore()

    campaignApiMock.openCampaignProgressStream.mockReturnValue(eventSource)
    campaignApiMock.getCampaignStatus.mockImplementationOnce(() =>
      wrap({ campaign_id: 'campaign-1', status: 'CANCELLED' }),
    )

    store.connectProgressStream('campaign-1')
    eventSource.onerror?.()

    await vi.advanceTimersByTimeAsync(10000)

    expect(campaignApiMock.getCampaignStatus).toHaveBeenCalledWith('campaign-1')
    expect(store.runtimeStatus).toBe('CANCELLED')
    expect(store.streamConnected).toBe(false)

    await vi.advanceTimersByTimeAsync(10000)
    expect(campaignApiMock.getCampaignStatus).toHaveBeenCalledTimes(1)
  })
})
