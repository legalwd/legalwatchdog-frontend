/* DASHBOARD */

export type RevenueTrendItem = {
  month: string
  revenue: number
}

export type DashboardOverview = {
  revenue: {
    total: number
    vs_last_month: number
    trend: RevenueTrendItem[]
  }
  users: {
    new_users: number
    total_users: number
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

export type RevenueTrendResponse = {
  trend: RevenueTrendItem[]
}

export type AiCreditsTrendItem = {
  month: string
  tokens: number
}

export type AiCreditsTrendResponse = {
  trend: AiCreditsTrendItem[]
}

export type PaymentBreakdownItem = {
  month: string
  free: number
  paid: number
}

export type PaymentBreakdownResponse = {
  breakdown: PaymentBreakdownItem[]
}

/* CUSTOMERS */

export type Customer = {
  id: string
  name: string
  email: string
  payment_status: string
  registration_date: string
  last_active: string
  credits_used: number
  amount_spent: number
}

export type CustomersListResponse = {
  customers: Customer[]
}

export type CustomerProfile = {
  id: string
  name: string
  email: string
  payment_status: string
  credits_used: number
  amount_spent: number
}

export type FeatureUsage = {
  feature: string
  credits_used: number
  usage_count: number
}

export type CustomerDetailResponse = {
  profile: CustomerProfile
  feature_usage: FeatureUsage[]
}

export type ActivityUsageItem = {
  date: string
  credits_used: number
  requests: number
}

export type CustomerActivityResponse = {
  user_id: string
  date_range: {
    start_date: string
    end_date: string
    days: number
  }
  feature_usage: ActivityUsageItem[]
}
