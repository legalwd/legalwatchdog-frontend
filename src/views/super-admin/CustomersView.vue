<template>
  <div class="min-h-screen bg-white">
    <main class="p-6">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Customers</h1>
        <div class="flex items-center gap-6">
          <p class="text-sm">
            Total Credits:
            <span class="font-semibold">{{
              loadingOverview ? '—' : availableCredits ? availableCredits.toLocaleString() : '—'
            }}</span>
          </p>
          <Button
            class="cursor-pointer px-6 text-sm sm:px-8 sm:text-base"
            size="lg"
            variant="default"
          >
            Download
          </Button>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="New Users"
          :value="newUsers"
          :percent-change="newUsersPercentChange"
          :data="userGrowthData"
          :labels="userGrowthLabels"
        />

        <StatCard
          title="Total Users"
          :value="totalUsers"
          :percent-change="totalUsersPercentChange"
          :data="userGrowthData"
          :labels="userGrowthLabels"
        />

        <StatCard
          title="Active Users"
          :value="activeUsers"
          :percent-change="activeUsersPercentChange"
          :data="userGrowthData"
          :labels="userGrowthLabels"
        />

        <PayingUsersCard
          :total="payingUsersBreakdown.reduce((s, p) => s + (p.value || 0), 0)"
          :breakdown="payingUsersBreakdown"
        />
      </div>

      <!-- Filters Bar -->
      <div class="flex items-center gap-4 pb-4">
        <button
          :class="[
            'rounded px-4 py-2 text-sm font-medium',
            activeFilter === 'all'
              ? 'bg-[#F5F4FF] text-[#7C3AED]'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
          @click="activeFilter = 'all'"
        >
          {{ selectedDuration }}
        </button>

        <div class="relative">
          <button
            class="flex items-center gap-2 rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            @click="showDurationFilter = !showDurationFilter"
          >
            <span
              ><svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.667 0.625C12.6898 0.625175 12.708 0.644125 12.708 0.666992V1.95801H15.333C16.0923 1.95801 16.7078 2.57377 16.708 3.33301V15.333C16.708 16.0924 16.0924 16.708 15.333 16.708H2C1.24061 16.708 0.625 16.0924 0.625 15.333V3.33301C0.625176 2.57376 1.24071 1.95801 2 1.95801H4.625V0.666992C4.625 0.643984 4.64398 0.625 4.66699 0.625C4.68985 0.625175 4.70801 0.644092 4.70801 0.666992V1.95801H12.625V0.666992C12.625 0.644016 12.644 0.625 12.667 0.625ZM0.708008 15.333C0.708008 16.0463 1.2866 16.625 2 16.625H15.333C16.0463 16.625 16.625 16.0463 16.625 15.333V6.04199H0.708008V15.333ZM3.33301 13.958C3.35598 13.958 3.375 13.977 3.375 14C3.375 14.023 3.35598 14.042 3.33301 14.042C3.31018 14.0418 3.29199 14.0229 3.29199 14C3.29199 13.9771 3.31018 13.9582 3.33301 13.958ZM6 13.958C6.02298 13.958 6.04199 13.977 6.04199 14C6.04199 14.023 6.02298 14.042 6 14.042C5.97702 14.042 5.95801 14.023 5.95801 14C5.95801 13.977 5.97702 13.958 6 13.958ZM8.66699 13.958C8.68982 13.9582 8.70801 13.9771 8.70801 14C8.70801 14.0229 8.68982 14.0418 8.66699 14.042C8.64402 14.042 8.625 14.023 8.625 14C8.625 13.977 8.64402 13.958 8.66699 13.958ZM11.333 13.958C11.356 13.958 11.375 13.977 11.375 14C11.375 14.023 11.356 14.042 11.333 14.042C11.3102 14.0418 11.292 14.0229 11.292 14C11.292 13.9771 11.3102 13.9582 11.333 13.958ZM3.33301 11.292C3.35591 11.292 3.37482 11.3101 3.375 11.333C3.375 11.356 3.35602 11.375 3.33301 11.375C3.31015 11.3748 3.29199 11.3559 3.29199 11.333C3.29217 11.3103 3.31026 11.2922 3.33301 11.292ZM6 11.292C6.0229 11.292 6.04182 11.3101 6.04199 11.333C6.04199 11.356 6.02301 11.375 6 11.375C5.97699 11.375 5.95801 11.356 5.95801 11.333C5.95818 11.3101 5.9771 11.292 6 11.292ZM8.66699 11.292C8.68974 11.2922 8.70783 11.3103 8.70801 11.333C8.70801 11.3559 8.68985 11.3748 8.66699 11.375C8.64398 11.375 8.625 11.356 8.625 11.333C8.62518 11.3101 8.64409 11.292 8.66699 11.292ZM11.333 11.292C11.3559 11.292 11.3748 11.3101 11.375 11.333C11.375 11.356 11.356 11.375 11.333 11.375C11.3101 11.3748 11.292 11.3559 11.292 11.333C11.2922 11.3103 11.3103 11.2922 11.333 11.292ZM14 11.292C14.0229 11.292 14.0418 11.3102 14.042 11.333C14.042 11.356 14.023 11.375 14 11.375C13.977 11.375 13.958 11.356 13.958 11.333C13.9582 11.3102 13.9771 11.292 14 11.292ZM8.66699 8.625C8.68985 8.62517 8.70801 8.64409 8.70801 8.66699C8.70783 8.68974 8.68974 8.70783 8.66699 8.70801C8.64409 8.70801 8.62517 8.68985 8.625 8.66699C8.625 8.64398 8.64398 8.625 8.66699 8.625ZM11.333 8.625C11.356 8.625 11.375 8.64398 11.375 8.66699C11.3748 8.68985 11.3559 8.70801 11.333 8.70801C11.3103 8.70783 11.2922 8.68974 11.292 8.66699C11.292 8.64409 11.3101 8.62518 11.333 8.625ZM14 8.625C14.023 8.625 14.042 8.64402 14.042 8.66699C14.0418 8.68982 14.0229 8.70801 14 8.70801C13.9771 8.70801 13.9582 8.68982 13.958 8.66699C13.958 8.64402 13.977 8.625 14 8.625ZM2 2.04199C1.28674 2.04199 0.708184 2.61979 0.708008 3.33301V5.95801H16.625V3.33301C16.6248 2.61976 16.0462 2.04199 15.333 2.04199H12.708V3.33301C12.708 3.35588 12.6898 3.37482 12.667 3.375C12.644 3.375 12.625 3.35598 12.625 3.33301V2.04199H4.70801V3.33301C4.70801 3.35591 4.68985 3.37483 4.66699 3.375C4.64398 3.375 4.625 3.35602 4.625 3.33301V2.04199H2Z"
                  fill="#09090B"
                  stroke="#3F3F46"
                  stroke-width="1.25"
                />
              </svg>
            </span>
            <span>Duration</span>
          </button>

          <!-- Duration Dropdown -->
          <div
            v-if="showDurationFilter"
            class="absolute top-full left-0 z-10 mt-2 w-48 rounded-lg border border-gray-300 bg-white shadow-lg"
          >
            <div class="p-2">
              <button
                v-for="option in durationOptions"
                :key="option"
                :class="[
                  'w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100',
                  selectedDuration === option ? 'bg-blue-50 text-blue-600' : '',
                ]"
                @click="selectDuration(option)"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>

        <div class="relative">
          <button
            class="flex items-center gap-2 rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            @click="showUserFilter = !showUserFilter"
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 10H15M2.5 5H17.5M7.5 15H12.5"
                  stroke="#414651"
                  stroke-width="1.67"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span>Filters</span>
          </button>

          <!-- User Filter Dropdown -->
          <div
            v-if="showUserFilter"
            class="absolute top-full left-0 z-20 mt-2 w-48 rounded-lg border border-gray-300 bg-white shadow-lg"
          >
            <div class="p-2">
              <button
                v-for="option in userFilterOptions"
                :key="option.value"
                class="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                :class="{
                  'bg-blue-50 text-blue-600': activeUserFilter === option.value,
                }"
                @click="selectUserFilter(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="ml-auto">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name..."
            class="rounded border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Table Section -->
      <div class="rounded-lg bg-white shadow">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-200 bg-gray-100">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Users
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Payment Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Last Log-in
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Activity length
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Referrals
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Credit Used
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Amount Spent
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <!-- Skeleton Loading State -->
              <template v-if="loadingCustomers">
                <tr v-for="i in 10" :key="`skeleton-${i}`" class="animate-pulse">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-gray-200"></div>
                      <div class="ml-4 space-y-2">
                        <div class="h-4 w-32 rounded bg-gray-200"></div>
                        <div class="h-3 w-24 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-6 w-20 rounded-full bg-gray-200"></div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-4 w-24 rounded bg-gray-200"></div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-4 w-16 rounded bg-gray-200"></div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-4 w-8 rounded bg-gray-200"></div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-4 w-12 rounded bg-gray-200"></div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-4 w-16 rounded bg-gray-200"></div>
                  </td>
                </tr>
              </template>

              <tr v-else-if="paginatedCustomers.length === 0">
                <td class="px-6 py-4 text-center text-gray-500" colspan="7">
                  {{
                    searchQuery
                      ? 'No customers found for your search'
                      : 'No customers found for the selected filters'
                  }}
                </td>
              </tr>

              <tr
                v-for="customer in paginatedCustomers"
                v-else
                :key="customer.id"
                class="cursor-pointer hover:bg-gray-50"
                @click="openUserModal(customer)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200"
                    >
                      {{ customer.avatar }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                      <div class="text-sm text-gray-500">
                        Last Active: {{ customer.lastActive }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold',
                      customer.paymentStatus === 'Trial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : customer.paymentStatus === 'Professional'
                          ? 'bg-orange-100 text-orange-800'
                          : customer.paymentStatus === 'Essential'
                            ? 'bg-green-100 text-green-800'
                            : customer.paymentStatus === 'Free'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-green-100 text-green-800',
                    ]"
                  >
                    {{ customer.paymentStatus }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {{ customer.lastLogin }}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {{ customer.activityLength }}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {{ customer.referrals }}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {{ customer.creditUsed }}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  ${{ customer.amountSpent }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="flex items-center justify-between p-4">
            <div class="text-sm text-gray-600">
              {{ displayedCountText }}
            </div>
            <div class="flex items-center gap-2">
              <button
                :disabled="currentPage <= 1"
                class="cursor-pointer rounded border bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                @click="prevPage"
              >
                Prev
              </button>
              <span class="text-sm">Page {{ currentPage }} / {{ totalPages }}</span>
              <button
                :disabled="currentPage >= totalPages"
                class="cursor-pointer rounded border bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                @click="nextPage"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <CustomerDetailView :is-open="showUserModal" :user="selectedUser" @close="closeUserModal" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

import { superadminCustomersService } from '@/api/super-admin-customers'
import PayingUsersCard from '@/components/super-admin/PayingUsersCard.vue'
import StatCard from '@/components/super-admin/StatCard.vue'
import Button from '@/components/ui/button/Button.vue'

import CustomerDetailView from './CustomerDetailView.vue'

interface ApiCustomer {
  id: string
  name: string
  last_active?: string
  registration_date: string
  payment_status?: string
  credits_used?: number
  amount_spent?: number
  avatar_url?: string
}

interface CustomerRow {
  id: string
  name: string
  avatar: string
  lastActive: string
  paymentStatus: string
  lastLogin: string
  activityLength: string
  referrals: number
  creditUsed: number
  amountSpent: number
  registrationTimestamp: number
}

interface CustomersMeta {
  total: number
  page: number
  limit: number
  total_pages: number
}

interface FilterOption {
  label: string
  value: string
}

interface PayingUserBreakdown {
  label: string
  value: number
  color: string
}

interface QueryParams {
  q?: string
  page?: number
  limit?: number
  payment_status?: string
  plan?: string
  start_date?: string
  end_date?: string
}

const activeFilter = ref('all')
const showDurationFilter = ref(false)
const showUserFilter = ref(false)
const searchQuery = ref('')
const selectedDuration = ref('All Time')
const currentPage = ref(1)
const activeUserFilter = ref<string>('all')

const selectedUser = ref<CustomerRow | null>(null)
const showUserModal = ref(false)
const userGrowthData = ref<number[]>([])
const userGrowthLabels = ref<string[]>([])

const activityRate = ref<number>(0)
const conversionRate = ref<number>(0)

const openUserModal = (user: CustomerRow) => {
  selectedUser.value = user
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}

const durationOptions = [
  'All Time',
  'Last Month',
  'Last 3 Months',
  'Last 6 Months',
  'Last Year',
  'Custom',
]

const userFilterOptions = ref<FilterOption[]>([
  { label: 'All', value: 'all' },
  { label: 'Trialing', value: 'trialing' },
  { label: 'Paid', value: 'paid' },
  { label: 'Past due', value: 'past_due' },
])

const payingUsersBreakdown = ref<PayingUserBreakdown[]>([
  { label: 'Paid', value: 0, color: '#3B82F6' },
  { label: 'Free', value: 0, color: '#E5E7EB' },
])

const customers = ref<CustomerRow[]>([])
const allCustomers = ref<CustomerRow[]>([])
const customersMeta = ref<CustomersMeta>({
  total: 0,
  page: 1,
  limit: 10,
  total_pages: 1,
})

const loadingCustomers = ref(false)
const availableCredits = ref<number | null>(null)
const loadingOverview = ref(true)

const newUsers = ref(0)
const totalUsers = ref(0)
const activeUsers = ref(0)

const newUsersPercentChange = ref(0)
const totalUsersPercentChange = ref(0)
const activeUsersPercentChange = ref(0)

const revenueTrendData = ref<number[]>([])
const revenueTrendLabels = ref<string[]>([])

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const computeActivityLength = (registrationDate: string) => {
  try {
    const start = new Date(registrationDate)
    const diff = Math.abs(Date.now() - start.getTime())
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return `${days} days`
  } catch {
    return ''
  }
}

const mapCustomer = (c: ApiCustomer): CustomerRow => {
  const paymentStatus = c.payment_status
    ? c.payment_status.charAt(0).toUpperCase() + c.payment_status.slice(1)
    : 'Free'

  return {
    id: c.id,
    name: c.name,
    avatar: c.avatar_url
      ? ''
      : c.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
    lastActive: c.last_active ? formatDate(c.last_active) : formatDate(c.registration_date),
    paymentStatus,
    lastLogin: formatDate(c.registration_date),
    activityLength: computeActivityLength(c.registration_date),
    referrals: 0,
    creditUsed: c.credits_used ?? 0,
    amountSpent: c.amount_spent ?? 0,
    registrationTimestamp: new Date(c.registration_date).getTime(),
  }
}

const filteredCustomers = computed(() => {
  let filtered = allCustomers.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(query))
  }

  return filtered
})

const paginatedCustomers = computed(() => {
  const itemsPerPage = customersMeta.value.limit
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage

  return filteredCustomers.value.slice(start, end)
})

const totalPages = computed(() => {
  const total = filteredCustomers.value.length
  return Math.ceil(total / customersMeta.value.limit) || 1
})

const displayedCountText = computed(() => {
  const total = filteredCustomers.value.length
  const itemsPerPage = customersMeta.value.limit
  const start = total > 0 ? (currentPage.value - 1) * itemsPerPage + 1 : 0
  const end = Math.min(currentPage.value * itemsPerPage, total)

  if (searchQuery.value) {
    return `Showing ${start}-${end} of ${total} results for "${searchQuery.value}"`
  } else if (activeUserFilter.value !== 'all' || selectedDuration.value !== 'All Time') {
    return `Showing ${start}-${end} of ${total} (filtered)`
  }
  return `Showing ${start}-${end} of ${total}`
})

// let searchTimeout: ReturnType<typeof setTimeout> | null = null

const loadCustomers = async (params?: QueryParams) => {
  loadingCustomers.value = true
  try {
    const pageParam = params?.page ?? 1
    const queryParams: QueryParams = {
      page: pageParam,
      limit: params?.limit ?? 100,
    }

    if (activeUserFilter.value !== 'all') {
      queryParams.payment_status = activeUserFilter.value
    }

    if (selectedDuration.value !== 'All Time') {
      const now = new Date()
      const startDate = new Date()
      switch (selectedDuration.value) {
        case 'Last Month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'Last 3 Months':
          startDate.setMonth(now.getMonth() - 3)
          break
        case 'Last 6 Months':
          startDate.setMonth(now.getMonth() - 6)
          break
        case 'Last Year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }
      queryParams.start_date = startDate.toISOString()
      queryParams.end_date = now.toISOString()
    }

    const res = await superadminCustomersService.listCustomers(queryParams)

    const data = res.data?.data
    allCustomers.value = data?.customers?.map(mapCustomer) ?? []
    customers.value = allCustomers.value

    if (res.data?.meta) {
      customersMeta.value = {
        total: res.data.meta.total ?? 0,
        page: res.data.meta.page ?? 1,
        limit: 10,
        total_pages: res.data.meta.total_pages ?? 1,
      }
    }
  } catch (err) {
    console.error('Failed to load customers', err)
  } finally {
    loadingCustomers.value = false
  }
}
const safePct = (current: number, prev: number) => {
  if (!prev) return 0
  return Number((((current - prev) / prev) * 100).toFixed(2))
}

const lastValue = (arr: number[]) => (arr.length ? (arr[arr.length - 1] ?? 0) : 0)

const loadCustomersOverview = async () => {
  try {
    const [overviewRes, breakdownRes, revenueTrendRes] = await Promise.all([
      (await import('@/api/super-admin')).superadminDashboardService.getOverview(),
      (await import('@/api/super-admin')).superadminDashboardService.getPaymentBreakdown(),
      (await import('@/api/super-admin')).superadminDashboardService.getRevenueTrend(),
    ])

    const overview = overviewRes.data?.data
    if (overview) {
      availableCredits.value = overview.ai_credits?.total_tokens ?? null
      newUsers.value = overview.users?.new_users ?? newUsers.value
      totalUsers.value = overview.users?.total_users ?? totalUsers.value
      activeUsers.value = overview.users?.active_users ?? activeUsers.value

      activityRate.value = overview.users?.activity_rate ?? 0
      conversionRate.value = overview.users?.conversion_rate ?? 0

      const growth = overview.users?.daily_growth ?? []
      userGrowthLabels.value = growth.map((g) =>
        new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      )
      userGrowthData.value = growth.map((g) => g.new_users ?? 0)

      const todayNewUsers = lastValue(userGrowthData.value)
      const prevNewUsers =
        userGrowthData.value.length >= 2
          ? (userGrowthData.value[userGrowthData.value.length - 2] ?? 0)
          : 0

      // New Users %: last vs previous day
      newUsersPercentChange.value = safePct(todayNewUsers, prevNewUsers)

      const totalYesterday = Math.max(0, (totalUsers.value ?? 0) - todayNewUsers)
      totalUsersPercentChange.value = safePct(totalUsers.value ?? 0, totalYesterday)

      const activeYesterday = Math.max(0, (activeUsers.value ?? 0) - todayNewUsers)
      activeUsersPercentChange.value = safePct(activeUsers.value ?? 0, activeYesterday)
    }

    const revenueTrend = revenueTrendRes.data?.data?.trend ?? []
    if (revenueTrend.length) {
      revenueTrendLabels.value = revenueTrend.map((t: { month: string }) => t.month)
      revenueTrendData.value = revenueTrend.map((t: { revenue: number }) => t.revenue)
    }

    const breakdown = breakdownRes.data?.data?.breakdown ?? []
    if (breakdown.length) {
      const totalPaid = breakdown.reduce(
        (acc: number, b: { paid?: number }) => acc + (b.paid ?? 0),
        0,
      )
      const totalFree = breakdown.reduce(
        (acc: number, b: { free?: number }) => acc + (b.free ?? 0),
        0,
      )
      payingUsersBreakdown.value = [
        { label: 'Paid', value: totalPaid, color: '#3B82F6' },
        { label: 'Free', value: totalFree, color: '#E5E7EB' },
      ]
    }
  } catch (err) {
    console.error('Failed to load customers overview', err)
  } finally {
    loadingOverview.value = false
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

const selectUserFilter = (filter: string) => {
  activeUserFilter.value = filter
  showUserFilter.value = false
}

const selectDuration = (option: string) => {
  selectedDuration.value = option
  showDurationFilter.value = false
}

watch(
  () => searchQuery.value,
  () => {
    currentPage.value = 1
  },
)

watch(
  () => activeUserFilter.value,
  () => {
    currentPage.value = 1
    loadCustomers()
  },
)

watch(
  () => selectedDuration.value,
  () => {
    currentPage.value = 1
    loadCustomers()
  },
)

onMounted(() => {
  loadCustomersOverview()
  loadCustomers()
})
</script>
