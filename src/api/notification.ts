import api from '@/lib/api'
import type {
  ApiNotification,
  ApiNotificationListResponse,
  NotificationContextResponse,
  ApiResponse,
  MarkReadRequest,
  MarkReadResponse,
  NotificationStats,
} from '@/types/notification'

export const notificationService = {
  getNotifications: async (params = { page: 1, page_size: 50 }) => {
    return api.get<ApiResponse<ApiNotificationListResponse>>('/notifications/', {
      params,
    })
  },

  getNotificationById: async (id: string) => {
    return api.get<ApiResponse<ApiNotification>>(`/notifications/${id}`)
  },

  getNotificationContext: async (id: string) => {
    return api.get<ApiResponse<NotificationContextResponse>>(`/notifications/${id}/context`)
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`)
  },

  markAsRead: async (notificationIds: string[]): Promise<MarkReadResponse> => {
    const payload: MarkReadRequest = {
      notification_ids: notificationIds,
    }

    const { data } = await api.post<ApiResponse<MarkReadResponse>>(
      '/notifications/mark-read',
      payload,
    )

    return data.data
  },

  markAllAsRead: async (): Promise<MarkReadResponse> => {
    const { data } = await api.post<ApiResponse<MarkReadResponse>>('/notifications/mark-all-read')

    return data.data
  },

  getStats: async (): Promise<NotificationStats> => {
    const { data } = await api.get<ApiResponse<NotificationStats>>('/notifications/stats')

    return data.data
  },

  updateNotification: async (
    id: string,
    payload: Partial<ApiNotification>,
  ): Promise<ApiNotification> => {
    const { data } = await api.patch<ApiResponse<ApiNotification>>(`/notifications/${id}`, payload)

    return data.data
  },
}
