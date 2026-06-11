<script setup lang="ts">
import { MailPlus, CircleHelp } from 'lucide-vue-next'
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
import { useJurisdictionStore } from '@/stores/jurisdiction-store'
import { useOrganizationStore } from '@/stores/organization-store'
import { useProjectStore } from '@/stores/project-store'
import { useTicketStore } from '@/stores/ticket-store'
import type { Ticket } from '@/types/ticket'
import UserInviteModal from '@/views/dashboard/tickets/UserInviteModal.vue'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

const ticketId = computed(() => route.params.ticketId as string)
const ticket = ref<Ticket | null>(null)

const inviteModalOpen = ref(false)
const isLoadingTicket = ref(false)
const isInviting = ref(false)

const context = ref<'jurisdiction' | 'project' | 'organization' | null>(null)
const contextId = ref<string | null>(null)
const contextName = ref<string>('')

type Participant = {
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

const participants = ref<Participant[]>([])
const isLoadingParticipants = ref(false)

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const fetchTicketDetails = async () => {
  isLoadingTicket.value = true

  if (!ticketId.value) {
    toast.error('Ticket ID missing')
    isLoadingTicket.value = false
    return
  }

  // Use existing ticket from store if available so the page feels instant when navigated from TicketDetail
  const existing = ticketStore.sortedTickets.find((t) => String(t.id) === String(ticketId.value))
  if (existing) ticket.value = existing

  try {
    const result = await ticketStore.fetchTicketById(ticketId.value)
    if (result) {
      ticket.value = result
    } else if (!existing) {
      toast.error('Ticket not found')
    }
  } catch (err) {
    console.error('Error fetching ticket:', err)
    toast.error('Failed to load ticket details')
  } finally {
    isLoadingTicket.value = false
  }
}

const fetchParticipants = async () => {
  if (!ticketId.value) return
  isLoadingParticipants.value = true

  try {
    participants.value = await ticketStore.fetchTicketParticipants(ticketId.value)
  } catch (err) {
    console.error('Error fetching participants:', err)
    toast.error(ticketStore.error || 'Failed to load participants')
  } finally {
    isLoadingParticipants.value = false
  }
}

onMounted(async () => {
  // Read originating context so breadcrumb can link back to the right place
  const q = route.query || {}
  if (q.context && typeof q.context === 'string')
    context.value = q.context as 'jurisdiction' | 'project' | 'organization'
  if (q.contextId && typeof q.contextId === 'string') contextId.value = q.contextId

  if (context.value && contextId.value) {
    if (context.value === 'project') {
      const p = useProjectStore().projects.find((p) => p.id === contextId.value)
      contextName.value = p?.title || 'Project'
      if (p?.org_id) {
        useOrganizationStore().setCurrentOrganization(p.org_id)
      }
    } else if (context.value === 'jurisdiction') {
      const j = useJurisdictionStore().jurisdictions.find((j) => j.id === contextId.value)
      contextName.value = j?.name || 'Jurisdiction'
      if (j?.project_id) {
        const project = useProjectStore().projects.find((p) => p.id === j.project_id)
        if (project?.org_id) {
          useOrganizationStore().setCurrentOrganization(project.org_id)
        }
      }
    } else if (context.value === 'organization') {
      useOrganizationStore().setCurrentOrganization(contextId.value)
      contextName.value = useOrganizationStore().currentOrganization?.name || 'Organization'
    }
  }

  await fetchTicketDetails()
  await fetchParticipants()
})

const handleInviteSubmit = async (emails: string[]) => {
  if (!ticket.value?.id) return toast.error('Ticket not loaded yet')

  isInviting.value = true
  try {
    const updated = await ticketStore.inviteParticipantsApi(ticket.value.id, emails)

    if (!updated) {
      toast.error(ticketStore.error || 'Failed to send invites')
      return
    }

    ticket.value = updated
    toast.success(ticketStore.inviteResponseMessage || 'Invites sent successfully')
    inviteModalOpen.value = false

    // ✅ refresh participants so the UI updates from backend truth
    await fetchParticipants()
  } catch (err) {
    console.error('Invite error:', err)
    toast.error('Failed to send invites')
  } finally {
    isInviting.value = false
  }
}

const goBackToTickets = () => {
  const query: Record<string, string> = {}
  if (context.value && contextId.value) {
    query.context = context.value
    query.contextId = contextId.value
  }
  router.push({ name: 'tickets', query })
}

const goBackToTicket = () => {
  router.push({ name: 'ticket-detail', params: { ticketId: ticketId.value }, query: route.query })
}

const goBackToContext = () => {
  if (!context.value || !contextId.value) return goBackToTickets()

  switch (context.value) {
    case 'jurisdiction':
      router.push({ name: 'jurisdiction-detail', params: { id: contextId.value } })
      return
    case 'project':
      router.push({
        name: 'project-detail',
        params: {
          organizationId: useOrganizationStore().currentOrganization?.id,
          id: contextId.value,
        },
      })
      return
    case 'organization':
      router.push({ name: 'organization-profile', params: { organizationId: contextId.value } })
      return
    default:
      return goBackToTickets()
  }
}
</script>

<template>
  <main class="min-h-screen bg-[#F8F7F5] px-4 py-6 sm:px-6 lg:px-10 lg:py-12">
    <div class="mx-auto max-w-5xl space-y-6">
      <Breadcrumb class="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink as-child>
              <a
                href="#"
                class="text-sm font-medium text-gray-600 hover:text-gray-900"
                @click.prevent="contextName ? goBackToContext() : goBackToTickets()"
              >
                {{ contextName || 'Tickets' }}
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink as-child>
              <RouterLink :to="{ name: 'ticket-detail', params: { ticketId }, query: route.query }">
                Ticket
              </RouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Invited Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl font-bold text-[#1F1F1F]">Invited Users</h1>
          <p class="text-sm">Manage collaborators invited to this ticket.</p>
        </div>

        <button
          class="inline-flex items-center gap-2 rounded-lg bg-[#3E1C05] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f1404] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isInviting || !ticket"
          @click="inviteModalOpen = true"
        >
          <svg
            v-if="isInviting"
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
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <MailPlus v-else class="h-4 w-4" />
          {{ isInviting ? 'Sending...' : 'Invite Users' }}
        </button>
      </div>

      <!-- Ticket Loading -->
      <div
        v-if="isLoadingTicket && !ticket"
        class="bg-background flex items-center justify-center rounded-2xl border border-gray-100 p-12 shadow-sm"
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
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p class="mt-4 text-sm text-gray-500">Loading ticket details...</p>
        </div>
      </div>

      <!-- Main Card -->
      <div
        v-else-if="ticket"
        class="bg-background rounded-2xl border border-gray-100 p-6 shadow-sm sm:p-8"
      >
        <!-- Participants loading -->
        <div v-if="isLoadingParticipants" class="text-sm text-gray-500">
          Loading participants...
        </div>

        <!-- Participants list -->
        <div v-else-if="participants.length" class="space-y-4">
          <div
            v-for="p in participants"
            :key="`${p.type}-${p.id}`"
            class="flex items-center justify-between rounded-lg border border-[#F0ECE9] bg-[#FBFAF7] px-4 py-3 text-sm text-[#1F1F1F]"
          >
            <div class="space-y-1">
              <p class="font-semibold text-[#1F1F1F]">
                {{ p.email }}
                <span v-if="p.type === 'external'" class="ml-2 text-xs text-gray-500">(Guest)</span>
              </p>
              <p class="text-xs text-gray-500">
                Invited on {{ p.invited_at ? formatDate(p.invited_at) : '—' }}
              </p>
            </div>

            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              :class="[
                p.status?.toLowerCase() === 'online'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-700',
              ]"
            >
              {{ p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : '—' }}
            </span>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E6E1DB] bg-[#FDFBF7] px-6 py-12 text-center"
        >
          <div
            class="bg-background mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#E6E1DB]"
          >
            <CircleHelp class="h-6 w-6 text-[#8C8278]" />
          </div>
          <p class="text-base font-semibold text-[#1F1F1F]">No User invited</p>
          <p class="mt-1 text-sm text-gray-500">There has been no user invited</p>
          <button
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#3E1C05] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f1404]"
            @click="inviteModalOpen = true"
          >
            <MailPlus class="h-4 w-4" />
            Invite Users
          </button>
        </div>
      </div>

      <!-- Ticket not found -->
      <div v-else class="bg-background rounded-2xl p-8 text-center shadow-sm ring-1 ring-gray-100">
        <p class="text-lg font-semibold text-gray-900">Ticket not found</p>
        <p class="mt-2 text-sm">Return to tickets to select another.</p>
        <button class="btn--default btn--lg mt-4" @click="goBackToTicket">Back to ticket</button>
      </div>
    </div>

    <UserInviteModal
      v-model:open="inviteModalOpen"
      :is-loading="isInviting"
      @invite="handleInviteSubmit"
    />
  </main>
</template>
