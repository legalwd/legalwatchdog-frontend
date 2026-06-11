import type { Breadcrumb, PaginationMeta } from './public-blog'

export type GuideSort = 'name' | 'name_desc' | 'updated' | 'updated_asc'

export interface GuideRegion {
  id: string
  name: string
  slug: string
  jurisdiction_count: number
  latest_update?: string | null
  url?: string
}

export interface GuideIndustryResponse {
  industry: string
  industry_display_name?: string
  total_jurisdictions?: number
  last_updated?: string | null
  regions: GuideRegion[]
  pagination: PaginationMeta
}

export interface GuideJurisdiction {
  id: string
  name: string
  slug: string
  post_url?: string
  summary?: string
  updated_at?: string | null
  key_topics?: string[]
}

export interface GuideRegionResponse {
  industry: string
  region_id?: string
  region_name: string
  region_slug: string
  jurisdictions: GuideJurisdiction[]
  pagination: PaginationMeta
}

export interface GuideJurisdictionDetail {
  id: string
  name: string
  slug: string
  industry: string
  post_url?: string
  title?: string
  meta_description?: string
  keywords?: string[]
  content_html?: string
  breadcrumbs: Breadcrumb[]
  published_at?: string | null
  updated_at?: string | null
}
