import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePublicBlogStore } from '@/stores/public-blog-store'

const { publicBlogApiMock } = vi.hoisted(() => ({
  publicBlogApiMock: {
    getPublishedPosts: vi.fn(),
    searchPosts: vi.fn(),
    getMetaTree: vi.fn(),
    getCountries: vi.fn(),
    getTopics: vi.fn(),
    getPostBySlug: vi.fn(),
    getPostByResourcePath: vi.fn(),
  },
}))

vi.mock('@/api/public-blog', () => ({
  publicBlogApi: publicBlogApiMock,
}))

describe('usePublicBlogStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads active post by resource path', async () => {
    const store = usePublicBlogStore()
    const post = {
      id: 'post-1',
      title: 'California EOR Guide',
      slug: 'california-eor-guide',
      content: '# California',
      content_html: '<h1>California</h1>',
      is_published: true,
      resource_path: 'resources/eor/united-states/california',
    }

    publicBlogApiMock.getPostByResourcePath.mockResolvedValueOnce({
      data: {
        data: post,
      },
    })

    const result = await store.fetchPostByResourcePath('resources/eor/united-states/california')

    expect(publicBlogApiMock.getPostByResourcePath).toHaveBeenCalledWith(
      'resources/eor/united-states/california',
    )
    expect(result).toEqual(post)
    expect(store.activePost).toEqual(post)
    expect(store.error).toBeNull()
  })

  it('loads and appends filtered published posts', async () => {
    const store = usePublicBlogStore()

    publicBlogApiMock.getPublishedPosts
      .mockResolvedValueOnce({
        data: {
          data: {
            items: [
              {
                id: 'post-1',
                title: 'US Payroll',
                slug: 'us-payroll',
                content: '',
                content_html: '',
                is_published: true,
              },
            ],
            pagination: { page: 1, per_page: 1, total_pages: 2, total_items: 2 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            items: [
              {
                id: 'post-2',
                title: 'California Payroll',
                slug: 'california-payroll',
                content: '',
                content_html: '',
                is_published: true,
              },
            ],
            pagination: { page: 2, per_page: 1, total_pages: 2, total_items: 2 },
          },
        },
      })

    await store.fetchPosts({ country: 'united-states', topic: 'Payroll', page: 1, limit: 1 })
    await store.fetchPosts({
      country: 'united-states',
      topic: 'Payroll',
      page: 2,
      limit: 1,
      append: true,
    })

    expect(publicBlogApiMock.getPublishedPosts).toHaveBeenNthCalledWith(1, {
      country: 'united-states',
      topic: 'Payroll',
      page: 1,
      limit: 1,
    })
    expect(store.posts.map((post) => post.id)).toEqual(['post-1', 'post-2'])
    expect(store.pagination?.page).toBe(2)
  })

  it('searches posts and stores search query', async () => {
    const store = usePublicBlogStore()

    publicBlogApiMock.searchPosts.mockResolvedValueOnce({
      data: {
        data: {
          items: [
            {
              id: 'post-1',
              title: 'Mexico Payroll',
              slug: 'mexico-payroll',
              content: '',
              content_html: '',
              is_published: true,
            },
          ],
          pagination: { page: 1, per_page: 20, total_pages: 1, total_items: 1 },
        },
      },
    })

    const result = await store.searchPosts({ q: 'mexico payroll', page: 1, limit: 20 })

    expect(publicBlogApiMock.searchPosts).toHaveBeenCalledWith({
      q: 'mexico payroll',
      page: 1,
      limit: 20,
    })
    expect(result?.items).toHaveLength(1)
    expect(store.searchQuery).toBe('mexico payroll')
  })

  it('loads blog metadata', async () => {
    const store = usePublicBlogStore()

    publicBlogApiMock.getMetaTree.mockResolvedValueOnce({
      data: {
        data: {
          tree: [
            {
              id: 'country-1',
              name: 'United States',
              slug: 'united-states',
              url: '/guides/eor/united-states/',
              children: [],
            },
          ],
        },
      },
    })
    publicBlogApiMock.getCountries.mockResolvedValueOnce({
      data: { data: { countries: [{ name: 'United States', slug: 'united-states' }] } },
    })
    publicBlogApiMock.getTopics.mockResolvedValueOnce({
      data: { data: { topics: ['Payroll'] } },
    })

    await store.fetchMetaTree()
    await store.fetchCountries()
    await store.fetchTopics()

    expect(store.tree[0]?.name).toBe('United States')
    expect(store.countries[0]?.slug).toBe('united-states')
    expect(store.topics).toEqual(['Payroll'])
  })

  it('stores selected blog filters', () => {
    const store = usePublicBlogStore()

    store.setFilters({
      country: 'mexico',
      topic: 'Payroll',
      search: 'eor',
    })

    expect(store.selectedCountry).toBe('mexico')
    expect(store.selectedTopic).toBe('Payroll')
    expect(store.searchQuery).toBe('eor')
  })
})
