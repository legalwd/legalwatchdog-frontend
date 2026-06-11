import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CampaignSummaryPanel from '@/components/super-admin/campaigns/CampaignSummaryPanel.vue'
import type { Campaign } from '@/types/campaign'

const makeCampaign = (overrides: Partial<Campaign> = {}): Campaign => ({
  id: 'campaign-1',
  organization_id: 'org-1',
  name: 'EOR Compliance',
  industry: 'EOR',
  domain_description: 'Monitor EOR obligations',
  project_id: null,
  target_depth: 'STATE',
  target_countries: ['US', 'MX'],
  target_states: ['California', 'Nuevo Leon'],
  monitor_backend: 'CELERY_BEAT',
  monitor_cadence: '0 9 * * 1',
  sources_per_jurisdiction: 5,
  max_jurisdictions: 100,
  status: 'ACTIVE',
  created_by: 'admin-1',
  created_at: '2026-06-01T00:00:00.000Z',
  updated_at: '2026-06-01T00:00:00.000Z',
  execution_logs: [],
  ...overrides,
})

describe('CampaignSummaryPanel', () => {
  it('renders configured geographic scope and targeted content run metadata', () => {
    const wrapper = mount(CampaignSummaryPanel, {
      props: {
        campaign: makeCampaign({
          stats: {
            content_pipeline: {
              status: 'COMPLETED',
              mode: 'run',
              generated_count: 1,
              eligible_jurisdictions: 1,
              target_countries: ['MX'],
              target_states: ['Nuevo Leon'],
            },
          },
        }),
      },
    })

    const text = wrapper.text()

    expect(text).toContain('US, MX')
    expect(text).toContain('California, Nuevo Leon')
    expect(text).toContain('COMPLETED')
    expect(text).toContain('Targeted Run: MX -> Nuevo Leon')
    expect(text).toContain('Generated: 1')
    expect(text).toContain('Eligible: 1')
  })

  it('renders global labels when no campaign scope is configured', () => {
    const wrapper = mount(CampaignSummaryPanel, {
      props: {
        campaign: makeCampaign({
          target_countries: null,
          target_states: null,
        }),
      },
    })

    const text = wrapper.text()

    expect(text).toContain('Countries')
    expect(text).toContain('States')
    expect(text.match(/Global/g)).toHaveLength(2)
  })

  it('renders global labels when campaign scope arrays are empty', () => {
    const wrapper = mount(CampaignSummaryPanel, {
      props: {
        campaign: makeCampaign({
          target_countries: [],
          target_states: [],
        }),
      },
    })

    const text = wrapper.text()

    expect(text.match(/Global/g)).toHaveLength(2)
  })
})
