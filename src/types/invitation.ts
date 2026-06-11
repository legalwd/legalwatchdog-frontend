export interface Invitation {
  id?: string | undefined
  token: string
  organization_id: string
  organization_name?: string | undefined
  invited_email?: string | undefined
  role_name?: string | undefined
  role?: string | undefined
  status?: string | undefined
}

export interface InvitationErrorResponse {
  response?: {
    data?: {
      detail?: { msg?: string }[]
      message?: string
    }
  }
}

export interface AcceptInvitationData {
  organization_id?: string
  organization_name?: string
  role_name?: string
}
