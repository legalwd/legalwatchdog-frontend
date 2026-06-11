import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CampaignContentActionsPanel from '@/components/super-admin/campaigns/CampaignContentActionsPanel.vue'

describe('CampaignContentActionsPanel', () => {
  const mountPanel = () => mount(CampaignContentActionsPanel)

  const findButtonByText = (wrapper: ReturnType<typeof mountPanel>, text: string) => {
    const button = wrapper.findAll('button').find((button) => button.text() === text)

    if (!button) {
      throw new Error(`Expected to find button: ${text}`)
    }

    return button
  }

  const setRuntimeScope = async (
    wrapper: ReturnType<typeof mountPanel>,
    countries: string,
    states: string,
  ) => {
    const [countriesInput, statesInput] = wrapper.findAll('input')

    if (!countriesInput || !statesInput) {
      throw new Error('Expected to find countries and states inputs')
    }

    await countriesInput.setValue(countries)
    await statesInput.setValue(states)
  }

  it('emits null runtime scope when scope inputs are blank', async () => {
    const wrapper = mountPanel()

    await findButtonByText(wrapper, 'Run Content').trigger('click')

    expect(wrapper.emitted('run-content')).toEqual([[null]])
  })

  it('emits parsed runtime scope for content actions', async () => {
    const wrapper = mountPanel()

    await setRuntimeScope(wrapper, 'MX, United States', 'Nuevo Leon, CA')

    await findButtonByText(wrapper, 'Retry Failed Content').trigger('click')
    await findButtonByText(wrapper, 'Backfill Missing Content').trigger('click')

    const expectedPayload = {
      countries: ['MX', 'United States'],
      states: ['Nuevo Leon', 'CA'],
    }

    expect(wrapper.emitted('retry-failed-content')).toEqual([[expectedPayload]])
    expect(wrapper.emitted('backfill-missing-content')).toEqual([[expectedPayload]])

    expect(wrapper.text()).toContain('Countries: MX, United States')
    expect(wrapper.text()).toContain('States: Nuevo Leon, CA')
  })

  it('trims whitespace and removes empty runtime scope entries', async () => {
    const wrapper = mountPanel()

    await setRuntimeScope(wrapper, ' MX, , United States ', ' Nuevo Leon, , CA ')

    await findButtonByText(wrapper, 'Retry Failed Content').trigger('click')

    expect(wrapper.emitted('retry-failed-content')).toEqual([
      [
        {
          countries: ['MX', 'United States'],
          states: ['Nuevo Leon', 'CA'],
        },
      ],
    ])
  })

  it('emits null runtime scope for retry and backfill when scope inputs are blank', async () => {
    const wrapper = mountPanel()

    await findButtonByText(wrapper, 'Retry Failed Content').trigger('click')
    await findButtonByText(wrapper, 'Backfill Missing Content').trigger('click')

    expect(wrapper.emitted('retry-failed-content')).toEqual([[null]])
    expect(wrapper.emitted('backfill-missing-content')).toEqual([[null]])
  })
})
