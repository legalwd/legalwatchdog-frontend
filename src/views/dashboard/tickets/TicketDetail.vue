<script setup lang="ts">
import { Paperclip, Send, SquareCheckBig, UserPlus2, Edit2, Trash2 } from 'lucide-vue-next'
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAuthStore } from '@/stores/auth-store'
import { useJurisdictionStore } from '@/stores/jurisdiction-store'
import { useOrganizationStore } from '@/stores/organization-store'
import { useProjectStore } from '@/stores/project-store'
import { useTicketStore } from '@/stores/ticket-store'
import type { TicketComment } from '@/types/ticket'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const ticketStore = useTicketStore()
const organizationStore = useOrganizationStore()
const projectStore = useProjectStore()
const jurisdictionStore = useJurisdictionStore()

const ticketId = computed(() => route.params.ticketId as string)
const guestToken = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const isGuestAccess = computed(() => guestToken.value.length > 0)
const ticket = computed(() => ticketStore.sortedTickets.find((t) => t.id === ticketId.value))
const ticketStatus = computed(() => ticket.value?.status?.toLowerCase() ?? '')
const ticketComments = computed(() => ticket.value?.comments ?? [])

const commentLimit = 500
const comment = ref('')
const isLoadingTicket = ref(false)
const isClosingTicket = ref(false)
const isSubmittingComment = ref(false)
const isUploadingDocument = ref(false)
const editingCommentId = ref<string | null>(null)
const editingCommentContent = ref('')
const isDeletingCommentId = ref<string | null>(null)

const context = ref<'jurisdiction' | 'project' | 'organization' | null>(null)
const contextId = ref<string | null>(null)
const contextName = ref<string>('')

