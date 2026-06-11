import type { AxiosError } from 'axios'

import api from '@/lib/api'
import { API_BASE_URL } from '@/lib/config'
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  Campaign,
  CampaignApprovalData,
  CampaignBlogPreviewData,
  CampaignBlogPost,
  CampaignContentQueueResponse,
  CampaignContentTriggerPayload,
  CampaignCreatePayload,
  CampaignFailedDiscoveryNode,
  CampaignLaunchData,
  CampaignListData,
  CampaignListParams,
  CampaignMutationAck,
  CampaignNormalizedError,
  CampaignResetPayload,
  CampaignRuntimeStatusData,
  CampaignTaxonomyResponseData,
  CampaignTaxonomyUpdatePayload,
  CampaignUpdatePayload,
  CampaignValidationErrorResponse,
  CampaignPublishBlogsPayload,
  CampaignPublishBlogsResponse,
} from '@/types/campaign'

const buildCampaignProgressStreamUrl = (campaignId: string) => {
  const base = API_BASE_URL.replace(/\/$/, '')
  return `${base}/campaigns/${campaignId}/progress-stream`
}

export const normalizeCampaignError = (
  error: unknown,
  fallback: string,
): CampaignNormalizedError => {
  const err = error as AxiosError<ApiErrorResponse & CampaignValidationErrorResponse>
  const response = err.response?.data
  const statusCode = response?.status_code ?? err.response?.status
  const errorCode = response?.error_code
  const fieldErrors = response?.errors ?? {}
  const details = Array.isArray(response?.detail)
    ? response.detail.map((item) => item.msg).filter(Boolean)
    : []
  const withMetadata = (message: string): CampaignNormalizedError => ({
    message,
    ...(statusCode !== undefined ? { statusCode } : {}),
    ...(errorCode !== undefined ? { errorCode } : {}),
    fieldErrors,
    details,
  })

  if (!response) {
    return {
      message: 'Network error: Unable to reach server',
      fieldErrors: {},
      details: [],
    }
  }

  if (statusCode === 404 || errorCode === 'NOT_FOUND') {
    return withMetadata(response.message || 'Campaign resource was not found')
  }

  if (statusCode === 423 || errorCode === 'RESOURCE_LOCKED') {
    return withMetadata(response.message || 'This campaign is locked for the requested operation')
  }

  if (statusCode === 422 || errorCode === 'PROCESSING_ERROR') {
    return withMetadata(
      response.message || details[0] || Object.values(fieldErrors)[0]?.[0] || fallback,
    )
  }

  return withMetadata(
    response.message || Object.values(fieldErrors)[0]?.[0] || details[0] || fallback,
  )
}

