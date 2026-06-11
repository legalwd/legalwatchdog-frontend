import { computed, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import type { Jurisdiction } from '@/api/jurisdiction'
import { useOrganizationStore } from '@/stores/organization-store'
import { useProjectStore } from '@/stores/project-store'
import { useTicketStore } from '@/stores/ticket-store'
import type { Source, SourceRevision } from '@/types/source'

export const formatRevisionLabel = (rev: { scraped_at: string }) =>
  new Date(rev.scraped_at).toLocaleString()

const buildChangeDetails = (source: Source, revision: SourceRevision) => {
  const bullets =
    revision.ai_markdown_summary
      ?.split('\n')
      .map((item) => item.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean) || []

  return [
    {
      heading: source.name || 'Change detected',
      description:
        revision.ai_summary ||
        (typeof revision.extracted_data?.title === 'string'
          ? revision.extracted_data.title
          : 'Detected change on tracked source'),
      bullets,
    },
  ]
}

export function useRevisionTickets(params: {
  jurisdiction: Ref<Jurisdiction | null>
  activeOrganizationId: Ref<string>
}) {
  const router = useRouter()
  const ticketStore = useTicketStore()
  const projectStore = useProjectStore()
  const orgStore = useOrganizationStore()

  const ticketMode = computed(() =>
    ticketStore.getModeForJurisdiction(params.jurisdiction.value?.id),
  )

  const resolveTicketOrgId = () => {
    if (params.activeOrganizationId.value) return params.activeOrganizationId.value
    const projId = params.jurisdiction.value?.project_id
    if (projId) {
      const project = projectStore.projects.find((p) => p.id === projId)
      if (project?.org_id) return project.org_id
    }
    return orgStore.currentOrganizationId || ''
  }

  const createTicketFromRevision = async (
    source: Source,
    revision: SourceRevision,
    opts?: { auto?: boolean; skipExistingCheck?: boolean },
  ) => {
    const revisionKey = revision.data_revision_id || revision.id
    if (!opts?.skipExistingCheck && ticketStore.hasTicketForRevision(revisionKey)) {
      const existing = ticketStore.ticketForRevision(revisionKey)
      if (existing && !opts?.auto) {
        toast.info('Ticket already exists for this change')
        router.push({
          name: 'ticket-detail',
          params: { ticketId: existing.id },
          query: { context: 'jurisdiction', contextId: params.jurisdiction.value?.id || '' },
        })
      }
      return existing
    }

    const orgId = resolveTicketOrgId()
    const projectId = params.jurisdiction.value?.project_id

    if (!orgId || !projectId) {
      if (!opts?.auto) {
        toast.error('Missing organization or project context to create a ticket')
      }
      return null
    }

    const contentPayload =
      revision.extracted_data || revision.ai_markdown_summary || revision.ai_summary
        ? {
            ai_summary: revision.ai_summary,
            ai_markdown_summary: revision.ai_markdown_summary,
            extracted_data: revision.extracted_data,
          }
        : null

    const created = await ticketStore.createTicket(orgId, {
      title: `Change detected: ${source.name}`,
      description:
        revision.ai_summary ||
        (typeof revision.extracted_data?.title === 'string' ? revision.extracted_data.title : null),
      summary:
        revision.ai_summary ||
        `A new change was detected on ${source.name} at ${formatRevisionLabel(revision)}`,
      priority: 'high',
      jurisdiction_id: params.jurisdiction.value?.id,
      project_id: projectId,
      source_id: source.id,
      revision_id: revision.id,
      data_revision_id: revision.data_revision_id || revision.id,
      change_summary: revision.ai_summary || 'Change detected',
      change_details: buildChangeDetails(source, revision),
      content: contentPayload,
      auto_created: opts?.auto,
    })

    if (!created) {
      if (!opts?.auto) {
        toast.error(ticketStore.error || 'Could not create ticket right now. Please try again.')
      }
      return null
    }

    if (!opts?.auto && !opts?.skipExistingCheck) {
      toast.success('Ticket created from change')
      router.push({
        name: 'ticket-detail',
        params: { ticketId: created.id },
        query: { context: 'jurisdiction', contextId: params.jurisdiction.value?.id || '' },
      })
    }

    if (created?.auto_created) {
      toast.success('Ticket auto-created for detected change')
    }

    return created
  }

  const handleOpenTicket = async (payload: { source: Source; revision: SourceRevision }) => {
    const revisionKey = payload.revision.data_revision_id || payload.revision.id
    if (ticketStore.hasTicketForRevision(revisionKey)) {
      const existing = ticketStore.ticketForRevision(revisionKey)
      if (existing) {
        router.push({
          name: 'ticket-detail',
          params: { ticketId: existing.id },
          query: { context: 'jurisdiction', contextId: params.jurisdiction.value?.id || '' },
        })
      }
      return existing
    }

    const created = await createTicketFromRevision(payload.source, payload.revision, {
      skipExistingCheck: true,
    })

    if (created) {
      toast.success('Ticket created from change')
      router.push({
        name: 'ticket-detail',
        params: { ticketId: created.id },
        query: { context: 'jurisdiction', contextId: params.jurisdiction.value?.id || '' },
      })
    }

    return created
  }

  const maybeAutoCreateTicket = async (
    sourceId: string,
    revisionsBySource: Record<string, SourceRevision[]>,
    sources: Source[],
  ) => {
    if (ticketMode.value !== 'auto') return
    const changeRevision = revisionsBySource[sourceId]?.find((rev) => rev.was_change_detected)
    if (!changeRevision || ticketStore.hasTicketForRevision(changeRevision.id)) return
    const src = sources.find((item) => item.id === sourceId)
    if (!src) return
    await createTicketFromRevision(src, changeRevision, { auto: true })
  }

  return {
    ticketMode,
    handleOpenTicket,
    createTicketFromRevision,
    maybeAutoCreateTicket,
  }
}
