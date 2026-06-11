<template>
  <div class="min-h-screen bg-white">
    <main class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Dashboard</h1>
        <div class="flex items-center gap-6">
          <p class="text-sm">
            Total credits:
            <span class="font-semibold">{{ loading ? '—' : formatNumber(availableCredits) }}</span>
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

      <div
        v-if="error"
        class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- Stats Cards Row -->

      <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <RevenueCard
          :revenue="revenueTotal"
          :percent-change="revenuePercent"
          :data="revenueTrendData"
          :labels="revenueTrendLabels"
        />

        <StatCard
          title="New Users"
          :value="newUsers"
          :percent-change="newUsersPercentChange"
          icon="👥"
          :data="userGrowthData"
          :labels="userGrowthLabels"
        />

        <StatCard
          title="Total Users"
          :value="totalUsers"
          :percent-change="totalUsersPercentChange"
          icon="👤"
          :data="userGrowthData"
          :labels="userGrowthLabels"
        />

        <StatCard
          title="Active Users"
          :value="activeUsers"
          :percent-change="activeUsersPercentChange"
          icon="⚡"
          :data="userGrowthData"
          :labels="userGrowthLabels"
        />
      </div>

      <!-- Charts Row -->
      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PaymentPlansChart
          :datasets="paymentPlansData"
          :labels="paymentLabels.length ? paymentLabels : monthLabels"
        />
        <CreditConsumptionChart
          :data="creditData"
          :labels="creditLabels.length ? creditLabels : monthLabels"
          :total="creditTotal"
          :total-cost="creditCost"
          :total-requests="creditRequests"
          :percent-change="creditPercent"
        />
      </div>

      <!-- Users Table -->
      <NewUsersTable :users="users" :loading="loadingUsers" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { superadminDashboardService } from '@/api/super-admin'
import { superadminCustomersService } from '@/api/super-admin-customers'
import CreditConsumptionChart from '@/components/super-admin/CreditConsumptionChart.vue'
import NewUsersTable from '@/components/super-admin/NewUsersTable.vue'
import PaymentPlansChart from '@/components/super-admin/PaymentPlansChart.vue'
import RevenueCard from '@/components/super-admin/RevenueCard.vue'
import StatCard from '@/components/super-admin/StatCard.vue'

import Button from '../../components/ui/button/Button.vue'

interface ChartDataset {
  label: string
  data: number[]
  color: string
}

interface ApiCustomer {
  id: string | number
  name: string
  last_login?: string
  registration_date: string
  payment_status?: string | number
  last_active?: string
  activity_duration_days?: number
  credits_used?: number | null
  amount_spent?: number | null
  avatar_url?: string
}

interface MappedUser {
  id: string | number
  name: string
  avatar: string
  lastActive: string
  paymentStatus: string
  lastLogin: string
  registrationDate: string
  activityLength: string
  referrals: number
  creditUsed: number
  amountSpent: number
}

interface ApiResponse<T> {
  data?: {
    data?: T
  }
}

interface CustomersListResponse {
  customers?: ApiCustomer[]
}

// Component state
const loading = ref<boolean>(true)
const loadingUsers = ref<boolean>(true)
const error = ref<string>('')

const monthLabels = ref<string[]>([
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
])

// Dashboard values
const availableCredits = ref<number | null>(null)
const revenueTotal = ref<number>(0)
const revenuePercent = ref<number>(0)
const revenueTrendData = ref<number[]>([])
const revenueTrendLabels = ref<string[]>([])

const newUsers = ref<number>(0)
const totalUsers = ref<number>(0)
const activeUsers = ref<number>(0)

const userGrowthLabels = ref<string[]>([])
const userGrowthData = ref<number[]>([])
const creditCost = ref<number>(0)
const creditRequests = ref<number>(0)

const newUsersPercentChange = ref<number>(0)
const totalUsersPercentChange = ref<number>(0)
const activeUsersPercentChange = ref<number>(0)
// Payment plans
const paymentPlansData = ref<ChartDataset[]>([
  { label: 'Paid', data: [], color: '#3B82F6' },
  { label: 'Trialing', data: [], color: '#F59E0B' },
])

const toNumber = (v: unknown, fallback = 0) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}

const paymentLabels = ref<string[]>([])

// AI credits chart
const creditData = ref<number[]>([])
const creditLabels = ref<string[]>([])
const creditTotal = ref<number>(0)
const creditPercent = ref<number>(0)

// Users table
const users = ref<MappedUser[]>([])

// Helper functions
const formatNumber = (num: number | null | undefined): string => (num ?? 0).toLocaleString()

