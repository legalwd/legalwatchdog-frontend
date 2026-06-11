import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import GuidesRegionView from '@/views/guides/GuidesRegionView.vue'

const { guidesApiMock, routeMock } = vi.hoisted(() => ({
  guidesApiMock: {
    getIndustryRegions: vi.fn(),
    getRegionJurisdictions: vi.fn(),
    getJurisdictionDetail: vi.fn(),
  },
  routeMock: {
    params: { industry: 'eor', region: 'united-states' },
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

describe('GuidesRegionView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    routeMock.params = { industry: 'eor', region: 'united-states' }
    guidesApiMock.getRegionJurisdictions.mockResolvedValue({
      data: {
        data: {
          industry: 'eor',
          region_id: 'region-1',
          region_name: 'United States',
          region_slug: 'united-states',
          jurisdictions: [
            {
              id: 'jurisdiction-1',
              name: 'California',
              slug: 'california',
              summary: 'Comprehensive EOR compliance guide for California.',
              updated_at: '2026-04-25T10:30:00Z',
              key_topics: ['minimum wage', 'termination'],
            },
          ],
          pagination: { page: 1, per_page: 20, total_pages: 1, total_items: 1 },
        },
      },
    })
  })

  it('loads region listing with latest sort params and renders jurisdictions', async () => {
    const wrapper = mount(GuidesRegionView, {
      global: {
        plugins: [createPinia()],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    expect(guidesApiMock.getRegionJurisdictions).toHaveBeenCalledWith('eor', 'united-states', {
      sort: 'name',
    })
    expect(wrapper.text()).toContain('California')
    expect(wrapper.text()).toContain('Comprehensive EOR compliance guide for California.')
    expect(wrapper.text()).toContain('minimum wage')
  })

  it('changes sort using latest backend sort values without order param', async () => {
    const wrapper = mount(GuidesRegionView, {
      global: {
        plugins: [createPinia()],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()
    await wrapper.find('select').setValue('updated')
    await flushPromises()

    expect(guidesApiMock.getRegionJurisdictions).toHaveBeenLastCalledWith('eor', 'united-states', {
      sort: 'updated',
    })
  })
})
