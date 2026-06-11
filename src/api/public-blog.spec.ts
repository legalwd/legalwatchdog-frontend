import { beforeEach, describe, expect, it, vi } from 'vitest'

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  default: apiMock,
}))

import { publicBlogApi } from '@/api/public-blog'

describe('publicBlogApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads published posts with country and topic filters', () => {
    publicBlogApi.getPublishedPosts({
      page: 2,
      limit: 10,
      country: 'united-states',
      topic: 'Payroll',
    })

    expect(apiMock.get).toHaveBeenCalledWith(
      '/blog/posts?page=2&limit=10&country=united-states&topic=Payroll',
    )
  })

  it('searches published posts with pagination', () => {
    publicBlogApi.searchPosts({ q: 'payroll compliance', page: 1, limit: 5 })

    expect(apiMock.get).toHaveBeenCalledWith('/blog/search?q=payroll+compliance&page=1&limit=5')
  })

  it('loads blog metadata endpoints', () => {
    publicBlogApi.getMetaTree()
    publicBlogApi.getCountries()
    publicBlogApi.getTopics()

    expect(apiMock.get).toHaveBeenNthCalledWith(1, '/blog/meta/tree')
    expect(apiMock.get).toHaveBeenNthCalledWith(2, '/blog/meta/countries')
    expect(apiMock.get).toHaveBeenNthCalledWith(3, '/blog/meta/topics')
  })

  it('loads a blog post by canonical resource path', () => {
    publicBlogApi.getPostByResourcePath('/resources/eor/my-country/eor-guide-my-country')

    expect(apiMock.get).toHaveBeenCalledWith(
      '/blog/resources/resources/eor/my-country/eor-guide-my-country',
    )
  })
})
