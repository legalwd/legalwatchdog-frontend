<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useTicketStore } from '@/stores/ticket-store'
import type { GuestTicketAccess } from '@/types/ticket'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

const loading = ref(true)
const errorMessage = ref<string | null>(null)
const responseMessage = ref<string | null>(null)
const ticket = ref<GuestTicketAccess | null>(null)

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const ticketId = computed(() =>
  typeof route.query.ticket_id === 'string' ? route.query.ticket_id : undefined,
)

const statusBadgeClass = computed(() => {
  const status = ticket.value?.status
  if (status === 'OPEN') return 'bg-emerald-100 text-emerald-800'
  if (status === 'IN_PROGRESS') return 'bg-amber-100 text-amber-800'
  if (status === 'CLOSED') return 'bg-rose-100 text-rose-800'
  return 'bg-slate-100 text-slate-700'
})

const priorityBadgeClass = computed(() => {
  const priority = ticket.value?.priority
  if (priority === 'CRITICAL') return 'bg-rose-100 text-rose-800'
  if (priority === 'HIGH') return 'bg-orange-100 text-orange-800'
  if (priority === 'MEDIUM') return 'bg-amber-100 text-amber-800'
  if (priority === 'LOW') return 'bg-emerald-100 text-emerald-800'
  return 'bg-slate-100 text-slate-700'
})

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    parsed,
  )
}

const goHome = () => {
  router.push({ name: 'home' })
}

const goToTicketDetail = () => {
  if (ticket.value) {
    router.push({
      name: 'ticket-detail',
      params: { ticketId: ticket.value.ticket_id },
      query: { token: token.value },
    })
  }
}

onMounted(async () => {
  if (!token.value) {
    errorMessage.value = 'Missing guest access token.'
    loading.value = false
    return
  }

  const response = await ticketStore.getGuestTicketAccess(token.value, ticketId.value)
  responseMessage.value = response?.message ?? null
  ticket.value = response?.data ?? null

  if (!ticket.value) {
    errorMessage.value = ticketStore.error || 'Unable to validate guest access.'
  }
  loading.value = false
})
</script>

<template>
  <main class="bg-slate-50">
    <section class="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col px-6 py-12">
      <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
              Guest Access
            </p>
            <h1 class="mt-2 text-2xl font-semibold text-slate-900">Ticket access</h1>
            <p class="mt-1 text-sm text-slate-500">Review the ticket you were invited to view.</p>
          </div>
          <div v-if="ticket" class="flex items-center gap-2">
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusBadgeClass">
              {{ ticket.status }}
            </span>
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="priorityBadgeClass">
              {{ ticket.priority }}
            </span>
          </div>
        </div>

        <div class="mt-8">
          <div v-if="loading" class="text-sm text-slate-500">Validating your access...</div>

          <div v-else-if="errorMessage" class="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
            <p class="font-semibold">We could not verify this guest link.</p>
            <p class="mt-2">{{ errorMessage }}</p>
            <button
              type="button"
              class="mt-4 inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold tracking-wide text-rose-700 uppercase transition hover:bg-rose-100"
              @click="goHome"
            >
              Return home
            </button>
          </div>

          <div v-else-if="ticket" class="space-y-6">
            <div class="rounded-xl border border-slate-200 p-5">
              <p class="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                Ticket Details
              </p>
              <h2 class="mt-3 text-xl font-semibold text-slate-900">{{ ticket.title }}</h2>
              <p class="mt-2 text-sm text-slate-600">
                {{ ticket.description || 'No description provided.' }}
              </p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-slate-200 p-4">
                <p class="text-xs tracking-[0.2em] text-slate-400 uppercase">Ticket #</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ ticket.ticket_number || 'N/A' }}
                </p>
              </div>
              <div class="rounded-xl border border-slate-200 p-4">
                <p class="text-xs tracking-[0.2em] text-slate-400 uppercase">Project</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ ticket.project_name || 'N/A' }}
                </p>
              </div>
              <div class="rounded-xl border border-slate-200 p-4">
                <p class="text-xs tracking-[0.2em] text-slate-400 uppercase">Created</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ formatDate(ticket.created_at) }}
                </p>
              </div>
              <div class="rounded-xl border border-slate-200 p-4">
                <p class="text-xs tracking-[0.2em] text-slate-400 uppercase">Access expires</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ formatDate(ticket.access_expires_at) }}
                </p>
              </div>
            </div>

            <div class="rounded-xl border border-slate-200 p-4">
              <p class="text-xs tracking-[0.2em] text-slate-400 uppercase">Participant</p>
              <div class="mt-2 flex flex-col gap-1 text-sm text-slate-700 sm:flex-row sm:gap-4">
                <span class="font-semibold text-slate-900">{{ ticket.participant_email }}</span>
                <span class="text-slate-500">Role: {{ ticket.participant_role }}</span>
              </div>
            </div>

            <button
              type="button"
              class="inline-flex items-center rounded-lg bg-[#3E1C05] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5A2D07]"
              @click="goToTicketDetail"
            >
              View Ticket Details
            </button>

            <p v-if="responseMessage" class="text-sm text-slate-500">
              {{ responseMessage }}
            </p>
          </div>

          <div v-else class="text-sm text-slate-500">
            We could not find ticket information for this link.
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