const formatMonthLabel = (ym: string): string => {
  // ym is "YYYY-MM"
  const [y, m] = (ym || '').split('-')
  const year = Number(y)
  const monthIndex = Number(m) - 1

  if (!year || monthIndex < 0 || monthIndex > 11) return ym

  const d = new Date(Date.UTC(year, monthIndex, 1))
  // "Dec" or "Dec 2025" (pick what you prefer)
  return d.toLocaleDateString('en-US', { month: 'short' })
  // return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

const computeActivityLength = (registrationDate: string): string => {
  try {
    const start = new Date(registrationDate)
    if (isNaN(start.getTime())) {
      return '0 days'
    }
    const diff = Math.abs(Date.now() - start.getTime())
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return `${days} days`
  } catch {
    return '0 days'
  }
}

const mapUser = (customer: ApiCustomer): MappedUser => {
  const lastLoginDate = customer.last_login || customer.registration_date

  return {
    id: customer.id,
    name: customer.name,
    avatar: customer.avatar_url
      ? ''
      : customer.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
    lastActive: customer.last_active
      ? formatDate(customer.last_active)
      : formatDate(customer.registration_date),
    paymentStatus: (customer.payment_status || '')
      .toString()
      .replace(/\b\w/g, (s: string) => s.toUpperCase()),
    lastLogin: formatDate(lastLoginDate),
    registrationDate: formatDate(customer.registration_date),
    activityLength: customer.activity_duration_days
      ? `${customer.activity_duration_days} days`
      : computeActivityLength(customer.registration_date),
    referrals: 0,
    creditUsed: customer.credits_used ?? 0,
    amountSpent: customer.amount_spent ?? 0,
  }
}

const loadUsers = async (): Promise<void> => {
  loadingUsers.value = true
  try {
    const res: ApiResponse<CustomersListResponse> = await superadminCustomersService.listCustomers({
      page: 1,
      limit: 10,
    })

    const data = res.data?.data
    if (data?.customers && Array.isArray(data.customers)) {
      users.value = data.customers.map(mapUser)

      users.value.sort((a, b) => {
        try {
          const dateA = new Date(a.lastLogin).getTime()
          const dateB = new Date(b.lastLogin).getTime()
          if (isNaN(dateA) || isNaN(dateB)) {
            return 0
          }
          return dateB - dateA
        } catch {
          return 0
        }
      })
    } else {
      users.value = []
    }
  } catch (err) {
    console.error('Failed to load users for dashboard table', err)
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}
const safePct = (current: number, prev: number) => {
  if (!prev) return 0
  return Number((((current - prev) / prev) * 100).toFixed(2))
}

const lastValue = (arr: number[]) => (arr.length ? (arr[arr.length - 1] ?? 0) : 0)

const loadDashboard = async (): Promise<void> => {
  loading.value = true
  error.value = ''

  try {
    const [overviewRes, revenueTrendRes, aiCreditsRes, paymentBreakdownRes] = await Promise.all([
      superadminDashboardService.getOverview(),
      superadminDashboardService.getRevenueTrend(),
      superadminDashboardService.getAiCreditsTrend(),
      superadminDashboardService.getPaymentBreakdown(),
    ])

    const overview = overviewRes.data?.data
    if (overview) {
      availableCredits.value = toNumber(overview.ai_credits?.total_tokens ?? 0, 0)

      creditTotal.value = toNumber(overview.ai_credits?.total_tokens ?? 0, 0)

      newUsers.value = toNumber(overview.users?.new_users ?? 0, 0)
      totalUsers.value = toNumber(overview.users?.total_users ?? 0, 0)
      activeUsers.value = toNumber(overview.users?.active_users ?? 0, 0)

      const growth = overview.users?.daily_growth ?? []
      userGrowthLabels.value = growth.map((g) =>
        new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      )
      userGrowthData.value = growth.map((g) => toNumber(g.new_users ?? 0, 0))

      const todayNewUsers = lastValue(userGrowthData.value)
      const prevNewUsers =
        userGrowthData.value.length >= 2
          ? (userGrowthData.value[userGrowthData.value.length - 2] ?? 0)
          : 0

      newUsersPercentChange.value = safePct(todayNewUsers, prevNewUsers)

      const totalYesterday = Math.max(0, (totalUsers.value ?? 0) - todayNewUsers)
      totalUsersPercentChange.value = safePct(totalUsers.value ?? 0, totalYesterday)

      const activeYesterday = Math.max(0, (activeUsers.value ?? 0) - todayNewUsers)
      activeUsersPercentChange.value = safePct(activeUsers.value ?? 0, activeYesterday)
    }

    const rTrend = revenueTrendRes.data?.data?.trend ?? []
    const sorted = [...rTrend].sort((a, b) => (a.month || '').localeCompare(b.month || ''))
    revenueTrendLabels.value = sorted.map((t) => formatMonthLabel(t.month))
    revenueTrendData.value = sorted.map((t) => toNumber(t.revenue ?? 0, 0))

    revenueTotal.value = revenueTrendData.value.reduce((sum, v) => sum + (v ?? 0), 0)

    if (revenueTrendData.value.length >= 2) {
      const last = revenueTrendData.value[revenueTrendData.value.length - 1] ?? 0
      const prev = revenueTrendData.value[revenueTrendData.value.length - 2] ?? 0
      revenuePercent.value = prev ? Number((((last - prev) / prev) * 100).toFixed(2)) : 0
    } else {
      revenuePercent.value = 0
    }

    const creditsTrend = aiCreditsRes.data?.data?.trend ?? []
    creditLabels.value = creditsTrend.map((t) => t.month)
    creditData.value = creditsTrend.map((t) => toNumber(t.tokens ?? 0, 0))

    if (!creditTotal.value && creditData.value.length) {
      creditTotal.value = creditData.value.reduce((a, b) => a + b, 0)
    }

    if (creditData.value.length >= 2) {
      const last = creditData.value[creditData.value.length - 1] ?? 0
      const prev = creditData.value[creditData.value.length - 2] ?? 0
      creditPercent.value = prev ? Math.round(((last - prev) / prev) * 100) : 0
    }

    const breakdown = paymentBreakdownRes.data?.data?.breakdown ?? []
    paymentLabels.value = breakdown.map((b) => formatMonthLabel(b.month))

    paymentPlansData.value = [
      { label: 'Paid', data: breakdown.map((b) => toNumber(b.paid ?? 0, 0)), color: '#3B82F6' },
      {
        label: 'Trialing',
        data: breakdown.map((b) => toNumber(b.trialing ?? 0, 0)),
        color: '#F59E0B',
      },
    ]
  } catch (err) {
    console.error('Failed to load super-admin dashboard', err)
    error.value = err instanceof Error ? err.message : 'Failed to load dashboard data.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
  loadUsers()
})
</script>