const authorName = computed(() => {
  const user = authStore.user
  if (!user) return 'You'
  return (
    user.name || `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email || 'You'
  )
})

onMounted(async () => {
  const q = route.query || {}
  if (q.context && typeof q.context === 'string')
    context.value = q.context as 'jurisdiction' | 'project' | 'organization'
  if (q.contextId && typeof q.contextId === 'string') contextId.value = q.contextId

  if (context.value && contextId.value) {
    if (context.value === 'project') {
      const p = projectStore.projects.find((p) => p.id === contextId.value)
      contextName.value = p?.title || 'Project'
      if (p?.org_id) {
        organizationStore.setCurrentOrganization(p.org_id)
      }
    } else if (context.value === 'jurisdiction') {
      const j = jurisdictionStore.jurisdictions.find((j) => j.id === contextId.value)
      contextName.value = j?.name || 'Jurisdiction'
      if (j?.project_id) {
        const project = projectStore.projects.find((p) => p.id === j.project_id)
        if (project?.org_id) {
          organizationStore.setCurrentOrganization(project.org_id)
        }
      }
    } else if (context.value === 'organization') {
      organizationStore.setCurrentOrganization(contextId.value)
      contextName.value = organizationStore.currentOrganization?.name || 'Organization'
    }
  }

  await fetchTicketDetails()
})

const fetchTicketDetails = async () => {
  isLoadingTicket.value = true
  try {
    if (isGuestAccess.value) {
      // Use guest access endpoint for guest users
      await ticketStore.getGuestTicketAccess(guestToken.value, ticketId.value)
    } else {
      // Use regular endpoint for authenticated users
      const result = await ticketStore.fetchTicketById(ticketId.value)
      if (!result) {
        console.log('Ticket not found')
      }
    }
  } catch (error) {
    console.error('Error fetching ticket:', error)
    toast.error('Failed to load ticket details')
  } finally {
    isLoadingTicket.value = false
  }
}

const handleBack = () => {
  if (context.value && contextId.value) {
    switch (context.value) {
      case 'jurisdiction':
        router.push({ name: 'jurisdiction-detail', params: { id: contextId.value } })
        return
      case 'project':
        router.push({
          name: 'project-detail',
          params: {
            organizationId: organizationStore.currentOrganization?.id,
            id: contextId.value,
          },
        })
        return
      case 'organization':
        router.push({ name: 'organization-profile', params: { organizationId: contextId.value } })
        return
    }
  }

  router.push({ name: 'tickets' })
}

const handleBackToContext = () => {
  handleBack()
}

// const goBackToTickets = () => {
//   const query: Record<string, string> = {}
//   if (context.value && contextId.value) {
//     query.context = context.value
//     query.contextId = contextId.value
//   }
//   router.push({ name: 'tickets', query })
// }

const submitComment = async () => {
  if (!ticket.value) {
    toast.error('Ticket not found')
    return
  }

  if (!comment.value.trim()) {
    toast.error('Add a comment before submitting')
    return
  }

  isSubmittingComment.value = true

  try {
    await ticketStore.createCommentApi(ticket.value.id, comment.value.trim())
    await ticketStore.fetchTicketById(ticket.value.id)
    toast.success('Comment added')
    comment.value = ''
  } catch (_error) {
    toast.error('Failed to add comment')
  } finally {
    isSubmittingComment.value = false
  }
}

const startEditComment = (commentId: string, currentContent: string) => {
  editingCommentId.value = commentId
  editingCommentContent.value = currentContent
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editingCommentContent.value = ''
}

const saveEditComment = async (commentId: string) => {
  if (!ticket.value) {
    toast.error('Ticket not found')
    return
  }

  if (!editingCommentContent.value.trim()) {
    toast.error('Comment cannot be empty')
    return
  }

  isSubmittingComment.value = true
  try {
    await ticketStore.updateCommentApi(
      ticket.value.id,
      commentId,
      editingCommentContent.value.trim(),
    )
    await ticketStore.fetchTicketById(ticket.value.id)
    toast.success('Comment updated successfully')
    editingCommentId.value = null
    editingCommentContent.value = ''
  } catch (_error) {
    toast.error('Failed to update comment')
  } finally {
    isSubmittingComment.value = false
  }
}

const deleteComment = async (commentId: string) => {
  if (!ticket.value) {
    toast.error('Ticket not found')
    return
  }

  isDeletingCommentId.value = commentId

  try {
    await ticketStore.deleteCommentApi(ticket.value.id, commentId)
    await ticketStore.fetchTicketById(ticket.value.id)
    toast.success('Comment deleted successfully')
  } catch (error) {
    console.error('Error deleting comment:', error)
    toast.error('Failed to delete comment')
  } finally {
    isDeletingCommentId.value = null
  }
}

const getCommentAuthorName = (comment: TicketComment) => {
  // Try various sources for the author name
  return (
    comment.author_name ||
    comment.author?.name ||
    comment.user?.name ||
    comment.participant?.email ||
    'Unknown'
  )
}

const getCommentAuthorEmail = (comment: TicketComment) => {
  // Try various sources for the author email
  return (
    comment.author_email ||
    comment.author?.email ||
    comment.user?.email ||
    comment.participant?.email ||
    ''
  )
}

const attachDocument = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file || !ticket.value) {
    if (!ticket.value) {
      toast.error('Ticket not found')
    }
    return
  }

  isUploadingDocument.value = true

  try {
    ticketStore.attachDocument(ticket.value.id, file, authorName.value)
    toast.success('Document attached')
    target.value = ''
  } catch (error) {
    console.error('Error attaching document:', error)
    toast.error('Failed to attach document')
  } finally {
    isUploadingDocument.value = false
  }
}

const closeTicket = async () => {
  if (!ticket.value) {
    toast.error('Ticket not found')
    return
  }

  isClosingTicket.value = true

  try {
    const result = await ticketStore.closeTicketApi(ticket.value.id)

    if (result) {
      toast.success('Ticket closed successfully')
      // router.push({ name: 'tickets' })
    } else {
      toast.error(ticketStore.error || 'Failed to close ticket')
    }
  } catch (error) {
    console.error('Error closing ticket:', error)
    toast.error('Failed to close ticket')
  } finally {
    isClosingTicket.value = false
  }
}

const goToInvites = () =>
  router.push({
    name: 'ticket-invited-users',
    params: { ticketId: ticketId.value },
    query: { ...(route.query || {}) },
  })

const resolveFieldLabel = (value?: string | null) => {
  if (!value) return 'Change'
  return value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

const formatChangeValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'N/A'
  return String(value)
}

const extractFieldChanges = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return []
  const diffPatch = (payload as { diff_patch?: unknown }).diff_patch
  if (diffPatch && typeof diffPatch === 'object') {
    const fieldChanges = (diffPatch as { field_changes?: unknown }).field_changes
    if (Array.isArray(fieldChanges)) {
      return fieldChanges as Array<{
        field_name?: string
        old_value?: string
        new_value?: string
        change_type?: string
      }>
    }
  }
  const changeDetection = (payload as { change_detection?: unknown }).change_detection
  if (!changeDetection || typeof changeDetection !== 'object') return []
  const fieldChanges = (changeDetection as { field_changes?: unknown }).field_changes
  if (!Array.isArray(fieldChanges)) return []
  return fieldChanges as Array<{
    field_name?: string
    old_value?: string
    new_value?: string
    change_type?: string
  }>
}

const extractChangeTicketDetail = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return null
  const data = payload as {
    field_name?: unknown
    old_value?: unknown
    new_value?: unknown
    change_description?: unknown
  }
  if (!('field_name' in data || 'old_value' in data || 'new_value' in data)) return null
  const oldValue = formatChangeValue(data.old_value)
  const newValue = formatChangeValue(data.new_value)
  return {
    heading: resolveFieldLabel(typeof data.field_name === 'string' ? data.field_name : 'Change'),
    description:
      typeof data.change_description === 'string'
        ? data.change_description
        : `${oldValue} → ${newValue}`,
    bullets: [] as string[],
  }
}

const resolvedDescription = computed(() => {
  if (!ticket.value) return ''
  if (ticket.value.description) return ticket.value.description
  const content = ticket.value.content as
    | { markdown_summary?: string; extracted_data?: { summary?: string } }
    | undefined
  return content?.markdown_summary || content?.extracted_data?.summary || ''
})

const resolvedChangeDetails = computed(() => {
  if (!ticket.value) return []
  if (ticket.value.jurisdiction_change_id) return []
  if (ticket.value.change_details?.length) return ticket.value.change_details
  const fieldChanges = extractFieldChanges(ticket.value.content)
  if (fieldChanges.length) {
    return fieldChanges.map((change) => {
      const oldValue = formatChangeValue(change.old_value)
      const newValue = formatChangeValue(change.new_value)
      const changeType = change.change_type ? ` (${change.change_type})` : ''
      return {
        heading: resolveFieldLabel(change.field_name),
        description: `${oldValue} → ${newValue}${changeType}`,
        bullets: [],
      }
    })
  }
  const changeDetail = extractChangeTicketDetail(ticket.value.content)
  if (changeDetail) return [changeDetail]
  return []
})

const resolvedChangeSummary = computed(() => {
  if (!ticket.value) return ''
  if (ticket.value.jurisdiction_change_id) return ''
  const content = ticket.value.content as
    | { diff_patch?: { change_summary?: string }; change_description?: string }
    | undefined
  return content?.diff_patch?.change_summary || content?.change_description || ''
})

const changeTicketValues = computed(() => {
  if (!ticket.value?.jurisdiction_change_id) return null
  const content = ticket.value.content as
    | { old_value?: unknown; new_value?: unknown; field_name?: string }
    | undefined
  if (!content) return null
  return {
    field: resolveFieldLabel(content.field_name),
    oldValue: formatChangeValue(content.old_value),
    newValue: formatChangeValue(content.new_value),
  }
})
</script>

<template>
  <main class="min-h-screen flex-1 bg-[#F8F7F5] px-4 py-6 sm:px-6 lg:px-10 lg:py-12">
    <div class="mx-auto max-w-4xl">
      <Breadcrumb class="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink as-child>
              <a
                href="#"
                class="text-sm font-medium hover:text-gray-900"
                @click.prevent="handleBackToContext"
              >
                {{ contextName || 'Dashboard' }}
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage class="text-sm font-semibold text-gray-900"> Ticket </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <!--
      <button
        class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#401903] hover:underline"
        @click="goBackToTickets"
      >
        <ArrowLeft :size="16" />
        Back to tickets
      </button> -->

      <div
        v-if="isLoadingTicket && !ticket"
        class="bg-background flex items-center justify-center rounded-2xl p-12 shadow-sm ring-1 ring-gray-100"
      >
        <div class="text-center">
          <svg
            class="mx-auto h-12 w-12 animate-spin text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="mt-4 text-sm text-gray-500">Loading ticket details...</p>
        </div>
      </div>

      <div
        v-else-if="ticket"
        class="bg-background overflow-hidden rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 sm:p-8"
      >
        <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="w-full space-y-2">
            <p class="text-[11px] font-semibold tracking-[0.15em] text-[#C17A3F] uppercase">
              Ticket
            </p>
            <div class="flex w-full flex-col items-center justify-between gap-5 sm:flex-row">
              <div class="w-3/4">
                <h1 class="text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
                  {{ ticket.title }}
                </h1>
              </div>
              <div class="flex items-center gap-2 sm:gap-3">
                <button
                  class="btn--default btn--md"
                  :disabled="isClosingTicket || ticketStatus === 'closed'"
                  @click="closeTicket"
                >
                  <svg
                    v-if="isClosingTicket"
                    class="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <SquareCheckBig v-else :size="16" />
                </button>
                <button class="btn--default btn--md" @click="goToInvites">
                  <UserPlus2 :size="18" />
                </button>
              </div>
            </div>
            <p v-if="ticket.summary" class="text-sm">
              {{ ticket.summary }}
            </p>
          </div>
        </header>

        <section v-if="resolvedDescription" class="mt-6 rounded-xl border border-gray-100 p-4">
          <h2 class="text-base font-semibold text-[#1F1F1F]">Details</h2>
          <p class="mt-2 text-sm whitespace-pre-line text-gray-700">
            {{ resolvedDescription }}
          </p>
        </section>

        <section
          class="bg-background mt-6 space-y-3 rounded-xl border border-gray-100 p-4 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-[#1F1F1F]">Changes detected</h2>
            <span class="text-xs text-gray-400">Ticket #: {{ ticket.ticket_number ?? 'N/A' }}</span>
          </div>

          <p v-if="resolvedChangeSummary" class="text-sm text-gray-600">
            {{ resolvedChangeSummary }}
          </p>

          <div v-if="changeTicketValues" class="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
            <div class="rounded-lg border border-gray-100 bg-[#FBFBFB] p-3">
              <p class="text-xs font-semibold text-gray-500 uppercase">Old Value</p>
              <p class="mt-1 font-medium">{{ changeTicketValues.oldValue }}</p>
            </div>
            <div class="rounded-lg border border-gray-100 bg-[#FBFBFB] p-3">
              <p class="text-xs font-semibold text-gray-500 uppercase">New Value</p>
              <p class="mt-1 font-medium">{{ changeTicketValues.newValue }}</p>
            </div>
            <p class="text-xs text-gray-500 sm:col-span-2">Field: {{ changeTicketValues.field }}</p>
          </div>

          <div v-else-if="!resolvedChangeDetails.length" class="text-sm text-gray-500">
            No change details available yet.
          </div>

          <div
            v-for="(change, idx) in resolvedChangeDetails"
            :key="idx"
            class="rounded-lg border border-gray-100 bg-[#FBFBFB] p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <p class="text-sm font-semibold text-gray-900">{{ change.heading }}</p>
                <p v-if="change.description" class="text-sm">
                  {{ change.description }}
                </p>
              </div>
              <div class="flex items-center gap-2 text-xs text-green-700">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100"
                  >✓</span
                >
                <span class="font-semibold">Change</span>
              </div>
            </div>
            <ul
              v-if="change.bullets?.length"
              class="mt-3 list-disc space-y-1 pl-4 text-sm text-gray-700"
            >
              <li v-for="(item, bIdx) in change.bullets" :key="bIdx">{{ item }}</li>
            </ul>
          </div>
        </section>

        <section class="mt-6">
          <div class="bg-background rounded-xl border border-gray-100 p-4 shadow-sm">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-base font-semibold text-[#1F1F1F]">Post Comment</h3>
              <span class="text-xs text-gray-500">{{ comment.length }}/{{ commentLimit }}</span>
            </div>
            <textarea
              v-model="comment"
              :maxlength="commentLimit"
              :disabled="isSubmittingComment"
              rows="4"
              placeholder="Type comment"
              class="w-full rounded-lg border px-3 py-3 text-sm text-gray-800 focus:border-[#401903] focus:ring-2 focus:ring-[#401903]/15 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
            <div class="mt-3 flex items-center justify-between">
              <label
                class="btn--link btn--with-icon"
                :class="{ 'cursor-not-allowed opacity-50': isUploadingDocument }"
              >
                <input
                  type="file"
                  class="hidden"
                  :disabled="isUploadingDocument"
                  @change="attachDocument"
                />
                <svg
                  v-if="isUploadingDocument"
                  class="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <Paperclip v-else :size="16" />
                {{ isUploadingDocument ? 'Uploading...' : 'Attach document' }}
              </label>
              <button
                class="btn--default btn--lg btn--with-icon"
                :disabled="isSubmittingComment || !comment.trim()"
                @click="submitComment"
              >
                <svg
                  v-if="isSubmittingComment"
                  class="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <Send v-else :size="16" />
                {{ isSubmittingComment ? 'Submitting...' : 'Submit' }}
              </button>
            </div>

            <div v-if="ticketComments.length" class="mt-4 space-y-3">
              <div
                v-for="item in ticketComments"
                :key="item.comment_id"
                class="rounded-lg bg-[#F9F7F4] p-3"
              >
                <div class="mb-2 flex items-start justify-between">
                  <div>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                      <span class="font-semibold text-gray-700">{{
                        getCommentAuthorName(item)
                      }}</span>
                      <span>{{ item.date }} {{ item.time }}</span>
                    </div>
                    <p v-if="getCommentAuthorEmail(item)" class="text-sm text-gray-600">
                      {{ getCommentAuthorEmail(item) }}
                    </p>
                  </div>
                  <div class="flex gap-1">
                    <button
                      class="rounded p-1 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                      title="Edit comment"
                      @click="startEditComment(item.comment_id, item.content)"
                    >
                      <Edit2 :size="14" />
                    </button>
                    <button
                      class="rounded p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                      :disabled="isDeletingCommentId === item.comment_id"
                      title="Delete comment"
                      @click="deleteComment(item.comment_id)"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </div>

                <!-- Edit Mode -->
                <div v-if="editingCommentId === item.comment_id" class="space-y-2">
                  <textarea
                    v-model="editingCommentContent"
                    :maxlength="commentLimit"
                    rows="3"
                    placeholder="Edit your comment"
                    class="w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-[#401903] focus:ring-2 focus:ring-[#401903]/15 focus:outline-none"
                  ></textarea>
                  <div class="flex justify-end gap-2">
                    <button class="btn--link text-sm" @click="cancelEditComment">Cancel</button>
                    <button
                      class="btn--default btn--sm"
                      :disabled="isSubmittingComment"
                      @click="saveEditComment(item.comment_id)"
                    >
                      {{ isSubmittingComment ? 'Saving...' : 'Save' }}
                    </button>
                  </div>
                </div>

                <!-- View Mode -->
                <div v-else>
                  <p class="mt-2 text-sm text-gray-800">{{ item.content }}</p>
                  <span
                    v-if="item.is_guest"
                    class="mt-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                    >Guest</span
                  >
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="bg-background rounded-2xl p-8 text-center shadow-sm ring-1 ring-gray-100">
        <p class="text-lg font-semibold text-gray-900">Ticket not found</p>
        <p class="mt-2 text-sm">Create or open a ticket from a detected change.</p>
        <button class="btn--default btn--lg mt-4" @click="handleBack">Go to tickets</button>
      </div>
    </div>
  </main>
</template>
