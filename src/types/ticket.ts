export type TicketStatus = 'open' | 'in_progress' | 'closed' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
export type TicketPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'
export type GuestTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
export type GuestTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface GuestTicketAccess {
  ticket_id: string
  ticket_number?: number | null | undefined
  title: string
  description?: string | null | undefined
  priority: GuestTicketPriority
  status: GuestTicketStatus
  created_at: string
  project_name?: string | null | undefined
  participant_email: string
  participant_role: string
  access_expires_at: string
}

export interface TicketChange {
  heading: string
  description?: string
  bullets?: string[]
}

export interface TicketCommentUser {
  id: string
  name: string
  email: string
  avatar_url?: string | null
}

export interface TicketCommentParticipant {
  id: string
  email: string
  role: string
}

export interface TicketCommentAuthor {
  id: string
  name: string
  email: string
  avatar_url?: string | null
}

export interface TicketComment {
  comment_id: string
  ticket_id: string
  content: string
  attachments?: Array<{ id: string; url: string; name: string }> | null
  user_id?: string | null
  participant_id?: string | null
  mentioned_user_ids?: unknown | null
  mentioned_participant_ids?: unknown | null
  created_at: string
  updated_at?: string | null
  deleted_at?: string | null
  user?: TicketCommentUser | null
  participant?: TicketCommentParticipant | null
  author?: TicketCommentAuthor | null
  author_name?: string
  author_email?: string
  author_avatar_url?: string | null
  is_guest: boolean
  date?: string
  time?: string
}

export interface TicketInvite {
  id: string
  email: string
  invited_at: string
  status: 'pending' | 'accepted'
}

export interface TicketAttachment {
  id: string
  name: string
  size: string
  uploaded_at: string
  uploaded_by: string
}

export interface Ticket {
  id: string
  title: string
  description?: string | null | undefined
  summary?: string | undefined
  status: TicketStatus
  priority: TicketPriority
  ticket_number?: number | undefined
  is_manual?: boolean | undefined
  jurisdiction_id?: string | undefined
  jurisdiction_scrape_job_id?: string | undefined
  jurisdiction_change_id?: string | undefined
  project_id?: string | undefined
  organization_id?: string | undefined
  source_id?: string | undefined
  revision_id?: string | undefined
  data_revision_id?: string | undefined
  change_diff_id?: string | null | undefined
  change_summary?: string | undefined
  content?: Record<string, unknown> | null | undefined
  change_details: TicketChange[]
  auto_created?: boolean | undefined
  assigned_to_user_id?: string | null | undefined
  assigned_by_user_id?: string | null | undefined
  created_by_user_id?: string | null | undefined
  closed_at?: string | null | undefined
  created_at: string
  updated_at: string
  comments: TicketComment[]
  invites: TicketInvite[]
  attachments: TicketAttachment[]
}

export interface CreateTicketPayload {
  title: string
  description?: string | null | undefined
  summary?: string | undefined
  priority?: TicketPriority | undefined
  jurisdiction_id?: string | undefined
  jurisdiction_scrape_job_id?: string | undefined
  jurisdiction_change_id?: string | undefined
  project_id?: string | undefined
  source_id?: string | undefined
  revision_id?: string | undefined
  data_revision_id?: string | undefined
  change_diff_id?: string | null | undefined
  change_summary?: string | undefined
  content?: Record<string, unknown> | null | undefined
  change_details?: TicketChange[] | undefined
  auto_created?: boolean | undefined
  assigned_to_user_id?: string | null | undefined
}
