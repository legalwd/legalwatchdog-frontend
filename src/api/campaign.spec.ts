import { beforeEach, describe, expect, it, vi } from 'vitest'

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  default: apiMock,
}))

import { campaignApi, normalizeCampaignError } from '@/api/campaign'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('normalizeCampaignError', () => {
  it('normalizes not found responses', () => {
    const error = {
      response: {
        status: 404,
        data: {
          message: 'Campaign missing',
          error_code: 'NOT_FOUND',
        },
      },
    }

    expect(normalizeCampaignError(error, 'Fallback')).toEqual({
      message: 'Campaign missing',
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      fieldErrors: {},
      details: [],
    })
  })

  it('normalizes locked responses', () => {
    const error = {
      response: {
        status: 423,
        data: {
          message: 'Draft is locked',
          error_code: 'RESOURCE_LOCKED',
        },
      },
    }

    expect(normalizeCampaignError(error, 'Fallback')).toEqual({
      message: 'Draft is locked',
      statusCode: 423,
      errorCode: 'RESOURCE_LOCKED',
      fieldErrors: {},
      details: [],
    })
  })

  it('prefers validation details for processing errors', () => {
    const error = {
      response: {
        status: 422,
        data: {
          error_code: 'PROCESSING_ERROR',
          detail: [{ msg: 'Launch failed for campaign', loc: ['body'], type: 'value_error' }],
          errors: {
            launch: ['Unable to enqueue launch'],
          },
        },
      },
    }

    expect(normalizeCampaignError(error, 'Fallback')).toEqual({
      message: 'Launch failed for campaign',
      statusCode: 422,
      errorCode: 'PROCESSING_ERROR',
      fieldErrors: {
        launch: ['Unable to enqueue launch'],
      },
      details: ['Launch failed for campaign'],
    })
  })

  it('returns a safe network message when no response exists', () => {
    expect(normalizeCampaignError({}, 'Fallback')).toEqual({
      message: 'Network error: Unable to reach server',
      fieldErrors: {},
      details: [],
    })
  })
})

describe('campaignApi endpoint paths', () => {
  it('creates campaigns with geographic scope payload fields', () => {
    const payload = {
      organization_id: 'org-1',
      name: 'EOR Compliance',
      industry: 'EOR',
      domain_description: 'Employment compliance',
      target_depth: 'STATE' as const,
      monitor_backend: 'CELERY_BEAT' as const,
      monitor_cadence: '0 9 * * 1',
      sources_per_jurisdiction: 5,
      max_jurisdictions: 100,
      target_countries: ['US', 'MX'],
      target_states: ['California', 'Nuevo Leon'],
    }

    campaignApi.createCampaign(payload)

    expect(apiMock.post).toHaveBeenCalledWith('/campaigns', payload)
  })

  it('updates campaigns with geographic scope payload fields', () => {
    const payload = {
      target_countries: ['US'],
      target_states: ['California'],
    }

    campaignApi.updateCampaign('campaign-1', payload)

    expect(apiMock.patch).toHaveBeenCalledWith('/campaigns/campaign-1', payload)
  })

  it('queues content generation with the latest content run path', () => {
    campaignApi.runContentGeneration('campaign-1')

    expect(apiMock.post).toHaveBeenCalledWith('/campaigns/campaign-1/content/run', {})
  })

  it('queues content generation with optional geographic scope', () => {
    const payload = { countries: ['MX'], states: ['Nuevo Leon'] }

    campaignApi.runContentGeneration('campaign-1', payload)

    expect(apiMock.post).toHaveBeenCalledWith('/campaigns/campaign-1/content/run', payload)
  })

  it('queues retry failed content with the latest retry path', () => {
    campaignApi.retryFailedContent('campaign-1')

    expect(apiMock.post).toHaveBeenCalledWith('/campaigns/campaign-1/content/retry-failed', {})
  })

  it('queues retry failed content with optional geographic scope', () => {
    const payload = { countries: ['US'], states: ['CA'] }

    campaignApi.retryFailedContent('campaign-1', payload)

    expect(apiMock.post).toHaveBeenCalledWith('/campaigns/campaign-1/content/retry-failed', payload)
  })

  it('queues missing content backfill with the latest backfill path', () => {
    campaignApi.backfillMissingContent('campaign-1')

    expect(apiMock.post).toHaveBeenCalledWith('/campaigns/campaign-1/content/backfill-missing', {})
  })

  it('queues missing content backfill with optional geographic scope', () => {
    const payload = { countries: ['Mexico'], states: null }

    campaignApi.backfillMissingContent('campaign-1', payload)

    expect(apiMock.post).toHaveBeenCalledWith(
      '/campaigns/campaign-1/content/backfill-missing',
      payload,
    )
  })

  it('publishes campaign blogs with the latest publish path and payload', () => {
    const payload = { is_published: true, blog_ids: ['blog-1'] }

    campaignApi.publishCampaignBlogs('campaign-1', payload)

    expect(apiMock.post).toHaveBeenCalledWith('/campaigns/campaign-1/blogs/publish', payload)
  })

  it('loads campaign blog preview with the latest preview path', () => {
    campaignApi.previewCampaignBlog('campaign-1', 'blog-1')

    expect(apiMock.get).toHaveBeenCalledWith('/campaigns/campaign-1/blogs/blog-1/preview')
  })
})
