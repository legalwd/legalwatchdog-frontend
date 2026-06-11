export interface ApiResponse<T = unknown> {
  status: string
  status_code: number
  message?: string
  data: T
}

export interface ApiNotification {
  notification_id: string
  user_id: string

  title: string
  message: string

  notification_type: string
  status: 'SENT' | 'FAILED' | 'PENDING' | string

  created_at: string
  sent_at?: string
  read_at?: string | null

  action_url?: string

  revision_id?: string | null
  source_id?: string | null
  organization_id?: string | null
  jurisdiction_id?: string | null
}

export interface ApiNotificationListResponse {
  notifications: ApiNotification[]
  total: number
  page: number
  page_size: number
  unread_count: number
}

export interface NotificationContextResponse {
  context: {
    project?: {
      id: string
      name?: string | null
    }

    source?: {
      id: string
      name?: string
      source_type?: string
      jurisdiction_id?: string | null
      url?: string
    }

    revision?: {
      id: string
      source_id: string
      ai_summary?: string
      ai_markdown_summary?: string
      scraped_at?: string
      was_change_detected?: boolean
    }

    change_diff?: {
      id: string
      revision_id?: string
    }
  } | null
  notification?: ApiNotification
}

export interface MarkReadRequest {
  notification_ids: string[]
}

export interface MarkReadResponse {
  count: number
}

export interface NotificationStats {
  total_notifications: number
  unread_count: number
  read_count: number
  by_type: Record<string, number>
  by_status: Record<string, number>
  recent_activity: {
    last_24_hours: number
    last_7_days: number
    last_30_days: number
  }
}

export interface Notification {
  notification_id: string
  iconType: 'regulatory' | 'alert'
  title: string
  message: string
  time: string
  severity: 'normal' | 'high'
  read: boolean
}
