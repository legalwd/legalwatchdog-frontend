export interface Jurisdiction {
  id: string
  project_id: string
  parent_id: string | null
  name: string
  description: string
  prompt?: string | null
  sources?: string[]
  scrape_output?: Record<string, unknown> | null

  created_at: string
  updated_at: string | null

  // Soft delete system
  is_deleted: boolean
  deleted_at?: string | null
}

export interface CreateJurisdictionPayload {
  project_id: string
  name: string
  description?: string | null
  parent_id?: string | null
  prompt?: string | null
  scrape_output?: Record<string, unknown> | null
}

export interface UpdateJurisdictionPayload {
  name?: string
  description?: string
  parent_id?: string | null
  prompt?: string | null
  scrape_output?: Record<string, unknown> | null
  is_deleted?: boolean
}

export interface JurisdictionListResponse {
  status: string
  status_code: number
  message: string
  data: {
    jurisdictions: Jurisdiction[]
  }
}

export interface SingleJurisdictionResponse {
  status: string
  status_code: number
  message: string
  data: {
    jurisdiction: Jurisdiction
  }
}

export interface JurisdictionErrorResponse {
  response?: {
    data?: {
      detail?: string | { msg: string; type: string; loc?: (string | number)[] }[]
      message?: string
    }
  }
}

export type JurisdictionDataPageStatus = 'empty' | 'available'

export interface JurisdictionDataPageEmpty {
  status: 'empty'
  message: string
  last_updated: null
}

export interface JurisdictionDataPageAvailable {
  status: 'available'
  last_updated: string
  job_id?: string
  summary?: string | null
  markdown_content?: string | null
  extracted_data?: Record<
    string,
    | string
    | number
    | boolean
    | null
    | {
        canonical_value?: string | number | boolean | null
        has_discrepancy?: boolean
        source_count?: number
        agreement_count?: number
        discrepancies?: unknown[]
      }
  > | null
  confidence_score?: number | null
  changes?: unknown[]
  data_items?: JurisdictionDataPageItem[]
  has_unaccepted_changes?: boolean
  change_detection?: Record<string, unknown>
}

export type JurisdictionDataPage = JurisdictionDataPageEmpty | JurisdictionDataPageAvailable

export interface JurisdictionDataPageItemChange {
  field?: string
  old_value?: string | number | boolean | null
  new_value?: string | number | boolean | null
  change_description?: string
  change_id?: string
  ticket_id?: string | null
  ticket_created?: boolean
  change_accepted?: boolean
  detected_at?: string | null
}

export interface JurisdictionDataPageItem {
  field: string
  value?: string | number | boolean | null
  has_change?: boolean
  has_discrepancy?: boolean
  source_count?: number
  agreement_count?: number
  change?: JurisdictionDataPageItemChange
  change_index?: number
}

export interface JurisdictionDataPageResponse {
  status: string
  status_code: number
  message: string
  data: JurisdictionDataPage
}

export interface JurisdictionStatRevision {
  id?: string
  summary?: string
  change_summary?: string
  title?: string
  name?: string
  description?: string
}

export interface JurisdictionStats {
  change_count: number
  severity: 'Major' | 'Minor' | null
  last_change_at: string | null
  change_summary: string | null
  revisions: Array<JurisdictionStatRevision | string>
}

export interface JurisdictionScrapeTriggerData {
  job_id: string
  status: string
  total_sources: number
  started_at: string
}

export interface JurisdictionScrapeStatusData {
  job_id: string
  status: string
  started_at: string
  completed_at: string | null
  total_sources: number
  successful_sources: number
  filtered_sources: number
  progress_percentage: number
}

export interface JurisdictionScrapeTriggerResponse {
  status: string
  status_code: number
  message: string
  data: JurisdictionScrapeTriggerData
}

export interface JurisdictionScrapeStatusResponse {
  status: string
  status_code: number
  message: string
  data: JurisdictionScrapeStatusData
}

export type JurisdictionScrapeJobStatus =
  | 'PENDING'
  | 'SCRAPING'
  | 'CONSOLIDATING'
  | 'FILTERING'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED'

export interface JurisdictionScrapeHistoryItem {
  id: string
  status: JurisdictionScrapeJobStatus | string
  created_at?: string | null
  started_at?: string | null
  completed_at?: string | null
  total_sources?: number
  successful_sources?: number
  filtered_sources?: number
  changes_count?: number
  error_message?: string | null
}

export interface JurisdictionScrapeHistoryResponse {
  status: string
  status_code: number
  message: string
  data: {
    jobs: JurisdictionScrapeHistoryItem[]
    pagination?: {
      total?: number
      page?: number
      limit?: number
      total_pages?: number
    }
  }
}

export interface JurisdictionScrapeJobChange {
  field: string
  old_value: string | number | boolean | null
  new_value: string | number | boolean | null
  change_description?: string | null
  change_index?: number | null
  change_id?: string | null
  ticket_created?: boolean | null
  change_accepted?: boolean | null
}

export interface JurisdictionScrapeJobSummaryData {
  job_id: string
  jurisdiction_id: string
  status: JurisdictionScrapeJobStatus | string
  markdown_summary: string | null
  change_summary: string | null
  changes: JurisdictionScrapeJobChange[]
  error_message: string | null
  created_at?: string | null
  completed_at?: string | null
}

export interface JurisdictionScrapeJobSummaryResponse {
  status: string
  status_code: number
  message: string
  data: JurisdictionScrapeJobSummaryData
}
