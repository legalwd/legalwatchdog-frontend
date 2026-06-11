export type CampaignStatus =
  | 'DRAFT'
  | 'LAUNCHING'
  | 'GENERATING_TAXONOMY'
  | 'TAXONOMY_READY'
  | 'HYDRATING'
  | 'DISCOVERING_SOURCES'
  | 'SCRAPING'
  | 'GENERATING_CONTENT'
  | 'PUBLISHING'
  | 'MONITORING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

export type CampaignTargetDepth = 'COUNTRY' | 'STATE' | 'CITY'

export type CampaignMonitorBackend = 'CELERY_BEAT'

export interface CampaignExecutionLog {
  id: string
  campaign_id: string
  phase: string
  started_at: string
  completed_at?: string | null
  total_items: number
  completed_items: number
  failed_items: number
  error_log?: Record<string, unknown> | null
}

export interface CampaignTaxonomyNode {
  name: string
  description?: string | null
  suggested_prompt?: string | null
  suggested_search_queries?: string[]
  iso_code?: string | null
  children?: CampaignTaxonomyNode[]
}

export interface CampaignTaxonomyPreviewStats {
  total_nodes: number
  countries: number
  states: number
  cities: number
}

export interface CampaignTaxonomyResponseData {
  campaign_id: string
  status: CampaignStatus
  taxonomy: CampaignTaxonomyNode[]
  warnings: string[]
  preview_stats: CampaignTaxonomyPreviewStats
}

export interface CampaignContentPipelineStats {
  status?: string | null
  run_id?: string | null
  mode?: CampaignContentRunMode | string | null
  generated_count?: number | null
  skipped_count?: number | null
  eligible_jurisdictions?: number | null
  total_jurisdictions?: number | null
  target_countries?: string[] | null
  target_states?: string[] | null
}

export interface CampaignStats {
  content_pipeline?: CampaignContentPipelineStats | null
  [key: string]: unknown
}

export interface Campaign {
  id: string
  organization_id: string
  name: string
  industry: string
  domain_description: string
  project_id?: string | null
  target_depth: CampaignTargetDepth
  target_countries?: string[] | null
  target_states?: string[] | null
  monitor_backend: CampaignMonitorBackend
  monitor_cadence: string
  sources_per_jurisdiction: number
  max_jurisdictions: number
  status: CampaignStatus
  created_by: string
  created_at: string
  updated_at: string
  taxonomy_approved_by?: string | null
  taxonomy_approved_at?: string | null
  launched_by?: string | null
  stats?: CampaignStats | null
  execution_logs?: CampaignExecutionLog[]
}

export interface CampaignListData {
  campaigns: Campaign[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface CampaignRuntimeStatusData {
  status: CampaignStatus
  campaign_id: string
}

export interface CampaignLaunchData {
  backend: string
  task_id: string
}

export interface CampaignApprovalData {
  campaign_id: string
  taxonomy_approved_by: string
  taxonomy_approved_at: string
  status: CampaignStatus
}

export interface CampaignMutationAck {
  [key: string]: unknown
}

export type CampaignContentRunMode = 'run' | 'retry_failed' | 'backfill_missing'

export interface CampaignContentTriggerPayload {
  countries?: string[] | null
  states?: string[] | null
}

export interface CampaignContentQueueResponse {
  status: 'queued' | string
  task_id: string
  run_id?: string | null
  mode: CampaignContentRunMode | string
}

export interface CampaignResetPayload {
  target_status: CampaignStatus
}

export interface CampaignBlogPost {
  id: string
  jurisdiction_id?: string | null
  jurisdiction_name?: string | null
  title?: string | null
  slug?: string | null
  content?: string | null
  meta_description?: string | null
  keywords?: string[] | null
  is_published?: boolean | null
  public_url?: string | null
  resource_path?: string | null
  published_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  [key: string]: unknown
}

export interface CampaignPublishedBlogItem {
  id: string
  jurisdiction_id?: string | null
  title?: string | null
  slug?: string | null
  is_published: boolean
  public_url?: string | null
  published_at?: string | null
  status: 'success' | 'failed' | string
  error?: string | null
}

export interface CampaignPublishBlogsResponse {
  campaign_id: string
  action: 'published' | 'unpublished' | string
  requested_count: number
  matched_count: number
  processed_count: number
  failed_count: number
  items: CampaignPublishedBlogItem[]
}

export interface CampaignBlogPreviewData {
  blog_id?: string
  campaign_id?: string
  html?: string
  content_html?: string
  preview_url?: string
  title?: string
  [key: string]: unknown
}

export interface CampaignFailedDiscoveryNode {
  id: string
  name?: string | null
  jurisdiction_id?: string | null
  parent_id?: string | null
  description?: string | null
  missing_sources_count?: number | null
  [key: string]: unknown
}

export interface CampaignCreatePayload {
  organization_id: string
  name: string
  industry: string
  domain_description: string
  project_id?: string | null
  target_depth: CampaignTargetDepth
  monitor_backend: CampaignMonitorBackend
  monitor_cadence: string
  sources_per_jurisdiction: number
  max_jurisdictions: number
  target_countries?: string[] | null
  target_states?: string[] | null
}

export interface CampaignUpdatePayload {
  name?: string
  industry?: string
  domain_description?: string
  project_id?: string | null
  target_depth?: CampaignTargetDepth
  monitor_backend?: CampaignMonitorBackend
  monitor_cadence?: string
  sources_per_jurisdiction?: number
  max_jurisdictions?: number
  target_countries?: string[] | null
  target_states?: string[] | null
}

export interface CampaignTaxonomyUpdatePayload {
  taxonomy: CampaignTaxonomyNode[]
}

export interface CampaignListParams {
  organization_id?: string
  status?: CampaignStatus
  industry?: string
  page?: number
  limit?: number
}

export interface ApiSuccessResponse<T> {
  status: string
  status_code: number
  message: string
  data: T
}

export interface ApiErrorResponse {
  error?: string
  error_code?: string
  status?: string
  status_code?: number
  message?: string
  errors?: Record<string, string[]>
}

export interface CampaignValidationErrorResponse {
  status?: string
  status_code?: number
  message?: string
  error_code?: string
  errors?: Record<string, string[]>
  detail?: Array<{
    loc: Array<string | number>
    msg: string
    type: string
  }>
}

export interface CampaignProgressEvent {
  event?: string
  id?: string
  retry?: number
  data?: string
}

export interface CampaignNormalizedError {
  message: string
  statusCode?: number
  errorCode?: string
  fieldErrors: Record<string, string[]>
  details: string[]
}

export interface CampaignPublishBlogsPayload {
  is_published: boolean
  publish_all?: boolean
  blog_ids?: string[]
}
