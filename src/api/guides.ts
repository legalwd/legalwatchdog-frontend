import api from '@/lib/api'
import type {
  GuideSort,
  GuideIndustryResponse,
  GuideRegionResponse,
  GuideJurisdictionDetail,
} from '@/types/guides'

export interface ApiSuccessResponse<T> {
  status: string
  status_code: number
  message: string
  data: T
}

export const guidesApi = {
  getIndustryRegions: (
    industry: string,
    params?: { page?: number; per_page?: number; sort?: GuideSort },
  ) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.per_page) searchParams.set('per_page', String(params.per_page))
    if (params?.sort) searchParams.set('sort', params.sort)

    const query = searchParams.toString()
    const path = `/guides/${industry}${query ? '?' + query : ''}`

    return api.get<ApiSuccessResponse<GuideIndustryResponse>>(path)
  },

  getRegionJurisdictions: (
    industry: string,
    region: string,
    params?: { page?: number; per_page?: number; sort?: GuideSort },
  ) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.per_page) searchParams.set('per_page', String(params.per_page))
    if (params?.sort) searchParams.set('sort', params.sort)

    const query = searchParams.toString()
    const path = `/guides/${industry}/${region}${query ? '?' + query : ''}`

    return api.get<ApiSuccessResponse<GuideRegionResponse>>(path)
  },

  getJurisdictionDetail: (industry: string, region: string, jurisdiction: string) => {
    return api.get<ApiSuccessResponse<GuideJurisdictionDetail>>(
      `/guides/${industry}/${region}/${jurisdiction}`,
    )
  },
}
