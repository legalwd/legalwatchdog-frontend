<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { ticketApi } from '@/api/ticket'
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
import type { Ticket } from '@/types/ticket'

const route = useRoute()
const router = useRouter()
const organizationStore = useOrganizationStore()
const projectStore = useProjectStore()
const jurisdictionStore = useJurisdictionStore()

const context = ref<'jurisdiction' | 'project' | 'organization' | null>(null)
const contextId = ref<string | null>(null)
const contextName = ref<string>('')
const isLoadingTickets = ref(false)
const isClosingTicket = ref(false)
const activeMenuId = ref<string | null>(null)
const searchQuery = ref('')
const tickets = ref<Ticket[]>([])

const LAST_JURISDICTION_KEY = 'lwd:last-jurisdiction-id'

const readQueryString = (value: unknown): string | null => {
  if (typeof value === 'string' && value) return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return null
}

const readLastJurisdictionId = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LAST_JURISDICTION_KEY)
  } catch {
    return null
  }
}

const applyContextName = () => {
  if (!context.value || !contextId.value) return
  if (context.value === 'jurisdiction') {
    const jurisdiction = jurisdictionStore.jurisdictions.find((j) => j.id === contextId.value)
    contextName.value = jurisdiction?.name || 'Jurisdiction'
    if (jurisdiction?.project_id) {
      const project = projectStore.projects.find((p) => p.id === jurisdiction.project_id)
      if (project?.org_id) {
        organizationStore.setCurrentOrganization(project.org_id)
      }
    }
    return
  }
  if (context.value === 'project') {
    const project = projectStore.projects.find((p) => p.id === contextId.value)
    contextName.value = project?.title || 'Project'
    if (project?.org_id) {
      organizationStore.setCurrentOrganization(project.org_id)
    }
    return
  }
  organizationStore.setCurrentOrganization(contextId.value)
  contextName.value = organizationStore.currentOrganization?.name || 'Organization'
}

// Track click outside to close menu
const closeMenuOnClickOutside = () => {
  activeMenuId.value = null
}

onMounted(async () => {
  const q = route.query || {}
  const contextFromQuery = readQueryString(q.context)
  const contextIdFromQuery = readQueryString(q.contextId)

  if (
    contextFromQuery &&
    contextIdFromQuery &&
    (contextFromQuery === 'jurisdiction' ||
      contextFromQuery === 'project' ||
      contextFromQuery === 'organization')
  ) {
    context.value = contextFromQuery
    contextId.value = contextIdFromQuery
  } else if (readQueryString(q.jurisdiction_id)) {
    context.value = 'jurisdiction'
    contextId.value = readQueryString(q.jurisdiction_id)
  } else if (readQueryString(q.project_id)) {
    context.value = 'project'
    contextId.value = readQueryString(q.project_id)
  } else if (readQueryString(q.organization_id)) {
    context.value = 'organization'
    contextId.value = readQueryString(q.organization_id)
  } else {
    const lastJurisdictionId = readLastJurisdictionId()
    if (lastJurisdictionId) {
      context.value = 'jurisdiction'
      contextId.value = lastJurisdictionId
    } else if (organizationStore.currentOrganization?.id) {
      context.value = 'organization'
      contextId.value = organizationStore.currentOrganization.id
    }
  }

  applyContextName()

  // Fetch tickets from API on mount
  await fetchTickets()

  // Add click event listener to close menu when clicking outside
  document.addEventListener('click', closeMenuOnClickOutside)
})

onBeforeUnmount(() => {
  // Clean up event listener
  document.removeEventListener('click', closeMenuOnClickOutside)
})
const normalizeStatus = (status?: string | null) => {
  const s = (status || '').toUpperCase()
  if (s === 'CLOSED' || s === 'RESOLVED') return 'closed'
  if (s === 'IN_PROGRESS') return 'in_progress'
  return 'open'
}

const normalizePriority = (priority?: string | null) => {
  const p = (priority || '').toUpperCase()
  if (p === 'LOW') return 'low'
  if (p === 'MEDIUM') return 'medium'
  if (p === 'CRITICAL') return 'critical'
  return 'high'
}

const normalizeTickets = (list: Ticket[]) => {
  return list.map((t: Ticket) => ({
    ...t,
    status: normalizeStatus(t.status),
    priority: normalizePriority(t.priority),
    // backend uses created_at; your UI sorts by updated_at
    updated_at: t.updated_at || t.created_at || new Date().toISOString(),
  }))
}

const fetchTickets = async () => {
  if (!contextId.value) {
    console.warn('Skipped fetching tickets: missing contextId')
    return
  }

  isLoadingTickets.value = true
  try {
    const response = context.value
      ? await ticketApi.getTickets({
          [context.value === 'jurisdiction'
            ? 'jurisdiction_id'
            : context.value === 'project'
              ? 'project_id'
              : 'organization_id']: contextId.value,
        })
      : await ticketApi.getTicketsBySource({ source_id: contextId.value })
    tickets.value = normalizeTickets(resolveTicketList(response.data)) as Ticket[]
  } catch (error) {
    console.error('Error fetching tickets:', error)
    toast.error('Failed to load tickets')
  } finally {
    isLoadingTickets.value = false
  }
}

