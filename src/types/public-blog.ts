export interface Breadcrumb {
  name: string
  url: string
}

export interface RelatedJurisdiction {
  type: string
  name: string
  region: string
  url: string
}

export interface PublicBlogPost {
  id: string
  jurisdiction_id?: string
  title: string
  slug: string
  content: string
  content_html: string
  meta_description?: string
  keywords?: string[]
  breadcrumbs?: Breadcrumb[]
  is_published: boolean
  version?: number
  content_hash?: string
  generation_model?: string | null
  generated_at?: string
  created_at?: string
  updated_at?: string
  published_at?: string
  resource_path?: string
  public_url?: string
  related_jurisdictions?: RelatedJurisdiction[]
}

export interface PaginationMeta {
  page: number
  per_page: number
  total_pages: number
  total_items: number
}

export interface PublicBlogListResponse {
  items: PublicBlogPost[]
  pagination: PaginationMeta
}

export interface PublicBlogListParams {
  page?: number
  limit?: number
  country?: string | null
  topic?: string | null
}

export interface PublicBlogSearchParams {
  q: string
  page?: number
  limit?: number
}

export interface PublicBlogMetaTreeNode {
  id: string
  name: string
  slug: string
  url: string
  children: PublicBlogMetaTreeNode[]
}

export interface PublicBlogMetaTreeResponse {
  tree: PublicBlogMetaTreeNode[]
}

export interface PublicBlogCountry {
  name: string
  slug: string
}

export interface PublicBlogCountriesResponse {
  countries: PublicBlogCountry[]
}

export interface PublicBlogTopicsResponse {
  topics: string[]
}
