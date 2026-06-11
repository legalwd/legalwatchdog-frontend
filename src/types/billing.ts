export interface BillingErrorResponse {
  error: string
  status_code: number
  message: string
}

export interface BillingPlan {
  id: string
  code: string
  tier: string
  label: string
  interval: 'month' | 'year'
  currency: string
  amount: number
  description: string
  features: string[]
  is_most_popular: boolean
  is_active: boolean
}

export interface BillingSubscriptionStatus {
  billing_account_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: string
  cancel_at_period_end: boolean
  trial_starts_at: Date | null
  trial_ends_at: Date | null
  current_period_start: Date | null
  current_period_end: Date | null
  next_billing_at: Date | null
  current_plan: BillingPlan
}

export interface BillingHistoryEntry {
  id: string
  billing_account_id: string
  amount_due: number
  amount_paid: number
  currency: string
  status: string
  stripe_invoice_id: string
  hosted_invoice_url: string
  invoice_pdf_url: string
  plan_label: string
  plan_code: string
  plan_interval: 'month' | 'year'
  created_at: Date
}
