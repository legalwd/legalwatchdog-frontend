import { defineStore } from 'pinia'

import { publicBlogApi } from '@/api/public-blog'
import type {
  PaginationMeta,
  PublicBlogCountry,
  PublicBlogListParams,
  PublicBlogMetaTreeNode,
  PublicBlogPost,
  PublicBlogSearchParams,
} from '@/types/public-blog'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response
    if (typeof response?.data?.message === 'string') {
      return response.data.message
    }
  }

  return fallback
}

interface State {
  posts: PublicBlogPost[]
  activePost: PublicBlogPost | null
  pagination: PaginationMeta | null
  tree: PublicBlogMetaTreeNode[]
  countries: PublicBlogCountry[]
  topics: string[]
  selectedCountry: string
  selectedTopic: string
  searchQuery: string
  loading: boolean
  loadingMeta: boolean
  error: string | null
}

export const usePublicBlogStore = defineStore('publicBlog', {
  state: (): State => ({
    posts: [],
    activePost: null,
    pagination: null,
    tree: [],
    countries: [],
    topics: [],
    selectedCountry: '',
    selectedTopic: '',
    searchQuery: '',
    loading: false,
    loadingMeta: false,
    error: null,
  }),

  actions: {
    applyListData(data: { items?: PublicBlogPost[]; pagination?: PaginationMeta }, append = false) {
      const items = data.items ?? []
      this.posts = append ? [...this.posts, ...items] : items
      this.pagination = data.pagination ?? null
    },

    setFilters(filters: {
      country?: string | null
      topic?: string | null
      search?: string | null
    }) {
      if (filters.country !== undefined) {
        this.selectedCountry = filters.country ?? ''
      }
      if (filters.topic !== undefined) {
        this.selectedTopic = filters.topic ?? ''
      }
      if (filters.search !== undefined) {
        this.searchQuery = filters.search ?? ''
      }
    },

    async fetchPosts(params?: PublicBlogListParams & { append?: boolean }) {
      this.loading = true
      this.error = null
      try {
        const { append = false, ...requestParams } = params ?? {}
        const { data } = await publicBlogApi.getPublishedPosts(requestParams)
        this.applyListData(data.data, append)
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load posts')
        return null
      } finally {
        this.loading = false
      }
    },

    async searchPosts(params: PublicBlogSearchParams & { append?: boolean }) {
      this.loading = true
      this.error = null
      this.searchQuery = params.q
      try {
        const { append = false, ...requestParams } = params
        const { data } = await publicBlogApi.searchPosts(requestParams)
        this.applyListData(data.data, append)
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to search posts')
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchMetaTree() {
      this.loadingMeta = true
      this.error = null
      try {
        const { data } = await publicBlogApi.getMetaTree()
        this.tree = data.data.tree ?? []
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load blog navigation')
        return null
      } finally {
        this.loadingMeta = false
      }
    },

    async fetchCountries() {
      this.loadingMeta = true
      this.error = null
      try {
        const { data } = await publicBlogApi.getCountries()
        this.countries = data.data.countries ?? []
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load countries')
        return null
      } finally {
        this.loadingMeta = false
      }
    },

    async fetchTopics() {
      this.loadingMeta = true
      this.error = null
      try {
        const { data } = await publicBlogApi.getTopics()
        this.topics = data.data.topics ?? []
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load topics')
        return null
      } finally {
        this.loadingMeta = false
      }
    },

    async fetchPostBySlug(slug: string, params?: { redirect_to_public_url?: boolean }) {
      this.loading = true
      this.error = null
      this.activePost = null
      try {
        const { data } = await publicBlogApi.getPostBySlug(slug, params)
        this.activePost = data.data
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load post')
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchPostByResourcePath(resourcePath: string) {
      this.loading = true
      this.error = null
      this.activePost = null
      try {
        const { data } = await publicBlogApi.getPostByResourcePath(resourcePath)
        this.activePost = data.data
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load post')
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
