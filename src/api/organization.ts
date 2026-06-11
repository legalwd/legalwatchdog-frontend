import api from '@/lib/api'
import type {
  CreateOrganizationPayload,
  InviteMemberPayload,
  OrganizationMember,
  UpdateOrganizationPayload,
  RawOrganization,
  UserOrganizationDetails,
} from '@/types/organization'

interface OrganizationsResponse {
  status: string
  status_code: number
  message: string
  data:
    | RawOrganization[]
    | {
        organisations?: RawOrganization[]
        organizations?: RawOrganization[]
        total?: number
        page?: number
        limit?: number
        total_pages?: number
      }
}

interface OrganizationResponse {
  status: string
  status_code: number
  message: string
  data: RawOrganization
}

interface OrganizationDetailsResponse {
  status: string
  status_code: number
  message: string
  data: UserOrganizationDetails
}

interface InviteMemberResponse {
  status?: string
  status_code?: number
  message?: string
  data?: {
    message?: string
  }
}

interface OrganizationUsersResponse {
  status?: string
  status_code?: number
  message?: string
  data?: {
    users?: OrganizationMember[]
  }
}

export const organizationService = {
  listOrganizations: (page?: number, limit?: number) => {
    const params: Record<string, number> = {}
    if (typeof page === 'number') params.page = page
    if (typeof limit === 'number') params.limit = limit

    return api.get<OrganizationsResponse>(`/users/me/organizations`, {
      params: Object.keys(params).length ? params : undefined,
    })
  },
  listOrganizationsByUser: (userId: string, page?: number, limit?: number) => {
    const params: Record<string, number> = {}
    if (typeof page === 'number') params.page = page
    if (typeof limit === 'number') params.limit = limit

    return api.get<OrganizationsResponse>(`/users/${userId}/organizations`, {
      params: Object.keys(params).length ? params : undefined,
    })
  },
  createOrganization: (payload: CreateOrganizationPayload) =>
    api.post<OrganizationResponse>('/organizations', payload),
  updateOrganization: (organizationId: string, payload: UpdateOrganizationPayload) =>
    api.patch<OrganizationResponse>(`/organizations/${organizationId}`, payload),
  deleteOrganization: (organizationId: string) =>
    api.delete<{ message?: string }>(`/organizations/${organizationId}`),
  inviteMember: (organizationId: string, payload: InviteMemberPayload) =>
    api.post<InviteMemberResponse>(`/organizations/${organizationId}/invitations`, payload),
  listOrganizationInvitations: (organizationId: string) =>
    api.get<{
      status?: string
      status_code?: number
      message?: string
      data?: { invitations?: unknown; data?: unknown }
    }>(`/organizations/${organizationId}/invitations`),
  listOrganizationUsers: (organizationId: string) =>
    api.get<OrganizationUsersResponse>(`/organizations/${organizationId}/users`),
  getOrganizationById: (organizationId: string) =>
    api.get<OrganizationResponse>(`/organizations/${organizationId}`),
  getUserOrganizationDetails: (userId: string, organizationId: string) =>
    api.get<OrganizationDetailsResponse>(`/users/${userId}/organisations/${organizationId}`),
  updateMemberRole: (organizationId: string, userId: string, roleName: string) =>
    api.patch(`/organizations/${organizationId}/members/${userId}/role`, { role_name: roleName }),
  updateMemberStatus: (organizationId: string, userId: string, isActive: boolean) =>
    api.patch(`/organizations/${organizationId}/members/${userId}/status`, { is_active: isActive }),
  deleteMember: (organizationId: string, userId: string) =>
    api.delete(`/organizations/${organizationId}/members/${userId}`),
}
