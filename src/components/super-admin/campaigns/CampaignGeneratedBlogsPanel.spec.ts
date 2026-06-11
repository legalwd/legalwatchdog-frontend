import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CampaignGeneratedBlogsPanel from '@/components/super-admin/campaigns/CampaignGeneratedBlogsPanel.vue'

describe('CampaignGeneratedBlogsPanel', () => {
  it('renders no bulk actions before campaign blogs are loaded', () => {
    const wrapper = mount(CampaignGeneratedBlogsPanel, {
      props: {
        blogs: [],
        loadedBlogs: false,
      },
    })

    const labels = wrapper.findAll('button').map((button) => button.text())

    expect(labels).toContain('Load blogs')
    expect(labels).not.toContain('Publish All')
    expect(labels).not.toContain('Unpublish All')
    expect(wrapper.text()).toContain('Load generated blog posts')
  })

  it('renders publish controls for unpublished blogs and hides public link', () => {
    const wrapper = mount(CampaignGeneratedBlogsPanel, {
      props: {
        loadedBlogs: true,
        blogs: [
          {
            id: 'blog-1',
            title: 'Draft Blog',
            slug: 'draft-blog',
            is_published: false,
            public_url: 'https://legalwatch.dog/blog/draft-blog',
          },
        ],
      },
    })

    expect(wrapper.text()).toContain('Publish All')
    expect(wrapper.text()).toContain('Unpublish All')
    expect(wrapper.text()).toContain('Publish')
    expect(wrapper.text()).not.toContain('Open Public Page')
  })

  it('renders public link and unpublish control for published blogs', async () => {
    const wrapper = mount(CampaignGeneratedBlogsPanel, {
      props: {
        loadedBlogs: true,
        blogs: [
          {
            id: 'blog-1',
            title: 'Published Blog',
            slug: 'published-blog',
            is_published: true,
            public_url: 'https://legalwatch.dog/blog/published-blog',
          },
        ],
      },
    })

    expect(wrapper.text()).toContain('Open Public Page')
    expect(wrapper.text()).toContain('Unpublish')

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Preview')
      ?.trigger('click')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Unpublish')
      ?.trigger('click')

    expect(wrapper.emitted('preview')?.[0]).toEqual([expect.objectContaining({ id: 'blog-1' })])
    expect(wrapper.emitted('unpublish')?.[0]).toEqual([expect.objectContaining({ id: 'blog-1' })])
  })
})
