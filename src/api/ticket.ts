import api from '@/lib/api'
import type { CreateTicketPayload, GuestTicketAccess, Ticket, TicketComment } from '@/types/ticket'

type ApiEnvelope<T> = {
  status?: string
  status_code?: number
  message?: string
  data: T
}

type TicketParticipantsResponse = ApiEnvelope<{
  internal_participants: Array<{
    user_id: string
    name: string
    email: string
    profile_picture_url?: string | null
    avatar_url?: string | null
    status?: 'online' | 'offline' | string
    invited_at?: string
  }>
  external_participants: Array<{
    participant_id: string
    name?: string
    email: string
    role?: string
    status?: 'online' | 'offline' | string
    invited_at?: string
    expires_at?: string
  }>
}>

type TicketWrapped = { ticket: Ticket }
type TicketResponse = ApiEnvelope<TicketWrapped>
type CommentWrapped = { comment: TicketComment }
type CommentResponse = ApiEnvelope<CommentWrapped>
type InviteParticipantsPayload = {
  emails: string[]
}

type GuestTicketAccessParams = {
  token: string
  ticket_id?: string
}

type GuestTicketAccessResponse = ApiEnvelope<GuestTicketAccess>

export const ticketApi = {
  createManualTicket: (payload: CreateTicketPayload) => {
    const isJurisdictionTicket =
      Boolean(payload.jurisdiction_id) && Boolean(payload.jurisdiction_scrape_job_id)
    const revisionId = payload.revision_id ?? payload.data_revision_id

    if (!isJurisdictionTicket) {
      if (!payload.source_id) {
        return Promise.reject(new Error('source_id is required'))
      }
      if (!revisionId) {
        return Promise.reject(new Error('revision_id or data_revision_id is required'))
      }
    }
    if (isJurisdictionTicket) {
      return api.post<TicketResponse>(`/tickets`, {
        jurisdiction_id: payload.jurisdiction_id,
        jurisdiction_scrape_job_id: payload.jurisdiction_scrape_job_id,
        jurisdiction_change_id: payload.jurisdiction_change_id,
        priority: (payload.priority ?? 'medium').toUpperCase() as
          | 'LOW'
          | 'MEDIUM'
          | 'HIGH'
          | 'CRITICAL',
      })
    }
    return api.post<TicketResponse>(`/tickets`, {
      source_id: payload.source_id,
      revision_id: revisionId,
      priority: (payload.priority ?? 'medium').toUpperCase() as
        | 'LOW'
        | 'MEDIUM'
        | 'HIGH'
        | 'CRITICAL',
    })
  },

  getTicketsBySource(params: { source_id?: string; page?: number; limit?: number }) {
    if (!params?.source_id) {
      return Promise.reject(new Error('source_id is required'))
    }

    return api.get('/tickets', { params })
  },

  // Generic tickets list endpoint allowing filtering by project_id, jurisdiction_id, organization_id, source_id, etc.
  getTickets(params: Record<string, string | number | undefined>) {
    if (!params?.source_id && !params?.jurisdiction_id && !params?.organization_id) {
      return Promise.reject(
        new Error('At least one of source_id, jurisdiction_id, or organization_id is required'),
      )
    }
    return api.get('/tickets', { params })
  },
  getTicketById: (ticket_id: string) => {
    return api.get<TicketResponse>(`/tickets/${ticket_id}`)
  },

  closeTicket: (ticket_id: string, closing_notes: string) => {
    return api.patch(`/tickets/${ticket_id}/close`, {
      closing_notes,
    })
  },

  inviteParticipants: (ticket_id: string, payload: InviteParticipantsPayload) => {
    return api.post<TicketResponse>(`/tickets/${ticket_id}/invitations`, payload)
  },
  getTicketParticipants: (ticket_id: string) => {
    return api.get<TicketParticipantsResponse>(`/tickets/${ticket_id}/participants`)
  },
  getGuestTicketAccess: ({ token, ticket_id }: GuestTicketAccessParams) => {
    const params = ticket_id ? { ticket_id } : undefined
    return api.get<GuestTicketAccessResponse>('/tickets/external/access', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  createComment: (ticket_id: string, content: string, images?: File[]) => {
    const formData = new FormData()
    if (content) {
      formData.append('content', content)
    }
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image)
      })
    }
    return api.post<CommentResponse>(`/tickets/${ticket_id}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  updateComment: (ticket_id: string, comment_id: string, content: string, images?: File[]) => {
    const formData = new FormData()
    if (content) {
      formData.append('content', content)
    }
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image)
      })
    }
    return api.patch<CommentResponse>(`/tickets/${ticket_id}/comments/${comment_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteComment: (ticket_id: string, comment_id: string) => {
    return api.delete(`/tickets/${ticket_id}/comments/${comment_id}`)
  },
}

export default ticketApi
