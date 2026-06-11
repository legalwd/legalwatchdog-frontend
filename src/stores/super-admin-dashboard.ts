import type { AxiosError } from 'axios'
import { defineStore } from 'pinia'

import { superadminDashboardService } from '@/api/super-admin'
import type {
  DashboardOverview,
  RevenueTrendResponse,
  AiCreditsTrendResponse,
  PaymentBreakdownResponse,
} from '@/types/super-admin'

interface State {
  overview: DashboardOverview | null
  revenueTrend: RevenueTrendResponse | null
  aiCreditsTrend: AiCreditsTrendResponse | null
  paymentBreakdown: PaymentBreakdownResponse | null
  loading: boolean
  error: string | null
}

export const useSuperadminDashboardStore = defineStore('superadmin-dashboard', {
  state: (): State => ({
    overview: null,
    revenueTrend: null,
    aiCreditsTrend: null,
    paymentBreakdown: null,
    loading: false,
    error: null,
  }),

  actions: {
    setError(message: string | null) {
      this.error = message
    },

    async fetchOverview() {
      this.loading = true
      this.setError(null)
      try {
        const { data } = await superadminDashboardService.getOverview()
        this.overview = data.data
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        this.setError(err.response?.data?.message || 'Failed to load overview')
      } finally {
        this.loading = false
      }
    },

    async fetchRevenueTrend() {
      this.loading = true
      try {
        const { data } = await superadminDashboardService.getRevenueTrend()
        this.revenueTrend = data.data
      } finally {
        this.loading = false
      }
    },

    async fetchAiCreditsTrend() {
      this.loading = true
      try {
        const { data } = await superadminDashboardService.getAiCreditsTrend()
        this.aiCreditsTrend = data.data
      } finally {
        this.loading = false
      }
    },

    async fetchPaymentBreakdown() {
      this.loading = true
      try {
        const { data } = await superadminDashboardService.getPaymentBreakdown()
        this.paymentBreakdown = data.data
      } finally {
        this.loading = false
      }
    },
  },
})
