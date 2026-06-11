import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import GuidesIndustryView from '@/views/guides/GuidesIndustryView.vue'

const { guidesApiMock, routeMock } = vi.hoisted(() => ({
  guidesApiMock: {
    getIndustryRegions: vi.fn(),
    getRegionJurisdictions: vi.fn(),
    getJurisdictionDetail: vi.fn(),
  },
  routeMock: {
    params: { industry: 'eor' },
  },
}))

vi.mock('@/api/guides', () => ({
  guidesApi: guidesApiMock,
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
  }
})

describe('GuidesIndustryView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    routeMock.params = { industry: 'eor' }
  })

  it('loads industry listing and renders regions', async () => {
    guidesApiMock.getIndustryRegions.mockResolvedValueOnce({
      data: {
        data: {
          industry: 'eor',
          regions: [
            {
              id: 'region-1',
              name: 'United States',
              slug: 'united-states',
              jurisdiction_count: 52,
              latest_update: '2026-04-25T10:30:00Z',
            },
          ],
          pagination: { page: 1, per_page: 20, total_pages: 1, total_items: 1 },
        },
      },
    })

    const wrapper = mount(GuidesIndustryView, {
      global: {
        plugins: [createPinia()],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    expect(guidesApiMock.getIndustryRegions).toHaveBeenCalledWith('eor', undefined)
    expect(wrapper.text()).toContain('United States')
    expect(wrapper.text()).toContain('52 jurisdictions')
  })
})
