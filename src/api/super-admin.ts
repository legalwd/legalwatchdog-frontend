import api from '@/lib/api'

type ApiResponse<T> = {
  status?: string
  status_code?: number
  message?: string
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    total_pages?: number
  }
}

/* Overview */

type RevenueTrendItem = {
  month: string
  revenue: number
}
type DailyGrowthItem = {
  date: string
  new_users: number
}

type DashboardOverview = {
  revenue: {
    total: number
    vs_last_month: number
    trend: RevenueTrendItem[]
  }
  users: {
    active_users: number
    new_users: number
    total_users: number
    activity_rate: number
    conversion_rate: number
    daily_growth: DailyGrowthItem[]
  }
  ai_credits: {
    total_tokens: number
  }
  parallel_ai: {
    total_requests: number
    total_cost: string
  }
  payment_breakdown: {
    free: number
    paid: number
  }
  date_range: {
    start_date: string
    end_date: string
    days: number
  }
}

/* Revenue Trend */

type RevenueTrendResponse = {
  trend: RevenueTrendItem[]
}

/* AI Credits Trend */

type AiCreditsTrendItem = {
  month: string
  tokens: number
}

type AiCreditsTrendResponse = {
  trend: AiCreditsTrendItem[]
}

/* Payment Breakdown */

type PaymentBreakdownItem = {
  month: string
  free: number
  paid: number
  trialing: number
}

type PaymentBreakdownResponse = {
  breakdown: PaymentBreakdownItem[]
}

type SuperadminOrganization = {
  id?: string
  organization_id?: string
  organizationId?: string
  name?: string
  owner_name?: string
  owner_email?: string
  customer_name?: string
  owner?: {
    id?: string
    name?: string
    email?: string
  }
  user?: {
    id?: string
    name?: string
    email?: string
  }
}

type SuperadminOrganizationsResponse = {
  organizations?: SuperadminOrganization[]
  organisations?: SuperadminOrganization[]
}

/* Service */

export const superadminDashboardService = {
  getOverview: () => api.get<ApiResponse<DashboardOverview>>('/superadmin/dashboard/overview'),

  getRevenueTrend: () =>
    api.get<ApiResponse<RevenueTrendResponse>>('/superadmin/dashboard/revenue-trend'),

  getAiCreditsTrend: () =>
    api.get<ApiResponse<AiCreditsTrendResponse>>('/superadmin/dashboard/ai-credits-trend'),

  getPaymentBreakdown: () =>
    api.get<ApiResponse<PaymentBreakdownResponse>>('/superadmin/dashboard/payment-breakdown'),
}

export const superadminOrganizationsService = {
  listOrganizations: (params?: {
    page?: number
    limit?: number
    is_approved?: boolean
    is_active?: boolean
    company_size?: string
    industry?: string
    search?: string
    created_from?: string
    created_to?: string
    sort_by?: 'created_at' | 'updated_at' | 'name' | 'owner_email' | 'owner_created_at'
    sort_order?: 'asc' | 'desc'
  }) =>
    api.get<ApiResponse<SuperadminOrganizationsResponse>>('/superadmin/organizations', { params }),
}