const activeTab = ref('All Tickets')
const tabs = ['All Tickets', 'Open', 'Closed']

const filteredTickets = computed(() => {
  let list = sortedTickets.value

  // Filter by tab
  if (activeTab.value === 'Open') {
    list = list.filter((t) => t.status?.toLowerCase() !== 'closed')
  } else if (activeTab.value === 'Closed') {
    list = list.filter((t) => t.status?.toLowerCase() === 'closed')
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    list = list.filter((ticket) => {
      return (
        ticket.id?.toLowerCase().includes(query) ||
        ticket.title?.toLowerCase().includes(query) ||
        ticket.status?.toLowerCase().includes(query) ||
        ticket.priority?.toLowerCase().includes(query)
      )
    })
  }

  return list
})

const statusLabel = (status: string) => {
  const s = status?.toLowerCase()
  if (s === 'closed') return 'Closed'
  if (s === 'in_progress') return 'In Progress'
  return 'Open'
}

const priorityLabel = (priority: string) => {
  const normalized = priority.toLowerCase()
  if (normalized === 'medium') return 'Medium'
  if (normalized === 'low') return 'Low'
  if (normalized === 'critical') return 'Critical'
  return 'High'
}

const goToTicket = (id: string) => {
  activeMenuId.value = null

  // Preserve current context so the ticket detail page can show the originating project/organization/jurisdiction
  const query: Record<string, string> = {}
  if (context.value && contextId.value) {
    query.context = context.value
    query.contextId = contextId.value
  }

  router.push({ name: 'ticket-detail', params: { ticketId: id }, query })
}

const goToContext = () => {
  if (!context.value || !contextId.value) {
    router.push({ name: 'dashboard' })
    return
  }

  switch (context.value) {
    case 'jurisdiction':
      router.push({
        name: 'jurisdiction-detail',
        params: { id: contextId.value },
      })
      break
    case 'project':
      router.push({
        name: 'project-detail',
        params: {
          organizationId: organizationStore.currentOrganization?.id,
          id: contextId.value,
        },
      })
      break
    case 'organization':
      router.push({
        name: 'organization-profile',
        params: { organizationId: contextId.value },
      })
      break
    default:
      router.push({ name: 'dashboard' })
  }
}

const toggleMenu = (id: string, event: Event) => {
  event.preventDefault()
  event.stopPropagation()

  if (activeMenuId.value === id) {
    activeMenuId.value = null
  } else {
    activeMenuId.value = id
  }
}

const closeTicket = async (id: string) => {
  isClosingTicket.value = true
  activeMenuId.value = null

  try {
    await ticketApi.closeTicket(id, 'Closed from tickets list')
    const updated = tickets.value.find((ticket) => ticket.id === id)
    if (updated) {
      updated.status = 'closed'
      updated.updated_at = new Date().toISOString()
    }

    toast.success('Ticket closed successfully')
  } catch (error) {
    console.error('Error closing ticket:', error)
    toast.error(parseError(error, 'Failed to close ticket'))
  } finally {
    isClosingTicket.value = false
  }
}

const sortedTickets = computed(() =>
  [...tickets.value].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  ),
)

