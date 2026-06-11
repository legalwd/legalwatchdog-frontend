import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import GuidesJurisdictionDetailView from '@/views/guides/GuidesJurisdictionDetailView.vue'

const { guidesApiMock, routeMock } = vi.hoisted(() => ({
  guidesApiMock: {
    getIndustryRegions: vi.fn(),
    getRegionJurisdictions: vi.fn(),
    getJurisdictionDetail: vi.fn(),
  },
  routeMock: {
    params: { industry: 'eor', region: 'united-states', jurisdiction: 'california' },
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

describe('GuidesJurisdictionDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    routeMock.params = { industry: 'eor', region: 'united-states', jurisdiction: 'california' }
  })

  it('loads jurisdiction detail metadata and renders latest fields', async () => {
    guidesApiMock.getJurisdictionDetail.mockResolvedValueOnce({
      data: {
        data: {
          id: 'jurisdiction-1',
          name: 'California',
          slug: 'california',
          industry: 'eor',
          title: 'California EOR Compliance Guide 2026',
          meta_description: 'Comprehensive EOR compliance guide for California.',
          keywords: ['California', 'EOR'],
          breadcrumbs: [
            { name: 'United States', url: '/guides/eor/united-states' },
            { name: 'California', url: '/guides/eor/united-states/california' },
          ],
          updated_at: '2026-04-25T10:30:00Z',
        },
      },
    })

    const wrapper = mount(GuidesJurisdictionDetailView, {
      global: {
        plugins: [createPinia()],
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    await flushPromises()

    expect(guidesApiMock.getJurisdictionDetail).toHaveBeenCalledWith(
      'eor',
      'united-states',
      'california',
    )
    expect(wrapper.text()).toContain('California EOR Compliance Guide 2026')
    expect(wrapper.text()).toContain('Comprehensive EOR compliance guide for California.')
    expect(wrapper.text()).toContain('California')
    expect(wrapper.text()).toContain('EOR')
  })
})
