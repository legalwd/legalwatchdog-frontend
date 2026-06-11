import { defineStore } from 'pinia'

import { guidesApi } from '@/api/guides'
import type {
  GuideJurisdiction,
  GuideJurisdictionDetail,
  GuideRegion,
  GuideSort,
} from '@/types/guides'
import type { PaginationMeta } from '@/types/public-blog'

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
  regions: GuideRegion[]
  jurisdictions: GuideJurisdiction[]
  activeDetail: GuideJurisdictionDetail | null
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
}

export const useGuidesStore = defineStore('guides', {
  state: (): State => ({
    regions: [],
    jurisdictions: [],
    activeDetail: null,
    pagination: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchIndustryRegions(
      industry: string,
      params?: { page?: number; per_page?: number; sort?: GuideSort },
    ) {
      this.loading = true
      this.error = null
      try {
        const { data } = await guidesApi.getIndustryRegions(industry, params)
        this.regions = data.data.regions ?? []
        this.pagination = data.data.pagination ?? null
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load industry regions')
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchRegionJurisdictions(
      industry: string,
      region: string,
      params?: { page?: number; per_page?: number; sort?: GuideSort },
    ) {
      this.loading = true
      this.error = null
      try {
        const { data } = await guidesApi.getRegionJurisdictions(industry, region, params)
        this.jurisdictions = data.data.jurisdictions ?? []
        this.pagination = data.data.pagination ?? null
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load region jurisdictions')
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchJurisdictionDetail(industry: string, region: string, jurisdiction: string) {
      this.loading = true
      this.error = null
      this.activeDetail = null
      try {
        const { data } = await guidesApi.getJurisdictionDetail(industry, region, jurisdiction)
        this.activeDetail = data.data
        return data.data
      } catch (error: unknown) {
        this.error = getErrorMessage(error, 'Failed to load jurisdiction details')
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