const resolveTicketList = (payload: unknown): Ticket[] => {
  if (!payload || typeof payload !== 'object') return []
  const dataObj = payload as { data?: unknown; tickets?: unknown }
  if (Array.isArray(dataObj)) return dataObj as Ticket[]
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
</script>

<template>
  <div>
    <Breadcrumb class="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <a
              href="#"
              class="text-sm font-medium hover:text-gray-900"
              @click.prevent="goToContext"
            >
              {{ contextName || 'Dashboard' }}
            </a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage class="text-sm font-semibold text-gray-900"> Tickets </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <div class="min-h-screen w-full p-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-[28px] font-bold text-[#1A1A1A]">All Tickets</h1>

        <!-- Refresh Button -->
        <button
          :disabled="isLoadingTickets"
          class="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#344054] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          @click="fetchTickets"
        >
          <svg
            class="h-4 w-4"
            :class="{ 'animate-spin': isLoadingTickets }"
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
          {{ isLoadingTickets ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div class="bg-background flex items-center gap-2 rounded-lg p-1">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="btn rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="[
              activeTab === tab
                ? 'bg-primary text-white'
                : 'text-fg bg-transparent hover:bg-gray-50',
            ]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Right Actions (Filter & Search) -->
        <div class="flex w-full items-center gap-3 sm:w-auto">
          <!-- Filter Button (UI only - no backend support) -->
          <button
            class="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#344054] transition-colors hover:bg-gray-50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 3.33333H14M4.66667 8H11.3333M7.33333 12.6667H8.66667"
                stroke="#344054"
                stroke-width="1.33333"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Filter
          </button>

          <div class="relative w-full sm:w-70">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                  stroke="#667085"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tickets..."
              class="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 pr-4 pl-10 text-sm text-[#101828] placeholder-[#667085] focus:border-[#3E1C05] focus:ring-2 focus:ring-[#3E1C05]/10 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoadingTickets && tickets.length === 0"
        class="flex items-center justify-center py-12"
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
          <p class="mt-4 text-sm text-gray-500">Loading tickets...</p>
        </div>
      </div>

      <!-- Tickets Table - Always show when not in initial loading -->
      <div
        v-if="!isLoadingTickets || tickets.length > 0"
        class="bg-background min-h-screen w-full overflow-visible rounded-lg border border-[#EAECF0]"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-[#EAECF0] bg-[#F7F7F7]">
              <th
                class="w-30 px-6 py-3 text-left text-xs font-semibold tracking-wider text-[#5C5956] uppercase"
              >
                Ticket #
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-[#5C5956] uppercase"
              >
                Title
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-[#5C5956] uppercase"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-[#5C5956] uppercase"
              >
                Priority
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-[#5C5956] uppercase"
              >
                Last Updated
              </th>
              <th
                class="w-20 px-6 py-3 text-center text-xs font-semibold tracking-wider text-[#5C5956] uppercase"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="bg-background divide-y divide-[#EAECF0]">
            <tr
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              class="cursor-pointer transition-colors hover:bg-gray-50"
              @click="goToTicket(ticket.id)"
            >
              <!-- Ticket Number -->
              <td class="px-6 py-4 text-sm font-medium text-[#101828]">
                {{ ticket.ticket_number || ticket.id }}
              </td>

              <!-- Title -->
              <td class="px-6 py-4 text-sm font-medium text-[#101828]">
                {{ ticket.title }}
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                  :class="[
                    ticket.status !== 'closed'
                      ? 'border-[#F9DBAF] bg-[#F9DBAF]/30 text-[#B93815]'
                      : 'bg-gray-100 text-gray-700',
                  ]"
                >
                  {{ statusLabel(ticket.status) }}
                </span>
              </td>

              <!-- Priority -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center rounded-full border border-[#FFDDC7] bg-[#FFF6ED] px-2.5 py-0.5 text-xs font-medium text-[#C4320A]"
                >
                  {{ priorityLabel(ticket.priority) }}
                </span>
              </td>

              <!-- Last Updated -->
              <td class="px-6 py-4 text-sm text-[#667085]">
                {{ new Date(ticket.updated_at).toLocaleString() }}
              </td>

              <!-- Action -->
              <td class="relative px-6 py-4 text-center">
                <button
                  :disabled="isClosingTicket"
                  class="relative z-10 rounded-full p-1 text-[#98A2B3] transition-colors hover:bg-gray-100 hover:text-[#344054] disabled:cursor-not-allowed disabled:opacity-50"
                  @click.stop="toggleMenu(ticket.id, $event)"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="activeMenuId === ticket.id"
                  class="bg-background absolute top-full right-6 z-50 mt-2 w-48 rounded-xl border border-gray-100 py-2 text-left shadow-[0px_4px_24px_rgba(0,0,0,0.1)]"
                  @click.stop
                >
                  <button
                    class="w-full px-5 py-3 text-left text-[15px] font-medium text-[#344054] transition-colors hover:bg-gray-50"
                    @click="goToTicket(ticket.id)"
                  >
                    Open ticket
                  </button>
                  <button
                    v-if="ticket.status !== 'closed'"
                    class="w-full px-5 py-3 text-left text-[15px] font-medium text-[#DC2626] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="isClosingTicket"
                    @click="closeTicket(ticket.id)"
                  >
                    {{ isClosingTicket ? 'Closing...' : 'Close ticket' }}
                  </button>
                  <button
                    v-else
                    class="w-full cursor-not-allowed px-5 py-3 text-left text-[15px] font-medium text-gray-400"
                    disabled
                  >
                    Already Closed
                  </button>
                </div>
              </td>
            </tr>
            <!-- Show empty state if no tickets -->
            <tr v-if="filteredTickets.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                <template v-if="searchQuery.trim()">
                  No tickets found matching "{{ searchQuery }}".
                </template>
                <template v-else> No tickets found in the "{{ activeTab }}" category. </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar for table if needed */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #d0d5dd;
  border-radius: 4px;
}

/* Dropdown animation */
.animate-in {
  animation: animateIn 0.2s ease-out;
}

@keyframes animateIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.zoom-in {
  animation: zoomIn 0.2s ease-out;
}

@keyframes zoomIn {
  from {
    transform: scale(0.95);
  }

  to {
    transform: scale(1);
  }
}
</style>