export const campaignApi = {
  listCampaigns: (params?: CampaignListParams) =>
    api.get<ApiSuccessResponse<CampaignListData>>('/campaigns', {
      params,
    }),

  getCampaign: (campaignId: string) =>
    api.get<ApiSuccessResponse<Campaign>>(`/campaigns/${campaignId}`),

  createCampaign: (payload: CampaignCreatePayload) =>
    api.post<ApiSuccessResponse<Campaign>>('/campaigns', payload),

  updateCampaign: (campaignId: string, payload: CampaignUpdatePayload) =>
    api.patch<ApiSuccessResponse<Campaign>>(`/campaigns/${campaignId}`, payload),

  deleteCampaign: (campaignId: string) =>
    api.delete<ApiSuccessResponse<Record<string, never>>>(`/campaigns/${campaignId}`),

  launchCampaign: (campaignId: string) =>
    api.post<ApiSuccessResponse<CampaignLaunchData>>(`/campaigns/${campaignId}/launch`),

  getCampaignStatus: (campaignId: string) =>
    api.get<ApiSuccessResponse<CampaignRuntimeStatusData>>(`/campaigns/${campaignId}/status`),

  pauseCampaign: (campaignId: string) =>
    api.post<ApiSuccessResponse<Record<string, never>>>(`/campaigns/${campaignId}/pause`),

  resumeCampaign: (campaignId: string) =>
    api.post<ApiSuccessResponse<Record<string, never>>>(`/campaigns/${campaignId}/resume`),

  cancelCampaign: (campaignId: string) =>
    api.post<ApiSuccessResponse<Record<string, never>>>(`/campaigns/${campaignId}/cancel`),

  generateTaxonomy: (campaignId: string) =>
    api.post<ApiSuccessResponse<Pick<Campaign, 'id' | 'status'>>>(
      `/campaigns/${campaignId}/generate-taxonomy`,
    ),

  getTaxonomy: (campaignId: string) =>
    api.get<ApiSuccessResponse<CampaignTaxonomyResponseData>>(`/campaigns/${campaignId}/taxonomy`),

  updateTaxonomy: (campaignId: string, payload: CampaignTaxonomyUpdatePayload) =>
    api.patch<ApiSuccessResponse<CampaignTaxonomyResponseData>>(
      `/campaigns/${campaignId}/taxonomy`,
      payload,
    ),

  approveTaxonomy: (campaignId: string) =>
    api.post<ApiSuccessResponse<CampaignApprovalData>>(`/campaigns/${campaignId}/approve-taxonomy`),

  retryFailedJobs: (campaignId: string) =>
    api.post<ApiSuccessResponse<CampaignMutationAck | null>>(
      `/campaigns/${campaignId}/retry-failed-jobs`,
      {},
    ),

  listCampaignBlogs: (campaignId: string) =>
    api.get<ApiSuccessResponse<CampaignBlogPost[]>>(`/campaigns/${campaignId}/blogs`),

  getFailedDiscoveryNodes: (campaignId: string) =>
    api.get<ApiSuccessResponse<CampaignFailedDiscoveryNode[]>>(
      `/campaigns/${campaignId}/failed-discovery-nodes`,
    ),

  resetToDiscovery: (campaignId: string) =>
    api.post<ApiSuccessResponse<CampaignMutationAck | null>>(
      `/campaigns/${campaignId}/reset-to-discovery`,
      {},
    ),

  resetCampaign: (campaignId: string, payload: CampaignResetPayload) =>
    api.post<ApiSuccessResponse<CampaignMutationAck | null>>(
      `/campaigns/${campaignId}/reset`,
      payload,
    ),

  smartResetCampaign: (campaignId: string) =>
    api.post<ApiSuccessResponse<CampaignMutationAck | null>>(
      `/campaigns/${campaignId}/smart-reset`,
      {},
    ),

  runContentGeneration: (campaignId: string, payload?: CampaignContentTriggerPayload | null) =>
    api.post<ApiSuccessResponse<CampaignContentQueueResponse>>(
      `/campaigns/${campaignId}/content/run`,
      payload ?? {},
    ),

  retryFailedContent: (campaignId: string, payload?: CampaignContentTriggerPayload | null) =>
    api.post<ApiSuccessResponse<CampaignContentQueueResponse>>(
      `/campaigns/${campaignId}/content/retry-failed`,
      payload ?? {},
    ),

  backfillMissingContent: (campaignId: string, payload?: CampaignContentTriggerPayload | null) =>
    api.post<ApiSuccessResponse<CampaignContentQueueResponse>>(
      `/campaigns/${campaignId}/content/backfill-missing`,
      payload ?? {},
    ),

  publishCampaignBlogs: (campaignId: string, payload: CampaignPublishBlogsPayload) =>
    api.post<ApiSuccessResponse<CampaignPublishBlogsResponse>>(
      `/campaigns/${campaignId}/blogs/publish`,
      payload,
    ),

  previewCampaignBlog: (campaignId: string, blogId: string) =>
    api.get<ApiSuccessResponse<CampaignBlogPreviewData>>(
      `/campaigns/${campaignId}/blogs/${blogId}/preview`,
    ),

  openCampaignProgressStream: (campaignId: string) =>
    new EventSource(buildCampaignProgressStreamUrl(campaignId), {
      withCredentials: true,
    }),
}
