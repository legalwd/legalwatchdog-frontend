import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGuidesStore } from '@/stores/guides-store'

const { guidesApiMock } = vi.hoisted(() => ({
  guidesApiMock: {
    getIndustryRegions: vi.fn(),
    getRegionJurisdictions: vi.fn(),
    getJurisdictionDetail: vi.fn(),
  },
}))

vi.mock('@/api/guides', () => ({
  guidesApi: guidesApiMock,
}))

describe('useGuidesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads industry regions using latest params and response shape', async () => {
    const store = useGuidesStore()
    const response = {
      industry: 'eor',
      industry_display_name: 'EOR',
      total_jurisdictions: 150,
      last_updated: '2026-04-25T10:30:00Z',
      regions: [
        {
          id: 'region-1',
          name: 'United States',
          slug: 'united-states',
          jurisdiction_count: 52,
          latest_update: '2026-04-25T10:30:00Z',
          url: 'https://legalwatch.dog/guides/eor/united-states/',
        },
      ],
      pagination: {
        page: 1,
        per_page: 20,
        total_pages: 3,
        total_items: 45,
      },
    }

    guidesApiMock.getIndustryRegions.mockResolvedValueOnce({
      data: {
        data: response,
      },
    })

    const result = await store.fetchIndustryRegions('eor', {
      page: 1,
      per_page: 20,
      sort: 'name',
    })

    expect(guidesApiMock.getIndustryRegions).toHaveBeenCalledWith('eor', {
      page: 1,
      per_page: 20,
      sort: 'name',
    })
    expect(result).toEqual(response)
    expect(store.regions).toEqual(response.regions)
    expect(store.pagination).toEqual(response.pagination)
  })

  it('loads region jurisdictions using latest params and response shape', async () => {
    const store = useGuidesStore()
    const response = {
      industry: 'eor',
      region_id: 'region-1',
      region_name: 'United States',
      region_slug: 'united-states',
      jurisdictions: [
        {
          id: 'jurisdiction-1',
          name: 'California',
          slug: 'california',
          post_url: 'https://legalwatch.dog/guides/eor/united-states/california/',
          summary: 'Comprehensive EOR compliance guide for California.',
          updated_at: '2026-04-25T10:30:00Z',
          key_topics: ['minimum wage', 'termination'],
        },
      ],
      pagination: {
        page: 1,
        per_page: 20,
        total_pages: 3,
        total_items: 52,
      },
    }

    guidesApiMock.getRegionJurisdictions.mockResolvedValueOnce({
      data: {
        data: response,
      },
    })

    const result = await store.fetchRegionJurisdictions('eor', 'united-states', {
      page: 1,
      per_page: 20,
      sort: 'updated',
    })

    expect(guidesApiMock.getRegionJurisdictions).toHaveBeenCalledWith('eor', 'united-states', {
      page: 1,
      per_page: 20,
      sort: 'updated',
    })
    expect(result).toEqual(response)
    expect(store.jurisdictions).toEqual(response.jurisdictions)
    expect(store.pagination).toEqual(response.pagination)
  })
})
