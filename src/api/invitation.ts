import api from '@/lib/api'
import type { Invitation } from '@/types/invitation'

type ApiResponse<T> = {
  status?: string
  status_code?: number
  message?: string
  data?: T
}

type InvitationsPayload = {
  invitations?: Invitation[]
  data?: Invitation[]
  // Some responses return the array directly
  [key: string]: unknown
}

export const invitationService = {
  listMyInvitations: () => api.get<ApiResponse<InvitationsPayload>>('/users/me/invitations'),
  acceptInvitation: (token: string) =>
    api.post<
      ApiResponse<{ organization_id?: string; organization_name?: string; role_name?: string }>
    >(`/auth/invitations/${token}/accept`, undefined, {
      validateStatus: (status) => (status >= 200 && status < 300) || status === 302,
    }),
  listOrganizationInvitations: (organizationId: string, params?: Record<string, unknown>) =>
    api.get<ApiResponse<InvitationsPayload>>(
      `/organizations/${organizationId}/invitations`,
      params ? { params } : undefined,
    ),
  cancelOrganizationInvitation: (organizationId: string, invitationId: string) =>
    api.delete<ApiResponse<unknown>>(
      `/organizations/${organizationId}/invitations/${invitationId}`,
    ),
}
