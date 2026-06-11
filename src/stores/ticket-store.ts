import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { ticketApi } from '@/api/ticket'
import type {
  CreateTicketPayload,
  GuestTicketAccess,
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketInvite,
  TicketStatus,
} from '@/types/ticket'

type TicketMode = 'auto' | 'manual'
type TicketParticipant = {
  id: string
  type: 'internal' | 'external'
  name?: string
  email: string
  status?: string
  invited_at?: string
  avatar_url?: string | null
  role?: string
  expires_at?: string
}

const loadFromStorage = () => {
  if (typeof window === 'undefined')
    return { tickets: [] as Ticket[], modes: {} as Record<string, TicketMode> }

  try {
    return { tickets: [], modes: {} as Record<string, TicketMode> }
  } catch (err) {
    console.error('Failed to read ticket store', err)
    return { tickets: [], modes: {} as Record<string, TicketMode> }
  }
}

export const useTicketStore = defineStore('ticket', () => {
  const { tickets: initialTickets, modes: initialModes } = loadFromStorage()

  const tickets = ref<Ticket[]>(initialTickets)
  const ticketModes = ref<Record<string, TicketMode>>(initialModes)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const inviteResponseMessage = ref<string | null>(null)

  const participantsByTicketId = ref<Record<string, TicketParticipant[]>>({})

  const parseError = (err: unknown, fallback: string) => {
    const apiErr = err as {
      response?: { data?: { message?: string; detail?: string | Array<{ msg?: string }> } }
      message?: string
    }
    const detail = apiErr.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
    return apiErr.response?.data?.message || apiErr.message || fallback
  }

  const sortedTickets = computed(() =>
    [...tickets.value].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    ),
  )

  const upsertTicket = (ticket: Ticket) => {
    tickets.value = [ticket, ...tickets.value.filter((t) => t.id !== ticket.id)]
  }

  const resolveTicket = (payload: unknown): Ticket | null => {
    if (!payload || typeof payload !== 'object') return null
    const dataObj = payload as {
      ticket?: unknown
      data?: { ticket?: unknown }
      id?: string
    }

    const raw =
      (dataObj.ticket && typeof dataObj.ticket === 'object' && dataObj.ticket) ||
      (dataObj.data?.ticket && typeof dataObj.data.ticket === 'object' && dataObj.data.ticket) ||
      (dataObj.id ? payload : null)

    if (!raw || typeof raw !== 'object') return null
    const rawRecord = raw as Record<string, unknown>

    const rawTicket = rawRecord as unknown as Ticket

    type CommentLike = {
      created_at?: string
      date?: string
      time?: string
    } & Record<string, unknown>

    const formattedComments = Array.isArray(rawRecord.comments)
      ? (rawRecord.comments as unknown[]).map((c): TicketComment => {
          const comment = c as CommentLike

          const createdAt = comment.created_at ? new Date(comment.created_at) : new Date()

          return {
            ...(comment as unknown as TicketComment),
            date:
              typeof comment.date === 'string' && comment.date
                ? comment.date
                : createdAt.toLocaleDateString('en-GB'),
            time:
              typeof comment.time === 'string' && comment.time
                ? comment.time
                : createdAt.toLocaleTimeString('en-GB'),
          }
        })
      : []
    return {
      ...rawTicket,
      invites: Array.isArray(rawRecord.invites) ? rawRecord.invites : [],
      comments: formattedComments,
      attachments: Array.isArray(rawRecord.attachments) ? rawRecord.attachments : [],
    } as Ticket
  }

  const resolveTicketList = (payload: unknown): Ticket[] => {
    if (!payload || typeof payload !== 'object') return []
    const dataObj = payload as { data?: unknown; tickets?: unknown }
    if (Array.isArray(dataObj)) {
      return dataObj as Ticket[]
    }
    const data = (dataObj.data ?? dataObj) as { tickets?: unknown }
    if (data && Array.isArray((data as { tickets?: unknown }).tickets)) {
      return (data as { tickets: Ticket[] }).tickets
    }
    if (Array.isArray((dataObj as { tickets?: unknown }).tickets)) {
      return (dataObj as { tickets: Ticket[] }).tickets
    }
    if (Array.isArray(data as unknown[])) {
      return data as Ticket[]
    }
    return []
  }
  // const extractTicketsFromResponse = (response: unknown): Ticket[] => {
  //   if (!response || typeof response !== 'object') return []

  //   const data = response.data || response

  //   if (data === null || data === undefined) return []

  //   if (Array.isArray(data)) {
  //     return data as Ticket[]
  //   }
  //   if (data.tickets && Array.isArray(data.tickets)) {
  //     return data.tickets as Ticket[]
  //   }
  //   if ((data as Ticket).id) {
  //     return [data as Ticket]
  //   }
  //   return []
  // }
  const fetchTicketsBySource = async (sourceId: string) => {
    if (!sourceId) {
      throw new Error('sourceId is required to fetch tickets')
    }

    loading.value = true
    error.value = null

    try {
      const response = await ticketApi.getTicketsBySource({ source_id: sourceId })
      const tickets = resolveTicketList(response.data)
      tickets.forEach(upsertTicket)
      return tickets
    } catch (err) {
      error.value = parseError(err, 'Failed to fetch tickets')
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch tickets by a high-level context (project | jurisdiction | organization)
  const fetchTicketsByContext = async (
    context: 'jurisdiction' | 'project' | 'organization',
    id: string,
  ) => {
    if (!id) {
      throw new Error('id is required to fetch tickets by context')
    }

    loading.value = true
    error.value = null

    const paramMap: Record<'project' | 'jurisdiction' | 'organization', string> = {
      project: 'project_id',
      jurisdiction: 'jurisdiction_id',
      organization: 'organization_id',
    }

    try {
      const key = paramMap[context]
      const params: Record<string, string | undefined> = {}
      params[key] = id

      const response = await ticketApi.getTickets(params)
      const tickets = resolveTicketList(response.data)
      tickets.forEach(upsertTicket)
      return tickets
    } catch (err) {
      error.value = parseError(err, 'Failed to fetch tickets')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchTicketById = async (ticketId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await ticketApi.getTicketById(ticketId)
      const ticket = resolveTicket(response.data)

      if (ticket) {
        console.log('Fetched ticket with comments:', ticket.comments)
        upsertTicket(ticket)
      }

      return ticket
    } catch (err) {
      console.error(`Failed to fetch ticket ${ticketId}:`, err)
      error.value = parseError(err, 'Failed to fetch ticket')
      return null
    } finally {
      loading.value = false
    }
  }

  const closeTicketApi = async (ticketId: string, closingNotes = 'Closed') => {
    loading.value = true
    error.value = null

    try {
      await ticketApi.closeTicket(ticketId, closingNotes)

      const ticket = tickets.value.find((t) => t.id === ticketId)
      if (!ticket) return null

      ticket.status = 'closed'
      ticket.updated_at = new Date().toISOString()

      upsertTicket(ticket)
      return ticket
    } catch (err) {
      error.value = parseError(err, 'Failed to close ticket')
      return null
    } finally {
      loading.value = false
    }
  }

  const inviteParticipantsApi = async (ticketId: string, emails: string[]) => {
    loading.value = true
    error.value = null
    inviteResponseMessage.value = null

    try {
      const response = await ticketApi.inviteParticipants(ticketId, { emails })

      inviteResponseMessage.value = response?.data?.message || null

      // If backend returned ticket, use it
      const ticket = resolveTicket(response.data)
      if (ticket) {
        upsertTicket(ticket)
        return ticket
      }

      //  Otherwise: update local ticket invites (since GET doesn’t include invites)
      const target = tickets.value.find((t) => String(t.id) === String(ticketId))
      if (target) {
        target.invites = Array.isArray(target.invites) ? target.invites : []

        const now = new Date().toISOString()
        emails.forEach((email) => {
          const normalized = email.trim().toLowerCase()
          if (!normalized) return

          if (!target.invites.some((i) => i.email.toLowerCase() === normalized)) {
            target.invites.push({
              id: `${ticketId}-invite-${normalized}`,
              email: normalized,
              invited_at: now,
              status: 'pending',
            })
          }
        })

        target.updated_at = now
        upsertTicket(target)
        return target
      }

      // if ticket isn't in store yet, fetch it and still attach invites locally
      const refreshed = await fetchTicketById(ticketId)
      if (refreshed) {
        const now = new Date().toISOString()
        refreshed.invites = Array.isArray(refreshed.invites) ? refreshed.invites : []
        emails.forEach((email) => {
          const normalized = email.trim().toLowerCase()
          if (!refreshed.invites.some((i) => i.email.toLowerCase() === normalized)) {
            refreshed.invites.push({
              id: `${ticketId}-invite-${normalized}`,
              email: normalized,
              invited_at: now,
              status: 'pending',
            })
          }
        })
        upsertTicket(refreshed)
        return refreshed
      }

      return null
    } catch (err) {
      console.error(`Failed to invite participants to ticket ${ticketId}:`, err)
      error.value = parseError(err, 'Failed to invite participants')
      return null
    } finally {
      loading.value = false
    }
  }

  const getGuestTicketAccess = async (
    token: string,
    ticketId?: string,
  ): Promise<{
    data: GuestTicketAccess
    status?: string
    status_code?: number
    message?: string
  } | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await ticketApi.getGuestTicketAccess(
        ticketId ? { token, ticket_id: ticketId } : { token },
      )
      return response.data
    } catch (err) {
      console.error('Failed to get guest ticket access:', err)
      error.value = parseError(err, 'Failed to get guest access')
      return null
    } finally {
      loading.value = false
    }
  }

  const refreshTickets = async (sourceId: string) => {
    return await fetchTicketsBySource(sourceId)
  }

  const createTicket = async (organizationId: string, payload: CreateTicketPayload) => {
    loading.value = true
    error.value = null

    if (!organizationId) {
      error.value = 'Select an organization before creating a ticket'
      loading.value = false
      return null
    }

    try {
      const response = await ticketApi.createManualTicket(payload)
      const rawTicket = resolveTicket(response?.data?.data) ?? resolveTicket(response?.data)
      const now = new Date().toISOString()
      const ticket: Ticket = {
        id: rawTicket?.id || `T-${Date.now()}`,
        title: rawTicket?.title || payload.title,
        description: rawTicket?.description ?? payload.description ?? payload.summary ?? null,
        summary: rawTicket?.summary ?? payload.summary,
        status: rawTicket?.status || 'open',
        priority: rawTicket?.priority || payload.priority || 'high',
        jurisdiction_id: rawTicket?.jurisdiction_id ?? payload.jurisdiction_id,
        jurisdiction_change_id:
          (rawTicket as Ticket & { jurisdiction_change_id?: string })?.jurisdiction_change_id ??
          payload.jurisdiction_change_id,
        project_id: rawTicket?.project_id ?? payload.project_id,
        source_id: rawTicket?.source_id ?? payload.source_id,
        revision_id: rawTicket?.revision_id ?? payload.revision_id,
        data_revision_id:
          rawTicket?.data_revision_id ?? payload.data_revision_id ?? payload.revision_id,
        change_diff_id: rawTicket?.change_diff_id ?? payload.change_diff_id ?? null,
        change_summary: rawTicket?.change_summary ?? payload.change_summary,
        content: rawTicket?.content ?? payload.content ?? null,
        change_details:
          (rawTicket?.change_details && rawTicket.change_details.length > 0
            ? rawTicket.change_details
            : payload.change_details) || [],
        auto_created: rawTicket?.auto_created ?? payload.auto_created,
        assigned_to_user_id: rawTicket?.assigned_to_user_id ?? payload.assigned_to_user_id ?? null,
        created_at: rawTicket?.created_at || now,
        updated_at: rawTicket?.updated_at || now,
        comments: rawTicket?.comments || [],
        invites: rawTicket?.invites || [],
        attachments: rawTicket?.attachments || [],
      }

      upsertTicket(ticket)
      return ticket
    } catch (err) {
      console.error('Failed to create ticket', err)
      error.value = parseError(err, 'Failed to create ticket')
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchTicketParticipants = async (ticketId: string) => {
    loading.value = true
    error.value = null

    try {
      const res = await ticketApi.getTicketParticipants(ticketId)
      const data = res.data?.data

      const internal = Array.isArray(data?.internal_participants)
        ? data.internal_participants.map((p) => ({
            id: p.user_id,
            type: 'internal' as const,
            email: p.email,
            ...(p.name ? { name: p.name } : {}),
            ...(p.status ? { status: p.status } : {}),
            ...(p.invited_at ? { invited_at: p.invited_at } : {}),
            ...(p.avatar_url || p.profile_picture_url
              ? { avatar_url: p.avatar_url || p.profile_picture_url || null }
              : {}),
          }))
        : []

      const external = Array.isArray(data?.external_participants)
        ? data.external_participants.map((p) => ({
            id: p.participant_id,
            type: 'external' as const,
            name: p.name || 'Guest',
            email: p.email,
            role: p.role || 'Guest',
            ...(p.status ? { status: p.status } : {}),
            ...(p.invited_at ? { invited_at: p.invited_at } : {}),
            ...(p.expires_at ? { expires_at: p.expires_at } : {}),
          }))
        : []

      const combined: TicketParticipant[] = [...internal, ...external]
      participantsByTicketId.value = { ...participantsByTicketId.value, [ticketId]: combined }

      return combined
    } catch (err) {
      error.value = parseError(err, 'Failed to fetch participants')
      return []
    } finally {
      loading.value = false
    }
  }

  const addComment = (ticketId: string, author: string, message: string) => {
    const target = tickets.value.find((t) => t.id === ticketId)
    if (!target) return null

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB')
    const timeStr = now.toLocaleTimeString('en-GB')

    const comment: TicketComment = {
      comment_id: `${ticketId}-c-${Date.now()}`,
      ticket_id: ticketId,
      content: message,
      created_at: now.toISOString(),
      author_name: author,
      author_email: '',
      is_guest: false,
      date: dateStr,
      time: timeStr,
    }

    target.comments.unshift(comment)
    target.updated_at = new Date().toISOString()
    upsertTicket(target)
    return comment
  }

  const inviteCollaborator = (ticketId: string, email: string) => {
    const target = tickets.value.find((t) => t.id === ticketId)
    if (!target) return null

    const invite: TicketInvite = {
      id: `${ticketId}-i-${Date.now()}`,
      email,
      invited_at: new Date().toISOString(),
      status: 'pending',
    }

    target.invites.push(invite)
    target.updated_at = new Date().toISOString()
    upsertTicket(target)
    return invite
  }

  const attachDocument = (
    ticketId: string,
    file: { name: string; size?: number },
    uploadedBy: string,
  ) => {
    const target = tickets.value.find((t) => t.id === ticketId)
    if (!target) return null

    const attachment: TicketAttachment = {
      id: `${ticketId}-a-${Date.now()}`,
      name: file.name,
      size: file.size ? `${Math.round(file.size / 1024)} KB` : 'N/A',
      uploaded_at: new Date().toISOString(),
      uploaded_by: uploadedBy,
    }

    target.attachments.push(attachment)
    target.updated_at = new Date().toISOString()
    upsertTicket(target)
    return attachment
  }

  const updateStatus = (ticketId: string, status: TicketStatus) => {
    const target = tickets.value.find((t) => t.id === ticketId)
    if (!target) return null
    target.status = status
    target.updated_at = new Date().toISOString()
    upsertTicket(target)
    return target
  }

  const hasTicketForRevision = (revisionId?: string) => {
    if (!revisionId) return false
    return tickets.value.some(
      (t) => t.revision_id === revisionId || t.data_revision_id === revisionId,
    )
  }

  const getModeForJurisdiction = (jurisdictionId?: string) => {
    if (!jurisdictionId) return 'manual' as TicketMode
    return ticketModes.value[jurisdictionId] || 'manual'
  }

  const ticketForRevision = (revisionId?: string) => {
    if (!revisionId) return undefined
    return tickets.value.find(
      (t) => t.revision_id === revisionId || t.data_revision_id === revisionId,
    )
  }

  const setModeForJurisdiction = (jurisdictionId: string, mode: TicketMode) => {
    ticketModes.value = { ...ticketModes.value, [jurisdictionId]: mode }
  }

  const createCommentApi = async (
    ticketId: string,
    content: string,
    images?: File[],
  ): Promise<TicketComment | null> => {
    try {
      const response = await ticketApi.createComment(ticketId, content, images)
      const data = response.data as { comment?: TicketComment }
      let comment = data?.comment
      if (comment) {
        // Format comment to ensure it has date and time fields
        if (!comment.date || !comment.time) {
          const createdAt = new Date(comment.created_at)
          comment = {
            ...comment,
            date: comment.date || createdAt.toLocaleDateString('en-GB'),
            time: comment.time || createdAt.toLocaleTimeString('en-GB'),
          }
        }
        const target = tickets.value.find((t) => t.id === ticketId)
        if (target) {
          const updatedTicket = {
            ...target,
            comments: [comment, ...target.comments],
            updated_at: new Date().toISOString(),
          }
          upsertTicket(updatedTicket)
        }
      }
      return comment || null
    } catch (err) {
      error.value = parseError(err, 'Failed to create comment')
      throw err
    }
  }

  const updateCommentApi = async (
    ticketId: string,
    commentId: string,
    content: string,
    images?: File[],
  ): Promise<TicketComment | null> => {
    try {
      const response = await ticketApi.updateComment(ticketId, commentId, content, images)
      const data = response.data as { comment?: TicketComment }
      let comment = data?.comment
      if (comment) {
        // Format comment to ensure it has date and time fields
        if (!comment.date || !comment.time) {
          const createdAt = new Date(comment.created_at)
          comment = {
            ...comment,
            date: comment.date || createdAt.toLocaleDateString('en-GB'),
            time: comment.time || createdAt.toLocaleTimeString('en-GB'),
          }
        }
        const target = tickets.value.find((t) => t.id === ticketId)
        if (target) {
          const commentIndex = target.comments.findIndex((c) => c.comment_id === commentId)
          if (commentIndex >= 0) {
            const updatedComments = [...target.comments]
            updatedComments[commentIndex] = comment
            const updatedTicket = {
              ...target,
              comments: updatedComments,
              updated_at: new Date().toISOString(),
            }
            upsertTicket(updatedTicket)
          }
        }
      }
      return comment || null
    } catch (err) {
      error.value = parseError(err, 'Failed to update comment')
      throw err
    }
  }

  const deleteCommentApi = async (ticketId: string, commentId: string): Promise<void> => {
    try {
      await ticketApi.deleteComment(ticketId, commentId)
      const target = tickets.value.find((t) => t.id === ticketId)
      if (target) {
        target.comments = target.comments.filter((c) => c.comment_id !== commentId)
        target.updated_at = new Date().toISOString()
        upsertTicket(target)
      }
    } catch (err) {
      error.value = parseError(err, 'Failed to delete comment')
      throw err
    }
  }

  const resetStore = () => {
    tickets.value = []
    ticketModes.value = {}
    loading.value = false
    error.value = null
    inviteResponseMessage.value = null
  }

  return {
    tickets,
    sortedTickets,
    loading,
    error,

    fetchTicketsBySource,
    fetchTicketsByContext,
    fetchTicketById,
    closeTicketApi,
    inviteParticipantsApi,
    inviteResponseMessage,
    getGuestTicketAccess,
    refreshTickets,
    createTicket,
    addComment,
    createCommentApi,
    updateCommentApi,
    deleteCommentApi,
    inviteCollaborator,
    attachDocument,
    updateStatus,
    hasTicketForRevision,
    ticketForRevision,
    getModeForJurisdiction,
    setModeForJurisdiction,
    participantsByTicketId,
    fetchTicketParticipants,
    resetStore,
  }
})
