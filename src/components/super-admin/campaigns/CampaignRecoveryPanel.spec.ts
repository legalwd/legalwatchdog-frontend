import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CampaignRecoveryPanel from '@/components/super-admin/campaigns/CampaignRecoveryPanel.vue'

describe('CampaignRecoveryPanel', () => {
  it('renders recovery actions when enabled and emits their events', async () => {
    const wrapper = mount(CampaignRecoveryPanel, {
      props: {
        status: 'FAILED',
        canRetryFailedJobs: true,
        canResetToDiscovery: true,
        canResetCampaign: true,
        canSmartReset: true,
        failedDiscoveryNodes: [],
      },
    })

    const buttons = wrapper.findAll('button')
    const labels = buttons.map((button) => button.text())

    expect(labels).toContain('Retry Failed Jobs')
    expect(labels).toContain('Reset To Discovery')
    expect(labels).toContain('Reset Campaign')
    expect(labels).toContain('Smart Reset')
    expect(labels).toContain('Load Nodes')

    await buttons.find((button) => button.text() === 'Retry Failed Jobs')?.trigger('click')
    await buttons.find((button) => button.text() === 'Reset To Discovery')?.trigger('click')
    await buttons.find((button) => button.text() === 'Reset Campaign')?.trigger('click')
    await buttons.find((button) => button.text() === 'Smart Reset')?.trigger('click')
    await buttons.find((button) => button.text() === 'Load Nodes')?.trigger('click')

    expect(wrapper.emitted('retry-failed-jobs')).toHaveLength(1)
    expect(wrapper.emitted('reset-to-discovery')).toHaveLength(1)
    expect(wrapper.emitted('reset-campaign')).toHaveLength(1)
    expect(wrapper.emitted('smart-reset')).toHaveLength(1)
    expect(wrapper.emitted('load-failed-discovery-nodes')).toHaveLength(1)
  })

  it('renders failed discovery node details when nodes are provided', () => {
    const wrapper = mount(CampaignRecoveryPanel, {
      props: {
        status: 'FAILED',
        nodesLoaded: true,
        failedDiscoveryNodes: [
          {
            id: 'node-1',
            jurisdiction_id: 'jurisdiction-1',
            name: 'Lagos',
            description: 'Manual sources required',
            missing_sources_count: 2,
          },
        ],
      },
    })

    expect(wrapper.text()).toContain('Lagos')
    expect(wrapper.text()).toContain('jurisdiction-1')
    expect(wrapper.text()).toContain('Missing sources: 2')
  })

  it('does not render recovery action buttons for a cancelled campaign', () => {
    const wrapper = mount(CampaignRecoveryPanel, {
      props: {
        status: 'CANCELLED',
        failedDiscoveryNodes: [],
      },
    })

    const labels = wrapper.findAll('button').map((button) => button.text())

    expect(labels).not.toContain('Retry Failed Jobs')
    expect(labels).not.toContain('Reset To Discovery')
    expect(labels).not.toContain('Reset Campaign')
    expect(labels).not.toContain('Smart Reset')
    expect(labels).toContain('Load Nodes')
  })
})
