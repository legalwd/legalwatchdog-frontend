export type ProjectStatus = 'active' | 'paused' | 'completed'

export interface Project {
  id: string
  title: string
  description: string | null
  master_prompt?: string | null
  org_id: string
  created_at: string
  updated_at: string
  assigned_users: unknown
  is_active?: boolean
  is_deleted?: boolean
  jurisdictions_count?: number
  jurisdiction_count?: number
  sources_count?: number
  source_count?: number
  revisions_count?: number
  revision_count?: number
}

export interface ProjectStatsJurisdiction {
  id: string
  name: string
  change_count: number
  severity: 'Major' | 'Minor' | null
  last_change_at: string | null
}

export interface ProjectChangeItem {
  id?: string
  summary?: string
  title?: string
  name?: string
  description?: string
  change_summary?: string
}

export interface ProjectStats {
  change_count: number
  severity: 'Major' | 'Minor' | null
  last_change_at: string | null
  change_summary: string | null
  jurisdictions: ProjectStatsJurisdiction[]
  change_items: Array<ProjectChangeItem | string>
}

export interface CreateProjectPayload {
  title: string
  description?: string | null
  master_prompt?: string | null
  organization_id: string
}

export interface ProjectErrorResponse {
  response: {
    data: {
      detail: {
        loc: (string | number)[]
        msg: string
        type: string
      }[]
      message?: string
    }
  }
}

export interface UpdateProjectPayload {
  title?: string
  description?: string | null
  master_prompt?: string | null
  is_deleted?: boolean
}
