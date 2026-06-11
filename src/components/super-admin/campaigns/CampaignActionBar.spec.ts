import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CampaignActionBar from '@/components/super-admin/campaigns/CampaignActionBar.vue'

describe('CampaignActionBar', () => {
  it('renders lifecycle actions when enabled and emits their events', async () => {
    const wrapper = mount(CampaignActionBar, {
      props: {
        status: 'ACTIVE',
        canPause: true,
        canCancel: true,
      },
    })

    const buttons = wrapper.findAll('button')
    const labels = buttons.map((button) => button.text())

    expect(labels).toContain('Pause Campaign')
    expect(labels).toContain('Cancel Campaign')

    await buttons.find((button) => button.text() === 'Pause Campaign')?.trigger('click')
    await buttons.find((button) => button.text() === 'Cancel Campaign')?.trigger('click')

    expect(wrapper.emitted('pause')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('shows the empty state when no actions are available', () => {
    const wrapper = mount(CampaignActionBar, {
      props: {
        status: 'COMPLETED',
      },
    })

    expect(wrapper.text()).toContain('No actions are available for this campaign status.')
  })
})
