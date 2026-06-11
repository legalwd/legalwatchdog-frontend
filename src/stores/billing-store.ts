import type { AxiosError } from 'axios'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

import { billingService } from '@/api/billing'
import type {
  BillingErrorResponse,
  BillingHistoryEntry,
  BillingPlan,
  BillingSubscriptionStatus,
} from '@/types/billing'

import { useAuthStore } from './auth-store'
import { useOrganizationStore } from './organization-store'

interface State {
  billing: number
  account_id: string | null
  current_plan_id: string | null
  loading: boolean
  error: string | null
}

export const useBillingStore = defineStore('billing', {
  state: (): State => ({
    billing: 0,
    account_id: null,
    current_plan_id: null,
    loading: false,
    error: null,
  }),

  actions: {
    setError(message: string | null) {
      this.error = message
    },

    setLoading(value: boolean) {
      this.loading = value
    },

    async fetchPlans() {
      this.setError(null)
      this.setLoading(true)

      try {
        const res = await billingService.getPlans()

        return res.data.data as BillingPlan[]
      } catch (error) {
        this.setError((error as BillingErrorResponse).message)
      } finally {
        this.setLoading(false)
      }
    },

    async getOrganizationId() {
      const router = useRouter()
      const authStore = useAuthStore()
      const organizationStore = useOrganizationStore()

      let user = authStore.user
      if (!user) {
        user = await authStore.loadCurrentUser()
      }

      if (!user?.id) {
        this.setError('Could not determine user. Please log in again.')
        router.push({ name: 'login' })
        return null
      }

      if (!organizationStore.currentOrganizationId) {
        await organizationStore.fetchOrganizations(user.id)
      }

      if (!organizationStore.hasOrganizations) {
        this.setError('No organization found')
        router.push({ name: 'dashboard' })
        return null
      }

      if (!this.account_id) {
        if (!organizationStore.currentOrganizationId) return null
        const hasAccount = await this.hasBillingAccount(organizationStore.currentOrganizationId)

        if (!hasAccount) {
          await this.createBillingAccount(organizationStore.currentOrganizationId)
        }
      }

      return organizationStore.currentOrganizationId
    },

    async hasBillingAccount(organizationId: string) {
      this.setError(null)
      try {
        const res = await billingService.getOrganizationBillingAccount(organizationId)

        if (res.status === 200) {
          this.account_id = res.data.data.id
          return true
        }
      } catch (error) {
        if ((error as AxiosError).status === 404) {
          return false
        } else {
          return false
        }
      }

      return false
    },

    async createBillingAccount(organizationId: string) {
      this.setError(null)
      try {
        const res = await billingService.createOrganizationBillingAccount(organizationId)

        if (res.status === 201) {
          this.account_id = res.data.data.id
        }
      } catch (error) {
        const err = (error as AxiosError).response?.data as BillingErrorResponse
        if (err.status_code === 403) {
          this.setError('You cannot access billing information for this organization')
          return
        }
        this.setError(err.message)
      }
    },

    async getSubscriptionStatus() {
      this.setError(null)
      const orgId = await this.getOrganizationId()

      if (!orgId) return
      try {
        const res = await billingService.getOrganizationSubscriptionStatus(orgId)

        const status = res.data.data as BillingSubscriptionStatus

        if (status.current_plan) {
          this.current_plan_id = status.current_plan.id
        }
        return status
      } catch (error) {
        const err = (error as AxiosError).response?.data as BillingErrorResponse
        if (err.status_code === 403) {
          this.setError('You cannot access billing information for this organization')
          return
        }
        this.setError(err.message)
      }
    },

    async checkoutPlan(plan_id: string) {
      this.setError(null)
      const orgId = await this.getOrganizationId()

      if (!orgId) return

      try {
        const res = await billingService.checkout(orgId, plan_id)

        return res.data.data.checkout_url
      } catch (error) {
        const err = (error as AxiosError).response?.data as BillingErrorResponse
        this.setError(err.message)
      }
    },

    async getPaymentHistory() {
      this.setError(null)
      const orgId = await this.getOrganizationId()

      if (!orgId) return

      try {
        const res = await billingService.getOrganizationPaymentHistory(orgId)

        return res.data.data as BillingHistoryEntry[]
      } catch (error) {
        const err = (error as AxiosError).response?.data as BillingErrorResponse
        if (err.status_code === 403) {
          this.setError('You cannot access billing information for this organization')
          return
        }
        this.setError(err.message)
      }
    },

    async cancelSubscription() {
      this.setError(null)
      this.setLoading(true)
      const orgId = await this.getOrganizationId()

      if (!orgId) return
      try {
        const res = await billingService.cancelOrganizationSubscriptionAtPeriodEnd(orgId)

        return res.data.data
      } catch (error) {
        const err = (error as AxiosError).response?.data as BillingErrorResponse
        this.setError(err.message)
      } finally {
        this.setLoading(false)
      }
    },

    async changeSubscriptionPlan(plan_id: string) {
      this.setError(null)
      const orgId = await this.getOrganizationId()

      if (!orgId) return
      try {
        const res = await billingService.changeOrganizationSubscription(orgId, plan_id)

        return res.data.data
      } catch (error) {
        const err = (error as AxiosError).response?.data as BillingErrorResponse
        this.setError(err.message)
      }
    },

    async handlePlanChange(plan_id: string) {
      this.setError(null)
      this.setLoading(true)

      try {
        await this.getSubscriptionStatus()

        if (this.current_plan_id) {
          // User has an active subscription, so change it
          return await this.changeSubscriptionPlan(plan_id)
        } else {
          // User has no active subscription, proceed to checkout
          return await this.checkoutPlan(plan_id)
        }
      } finally {
        this.setLoading(false)
      }
    },
  },
})
