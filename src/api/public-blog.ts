import api from '@/lib/api'
import type {
  PublicBlogCountriesResponse,
  PublicBlogListParams,
  PublicBlogListResponse,
  PublicBlogMetaTreeResponse,
  PublicBlogPost,
  PublicBlogSearchParams,
  PublicBlogTopicsResponse,
} from '@/types/public-blog'

export interface ApiSuccessResponse<T> {
  status: string
  status_code: number
  message: string
  data: T
}

const normalizeResourcePath = (resourcePath: string) =>
  resourcePath
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')

export const publicBlogApi = {
  getPublishedPosts: (params?: PublicBlogListParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.country) searchParams.set('country', params.country)
    if (params?.topic) searchParams.set('topic', params.topic)

    const query = searchParams.toString()
    const path = `/blog/posts${query ? '?' + query : ''}`

    return api.get<ApiSuccessResponse<PublicBlogListResponse>>(path)
  },

  searchPosts: (params: PublicBlogSearchParams) => {
    const searchParams = new URLSearchParams()
    searchParams.set('q', params.q)
    if (params.page) searchParams.set('page', String(params.page))
    if (params.limit) searchParams.set('limit', String(params.limit))

    return api.get<ApiSuccessResponse<PublicBlogListResponse>>(
      `/blog/search?${searchParams.toString()}`,
    )
  },

  getMetaTree: () => api.get<ApiSuccessResponse<PublicBlogMetaTreeResponse>>('/blog/meta/tree'),

  getCountries: () =>
    api.get<ApiSuccessResponse<PublicBlogCountriesResponse>>('/blog/meta/countries'),

  getTopics: () => api.get<ApiSuccessResponse<PublicBlogTopicsResponse>>('/blog/meta/topics'),

  getPostBySlug: (slug: string, params?: { redirect_to_public_url?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.redirect_to_public_url) {
      searchParams.set('redirect_to_public_url', 'true')
    }

    const query = searchParams.toString()
    const path = `/blog/posts/${slug}${query ? '?' + query : ''}`

    return api.get<ApiSuccessResponse<PublicBlogPost>>(path)
  },

  getPostByResourcePath: (resourcePath: string) => {
    const normalizedPath = normalizeResourcePath(resourcePath)

    return api.get<ApiSuccessResponse<PublicBlogPost>>(`/blog/resources/${normalizedPath}`)
  },
}
