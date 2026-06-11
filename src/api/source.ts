import type { AxiosRequestConfig } from 'axios'

import api from '@/lib/api'
import type {
  Source,
  CreateSourcePayload,
  UpdateSourcePayload,
  RevisionsResponse,
  SuggestSourcesRequest,
  SuggestedSource,
  SourceType,
  ScrapeFrequency,
  ScrapeJob,
  ScrapeJobsResponse,
  ScrapeJobTriggerResponse,
} from '@/types/source'

type ApiEnvelope<T> = {
  status?: string
  status_code?: number
  message?: string
  data: T
}

type ListResponse = {
  sources: Source[]
  count: number
}

export const sourceApi = {
  create: (payload: CreateSourcePayload) =>
    api.post<ApiEnvelope<{ source: Source }>>('/sources', payload),

  list: (params?: {
    jurisdiction_id?: string
    page?: number
    limit?: number
    is_active?: boolean
  }) => api.get<ApiEnvelope<ListResponse>>('/sources', { params }),

  getOne: (source_id: string) => api.get<ApiEnvelope<{ source: Source }>>(`/sources/${source_id}`),

  update: (source_id: string, payload: UpdateSourcePayload) =>
    api.put<ApiEnvelope<{ source: Source }>>(`/sources/${source_id}`, payload),

  patch: (source_id: string, payload: UpdateSourcePayload) =>
    api.patch<ApiEnvelope<{ source: Source }>>(`/sources/${source_id}`, payload),

  delete: (source_id: string, permanent?: boolean) =>
    api.delete<ApiEnvelope<{ success?: boolean }>>(`/sources/${source_id}`, {
      params: { permanent },
    }),

  suggest: (payload: SuggestSourcesRequest) =>
    api.post<ApiEnvelope<{ sources: SuggestedSource[] }>>('/sources/suggest', payload),

  acceptSuggestions: (payload: {
    jurisdiction_id: string
    source_type?: SourceType
    scrape_frequency?: ScrapeFrequency
    suggested_sources: Array<{
      title: string
      url: string
      snippet?: string
      confidence_reason?: string
      is_official?: boolean
    }>
  }) =>
    api.post<ApiEnvelope<{ count: number; sources: Source[] }>>(
      '/sources/accept-suggestions',
      payload,
    ),

  triggerScrape: (source_id: string, config?: AxiosRequestConfig) =>
    api.post<ApiEnvelope<ScrapeJobTriggerResponse | ScrapeJob>>(
      `/sources/${source_id}/scrapes`,
      null,
      config,
    ),

  listScrapeJobs: (
    source_id: string,
    params?: { page?: number; per_page?: number },
    config?: AxiosRequestConfig,
  ) =>
    api.get<ApiEnvelope<ScrapeJobsResponse>>(`/sources/${source_id}/scrapes`, {
      ...(config || {}),
      params,
    }),

  getActiveScrapeJob: (source_id: string, config?: AxiosRequestConfig) =>
    api.get<ApiEnvelope<ScrapeJob | null>>(`/sources/${source_id}/scrapes/active`, config),

  getScrapeJobStatus: (source_id: string, job_id: string, config?: AxiosRequestConfig) =>
    api.get<ApiEnvelope<ScrapeJob>>(`/sources/${source_id}/scrapes/${job_id}`, config),

  getRevisions: (
    source_id: string,
    params?: { skip?: number; limit?: number },
    config?: AxiosRequestConfig,
  ) =>
    api.get<ApiEnvelope<RevisionsResponse>>(`/sources/${source_id}/revisions`, {
      ...(config || {}),
      params,
    }),
}

export default sourceApi
