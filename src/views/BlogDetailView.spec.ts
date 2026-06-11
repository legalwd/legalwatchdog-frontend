import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BlogDetailView from '@/views/BlogDetailView.vue'

const { publicBlogApiMock, routeMock } = vi.hoisted(() => ({
  publicBlogApiMock: {
    getPublishedPosts: vi.fn(),
    getPostBySlug: vi.fn(),
    getPostByResourcePath: vi.fn(),
  },
  routeMock: {
    name: 'blog-detail',
    fullPath: '/blog/california-eor-guide',
    params: {} as Record<string, string | string[]>,
  },
}))

vi.mock('@/api/public-blog', () => ({
  publicBlogApi: publicBlogApiMock,
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

const makePost = () => ({
  id: 'post-1',
  title: 'California EOR Guide',
  slug: 'california-eor-guide',
  content: '# California',
  content_html: '<p>California content</p>',
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides/' },
    { name: 'California', url: '/guides/eor/united-states/california/' },
  ],
  related_jurisdictions: [
    {
      type: 'Subdivision',
      name: 'New York',
      region: 'United States',
      url: '/guides/eor/united-states/new-york/',
    },
    {
      type: 'Reference Framework',
      name: 'US Federal',
      region: 'North America',
      url: '/guides/eor/united-states/',
    },
  ],
  is_published: true,
})

describe('BlogDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    routeMock.name = 'blog-detail'
    routeMock.fullPath = '/blog/california-eor-guide'
    routeMock.params = {}
  })

  it('loads blog detail by slug for /blog/:slug', async () => {
    routeMock.params = { slug: 'california-eor-guide' }
    publicBlogApiMock.getPostBySlug.mockResolvedValueOnce({ data: { data: makePost() } })

    const wrapper = mount(BlogDetailView, {
      global: {
        plugins: [createPinia()],
      },
    })

    await flushPromises()

    expect(publicBlogApiMock.getPostBySlug).toHaveBeenCalledWith('california-eor-guide', undefined)
    expect(publicBlogApiMock.getPostByResourcePath).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('California EOR Guide')
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Guides')
    expect(wrapper.text()).toContain('New York')
    expect(wrapper.text()).toContain('US Federal')
  })

  it('loads blog detail by resource path for /resources/...', async () => {
    routeMock.name = 'blog-resource-detail'
    routeMock.fullPath = '/resources/eor/united-states/california'
    routeMock.params = { resourcePath: ['eor', 'united-states', 'california'] }
    publicBlogApiMock.getPostByResourcePath.mockResolvedValueOnce({ data: { data: makePost() } })

    mount(BlogDetailView, {
      global: {
        plugins: [createPinia()],
      },
    })

    await flushPromises()

    expect(publicBlogApiMock.getPostByResourcePath).toHaveBeenCalledWith(
      'eor/united-states/california',
    )
    expect(publicBlogApiMock.getPostBySlug).not.toHaveBeenCalled()
  })
})
