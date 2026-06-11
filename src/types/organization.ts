export interface Organization {
  id: string
  name: string
  email?: string | undefined
  industry?: string | undefined
  job_title?: string | undefined
  org_type?: string | undefined
  company_size?: string | undefined
  country?: string | undefined
  is_active?: boolean | undefined
  user_role?: string | undefined
  project_count?: number | undefined
  created_at?: string | undefined
  updated_at?: string | undefined
}

export interface RawOrganization {
  organization_id?: string
  organizationId?: string
  id?: string
  name: string
  email?: string | undefined
  industry?: string | undefined
  job_title?: string | undefined
  org_type?: string | undefined
  company_size?: string | undefined
  country?: string | undefined
  location?: string | null
  plan?: string | null
  logo_url?: string | null
  is_active?: boolean | undefined
  user_role?: string | undefined
  role?: string | undefined
  project_count?: number | undefined
  projects_count?: number | undefined
  projects?: unknown[] | undefined
  created_at?: string | undefined
  updated_at?: string | undefined
}

export interface OrganizationSettings {
  visibility?: string
  require_strong_passwords?: boolean
  require_2fa?: boolean
  allow_external_sharing?: boolean
  audit_logging_enabled?: boolean
  project_default_privacy?: string
}

export interface OrganizationBillingInfo {
  billing_account_id?: string | null
  status?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  current_price_id?: string | null
  cancel_at_period_end?: boolean | null
  trial_starts_at?: string | null
  trial_ends_at?: string | null
  current_period_start?: string | null
  current_period_end?: string | null
  next_billing_at?: string | null
  current_plan?: unknown | null
}

export interface UserOrganizationDetails {
  id: string
  name: string
  email?: string | null
  industry?: string | null
  job_title?: string | null
  org_type?: string | null
  company_size?: string | null
  country?: string | null
  location?: string | null
  plan?: string | null
  logo_url?: string | null
  settings?: OrganizationSettings
  billing_info?: OrganizationBillingInfo
  is_active?: boolean
  projects_count?: number
  created_at?: string
  updated_at?: string
}

export interface CreateOrganizationPayload {
  company_size: string
  country: string
  email: string
  industry: string
  job_title: string
  name: string
  org_type: string
}

export interface UpdateOrganizationPayload {
  name?: string
  email?: string
  industry?: string
  job_title?: string
  org_type?: string
  company_size?: string
  country?: string
  location?: string
  is_active?: boolean
}

export interface OrganizationErrorResponse {
  response?: {
    data?: {
      detail?: {
        loc: (string | number)[]
        msg: string
        type: string
      }[]
      message?: string
    }
  }
}

export interface InviteMemberPayload {
  invited_email: string
  role_name: string
}

export interface OrganizationMember {
  user_id: string
  email: string
  name: string
  avatar_url?: string | null
  is_active?: boolean
  is_verified?: boolean
  role: string
  role_id?: string
  title?: string | null
  department?: string | null
  membership_active?: boolean
  joined_at?: string
  created_at?: string
}
