import api from '@/lib/api'

type ApiResponse<T> = {
  status?: string
  status_code?: number
  message?: string
  data: T
  meta?: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

/* Customers */

export type Customer = {
  id: string
  name: string
  email: string
  payment_status: string
  registration_date: string
  last_active: string
  credits_used: number
  amount_spent: number
  avatar_url?: string
}

type CustomersListResponse = {
  customers: Customer[]
}

/* Customer Detail */

type CustomerProfile = {
  id: string
  name: string
  email: string
  payment_status: string
  credits_used: number
  amount_spent: number
  registration_date: string
  last_active: string | null
  avatar_url?: string
  is_approved?: boolean
}

type FeatureUsage = {
  feature: string
  credits_used: number
  usage_count: number
}

type CustomerDetailResponse = {
  profile: CustomerProfile
  feature_usage: FeatureUsage[]
}

/* Customer Activity */

type ActivityUsageItem = {
  date: string
  credits_used: number
  requests: number
}

type CustomerActivityResponse = {
  user_id: string
  date_range: {
    start_date: string
    end_date: string
    days: number
  }
  feature_usage: ActivityUsageItem[]
}

/* Service */

export const superadminCustomersService = {
  listCustomers: (params?: { q?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<CustomersListResponse>>('/superadmin/customers', { params }),

  getCustomerDetail: (customer_id: string) =>
    api.get<ApiResponse<CustomerDetailResponse>>(`/superadmin/customers/${customer_id}`),

  getCustomerActivity: (customer_id: string, params?: { start_date?: string; end_date?: string }) =>
    api.get<ApiResponse<CustomerActivityResponse>>(
      `/superadmin/customers/${customer_id}/activity`,
      { params },
    ),

  activateCustomer: (user_id: string) => api.patch(`/superadmin/customers/${user_id}/activate`),

  deactivateCustomer: (user_id: string) => api.patch(`/superadmin/customers/${user_id}/deactivate`),
}
