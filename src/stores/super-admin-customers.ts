import type { AxiosError } from 'axios'
import { defineStore } from 'pinia'

import { superadminCustomersService } from '@/api/super-admin-customers'
import type {
  Customer,
  CustomerDetailResponse,
  CustomerActivityResponse,
} from '@/types/super-admin'

interface State {
  customers: Customer[]
  customerDetail: CustomerDetailResponse | null
  customerActivity: CustomerActivityResponse | null
  loading: boolean
  error: string | null
}

export const useSuperadminCustomersStore = defineStore('superadmin-customers', {
  state: (): State => ({
    customers: [],
    customerDetail: null,
    customerActivity: null,
    loading: false,
    error: null,
  }),

  actions: {
    setError(message: string | null) {
      this.error = message
    },

    async fetchCustomers(params?: { q?: string; page?: number; limit?: number }) {
      this.loading = true
      this.setError(null)
      try {
        const { data } = await superadminCustomersService.listCustomers(params)
        this.customers = data.data.customers
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        this.setError(err.response?.data?.message || 'Failed to load customers')
      } finally {
        this.loading = false
      }
    },

    async fetchCustomerDetail(customerId: string) {
      this.loading = true
      this.setError(null)
      try {
        const { data } = await superadminCustomersService.getCustomerDetail(customerId)
        this.customerDetail = data.data
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        this.setError(err.response?.data?.message || 'Failed to load customer detail')
      } finally {
        this.loading = false
      }
    },

    async fetchCustomerActivity(
      customerId: string,
      params?: { start_date?: string; end_date?: string },
    ) {
      this.loading = true
      this.setError(null)
      try {
        const { data } = await superadminCustomersService.getCustomerActivity(customerId, params)
        this.customerActivity = data.data
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        this.setError(err.response?.data?.message || 'Failed to load customer activity')
      } finally {
        this.loading = false
      }
    },
  },
})
