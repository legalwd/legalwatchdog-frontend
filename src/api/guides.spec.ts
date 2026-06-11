import { beforeEach, describe, expect, it, vi } from 'vitest'

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  default: apiMock,
}))

import { guidesApi } from '@/api/guides'

describe('guidesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads industry regions with latest path and query params', () => {
    guidesApi.getIndustryRegions('eor', { page: 1, per_page: 20, sort: 'name' })

    expect(apiMock.get).toHaveBeenCalledWith('/guides/eor?page=1&per_page=20&sort=name')
  })

  it('loads region jurisdictions with latest path and query params', () => {
    guidesApi.getRegionJurisdictions('eor', 'united-states', {
      page: 1,
      per_page: 20,
      sort: 'updated',
    })

    expect(apiMock.get).toHaveBeenCalledWith(
      '/guides/eor/united-states?page=1&per_page=20&sort=updated',
    )
  })
})
