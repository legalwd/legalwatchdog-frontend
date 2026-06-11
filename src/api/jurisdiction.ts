import api from '@/lib/api'
import type {
  JurisdictionScrapeStatusResponse,
  JurisdictionScrapeTriggerResponse,
  JurisdictionScrapeHistoryResponse,
  JurisdictionScrapeJobSummaryResponse,
  JurisdictionStats,
} from '@/types/jurisdiction'

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
  deleted_at?: string | null
  is_deleted: boolean
}

interface JurisdictionResponse {
  status: string
  status_code: number
  message: string
  data: {
    jurisdictions: Jurisdiction[]
  }
}

interface JurisdictionDataPageResponse {
  status: string
  status_code: number
  message: string
  data: {
    status: 'empty' | 'available'
    message?: string
    last_updated: string | null
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
    data_items?: Array<{
      field: string
      value?: string | number | boolean | null
      has_change?: boolean
      has_discrepancy?: boolean
      source_count?: number
      agreement_count?: number
      change?: {
        field?: string
        old_value?: string | number | boolean | null
        new_value?: string | number | boolean | null
        change_description?: string
        change_id?: string
        ticket_id?: string | null
        ticket_created?: boolean
        change_accepted?: boolean
        detected_at?: string
      }
      change_index?: number
    }>
    has_unaccepted_changes?: boolean
    change_detection?: Record<string, unknown>
  }
}

interface SingleJurisdictionResponse {
  status: string
  status_code: number
  message: string
  data: {
    jurisdiction: Jurisdiction
  }
}

interface JurisdictionStatsResponse {
  status: string
  status_code: number
  message: string
  data: JurisdictionStats
}

export const jurisdictionApi = {
  getAll: (organizationId: string) =>
    api.get<JurisdictionResponse>(`/organizations/${organizationId}/jurisdictions/`),

  getByProject: (organizationId: string, projectId: string) =>
    api.get<JurisdictionResponse>(
      `/organizations/${organizationId}/jurisdictions/project/${projectId}`,
    ),

  getOne: (organizationId: string, jurisdictionId: string) =>
    api.get<SingleJurisdictionResponse>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}`,
    ),

  create: (
    organizationId: string,
    data: {
      project_id: string
      name: string
      description?: string | null
      prompt?: string | null
      parent_id?: string | null
      scrape_output?: Record<string, unknown> | null
    },
  ) =>
    api.post<SingleJurisdictionResponse>(`/organizations/${organizationId}/jurisdictions/`, data),

  update: (organizationId: string, jurisdictionId: string, data: Partial<Jurisdiction>) =>
    api.patch<SingleJurisdictionResponse>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}`,
      data,
    ),

  delete: (organizationId: string, jurisdictionId: string) =>
    api.delete(`/organizations/${organizationId}/jurisdictions/${jurisdictionId}`),

  restore: (organizationId: string, jurisdictionId: string) =>
    api.post(`/organizations/${organizationId}/jurisdictions/${jurisdictionId}/restoration`),

  deleteByProject: (organizationId: string, projectId: string) =>
    api.delete(`/organizations/${organizationId}/jurisdictions/project/${projectId}/`),

  restoreByProject: (organizationId: string, projectId: string) =>
    api.post(`/organizations/${organizationId}/jurisdictions/project/${projectId}/restoration`),

  getDataPage: (organizationId: string, jurisdictionId: string) =>
    api.get<JurisdictionDataPageResponse>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}/data-page`,
    ),

  acceptChange: (jurisdictionId: string, changeId: string) =>
    api.post(`/jurisdictions/${jurisdictionId}/changes/${changeId}/accept`),

  getStats: (organizationId: string, jurisdictionId: string) =>
    api.get<JurisdictionStatsResponse>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}/stats`,
    ),

  triggerScrape: (organizationId: string, jurisdictionId: string) =>
    api.post<JurisdictionScrapeTriggerResponse>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}/scrape`,
    ),

  getScrapeStatus: (organizationId: string, jurisdictionId: string) =>
    api.get<JurisdictionScrapeStatusResponse>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}/scrape-status`,
    ),

  getScrapeHistory: (
    organizationId: string,
    jurisdictionId: string,
    params?: { page?: number; page_size?: number; status?: string | null },
  ) =>
    api.get<JurisdictionScrapeHistoryResponse>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}/scrape-history`,
      { params },
    ),

  getScrapeJobSummary: (organizationId: string, jurisdictionId: string, jobId: string) =>
    api.get<JurisdictionScrapeJobSummaryResponse>(
      `/organizations/${organizationId}/jurisdictions/${jurisdictionId}/scrape-jobs/${jobId}/summary`,
    ),
}
