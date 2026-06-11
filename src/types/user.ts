export interface UserProfile {
  id: string
  user_id?: string
  name?: string
  first_name?: string
  last_name?: string
  email: string
  role?: string
  phone_number?: string
  avatar_url?: string
  profile_picture_url?: string
  is_superadmin?: boolean
  is_super_admin?: boolean
  is_verified?: boolean
  is_active?: boolean
  created_at?: string
  updated_at?: string
  organizations?: UserOrganization[]
}

export interface UserOrganization {
  organization_id: string
  name: string
  industry?: string
  role?: string
  is_active?: boolean
}
