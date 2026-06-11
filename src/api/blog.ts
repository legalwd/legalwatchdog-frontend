import api from '@/lib/api'

type ApiResponse<T> = {
  status?: string
  status_code?: number
  message?: string
  data: T
}

export type BlogPost = {
  id: string
  jurisdiction_id: string
  title: string
  slug: string
  content: string
  meta_description?: string
  keywords?: string[]
  is_published: boolean
  version?: number
  content_hash?: string
  created_at?: string
  updated_at?: string
  published_at?: string | null
  public_url?: string | null
  resource_path?: string | null
}

export type BlogGenerateJob = {
  job_id: string
  jurisdiction_id: string
  status: string
  message?: string
}

export type PublishedBlogPostListItem = {
  id: string
  title: string
  organization_id?: string
  organization_name?: string
  jurisdiction_id?: string
  jurisdiction_name?: string
  slug?: string | null
  public_url?: string | null
  resource_path?: string | null
}

export type PublishedBlogPostsResponse = {
  items: PublishedBlogPostListItem[]
  pagination?: {
    total?: number
    page?: number
    limit?: number
    total_pages?: number
  }
}

export const blogApi = {
  getBlogPost: (organizationId: string, jurisdictionId: string) =>
    api.get<ApiResponse<BlogPost>>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}/blog`,
    ),

  generateBlogPost: (organizationId: string, jurisdictionId: string) =>
    api.post<ApiResponse<BlogGenerateJob>>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}/blog/generate`,
    ),

  publishBlogPost: (
    organizationId: string,
    jurisdictionId: string,
    payload: { is_published: boolean },
  ) =>
    api.patch<ApiResponse<BlogPost>>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}/blog/publish`,
      payload,
    ),

  listPublishedBlogPosts: (
    organizationId: string,
    params?: { query_terms?: string[] | string | null; page?: number; limit?: number },
  ) => {
    const searchParams = new URLSearchParams()

    if (typeof params?.page === 'number') {
      searchParams.set('page', String(params.page))
    }
    if (typeof params?.limit === 'number') {
      searchParams.set('limit', String(params.limit))
    }

    if (Array.isArray(params?.query_terms)) {
      const terms = params.query_terms.filter((term) => typeof term === 'string' && term.trim())
      if (terms.length) {
        for (const term of terms) {
          searchParams.append('query_terms', term.trim())
        }
      } else {
        searchParams.append('query_terms', '')
      }
    } else if (typeof params?.query_terms === 'string') {
      searchParams.append('query_terms', params.query_terms.trim())
    } else {
      searchParams.append('query_terms', '')
    }

    const query = searchParams.toString()
    const path = `/organizations/${organizationId}/jurisdictions/blog/posts${query ? `?${query}` : ''}`

    return api.get<ApiResponse<PublishedBlogPostsResponse>>(path)
  },
}
