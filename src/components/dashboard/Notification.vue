<script setup lang="ts">
import type { AxiosError } from 'axios'
import { Bell } from 'lucide-vue-next'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { notificationService } from '@/api/notification'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type {
  Notification,
  ApiNotification,
  NotificationContextResponse,
} from '@/types/notification'

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

const { confirm: openConfirm } = useConfirmDialog()

const props = defineProps<{ unreadCount?: number }>()
const emit = defineEmits<{ (e: 'update:unreadCount', value: number): void }>()

const localUnreadCount = ref(props.unreadCount ?? 0)
const notifications = ref<Notification[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

watch(localUnreadCount, (val) => emit('update:unreadCount', val))
watch(
  () => props.unreadCount,
  (val) => {
    if (val !== undefined && val !== localUnreadCount.value) {
      localUnreadCount.value = val
    }
  },
)

const mapToUI = (api: ApiNotification): Notification => ({
  notification_id: api.notification_id,
  iconType:
    api.notification_type.toLowerCase().includes('alert') ||
    api.notification_type.toLowerCase().includes('change')
      ? 'alert'
      : 'regulatory',
  title: api.title || 'No title',
  message: api.message || 'No content',
  time: api.created_at
    ? new Date(api.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now',
  severity: api.status === 'PENDING' ? 'high' : 'normal',
  read: api.read_at !== null,
})

const fetchNotifications = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await notificationService.getNotifications()
    if (data.status_code !== 200) throw new Error(data.message || 'Failed')

    const res = data.data
    localUnreadCount.value = res.unread_count
    emit('update:unreadCount', res.unread_count)
    notifications.value = res.notifications.map(mapToUI)
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>
    error.value =
      axiosErr.response?.data?.message ?? axiosErr.message ?? 'Failed to load notifications'
  } finally {
    loading.value = false
  }
}
const router = useRouter()

const handleNotificationClick = async (id: string, index: number) => {
  const item = notifications.value[index]
  if (!item) return

  try {
    const { data } = await notificationService.getNotificationContext(id)
    if (data.status_code !== 200) throw new Error()

    // The backend returns a `context` blob. Navigate based on what it contains.
    const resp = data.data as NotificationContextResponse
    const ctx = resp.context ?? null
    const notification = resp.notification ?? null

    const actionUrl = notification?.action_url ?? null

    if (actionUrl) {
      // Parse the internal path from the action URL
      try {
        const url = new URL(actionUrl)
        const pathname = url.pathname
        const query = Object.fromEntries(url.searchParams)

        // Extract route parts from pathname
        // Expected format: /dashboard/[resource]/[id]
        const parts = pathname.split('/').filter(Boolean)
        const dashboardIdx = parts.indexOf('dashboard')

        if (dashboardIdx !== -1) {
          const resource = parts[dashboardIdx + 1]
          const id = parts[dashboardIdx + 2]

          if (resource && id) {
            // Map resource type to route name
            let routeName = ''
            if (resource === 'jurisdictions') {
              routeName = 'jurisdiction-detail'
            } else if (resource === 'projects') {
              routeName = 'project-detail'
            } else if (resource === 'sources') {
              routeName = 'source-details'
            } else if (resource === 'revisions') {
              routeName = 'revision-details'
            }

            if (routeName) {
              router.push({
                name: routeName,
                params: { id },
                query: query,
              })
            } else {
              window.location.href = actionUrl
            }
          } else {
            window.location.href = actionUrl
          }
        } else {
          window.location.href = actionUrl
        }
      } catch {
        window.location.href = actionUrl
      }
    } else if (ctx) {
      if (ctx.project) {
        router.push({ name: 'project-details', params: { id: ctx.project.id } })
      } else if (ctx.source) {
        router.push({ name: 'source-details', params: { id: ctx.source.id } })
      } else if (ctx.revision) {
        router.push({ name: 'revision-details', params: { id: ctx.revision.id } })
      } else if (ctx.change_diff) {
        router.push({ name: 'change-diff', params: { id: ctx.change_diff.id } })
      } else {
        // fallback to a generic notification details page
        router.push({ name: 'notification-detail', params: { id } })
      }
    } else {
      toast.info('This notification has no linked page yet')
    }

    if (!item.read) {
      await notificationService.markAsRead([id])
      item.read = true
      localUnreadCount.value = Math.max(0, localUnreadCount.value - 1)
      emit('update:unreadCount', localUnreadCount.value)
    }
  } catch (e) {
    console.error(e)
    toast.error('Could not open notification')
  }
}

const deleteNotification = async (id: string, index: number) => {
  const item = notifications.value[index]
  if (!item) return

  openConfirm({
    title: 'Delete notification?',
    description: 'This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    async onConfirm() {
      try {
        await notificationService.deleteNotification(id)
        notifications.value.splice(index, 1)

        if (!item.read) {
          localUnreadCount.value = Math.max(0, localUnreadCount.value - 1)
          emit('update:unreadCount', localUnreadCount.value)
        }

        toast.success('Notification deleted')
      } catch {
        toast.error('Failed to delete notification')
      }
    },
  })
}

const markAllAsRead = async () => {
  if (localUnreadCount.value === 0) return

  try {
    const { count } = await notificationService.markAllAsRead()

    notifications.value.forEach((n) => (n.read = true))
    localUnreadCount.value = 0
    emit('update:unreadCount', 0)

    toast.success(`Marked ${count} notifications as read`)
  } catch {
    toast.error('Failed to mark all as read')
  }
}

onMounted(fetchNotifications)
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>
    <PopoverContent
      class="mr-4 max-h-150 w-76 overflow-y-auto border p-4 shadow-lg sm:w-86 md:w-100"
    >
      <div class="mb-4 flex items-center justify-between border-b pb-4">
        <h3 class="font-semibold">Notifications</h3>
        <button
          v-if="localUnreadCount > 0"
          class="text-sm"
          :class="[
            notifications.length === 0
              ? 'text-muted/80 cursor-not-allowed'
              : 'text-blue-500 transition hover:underline',
          ]"
          :disabled="notifications.length === 0"
          @click="markAllAsRead"
        >
          Mark all as read
        </button>
      </div>
      <div v-if="loading" class="text-muted py-8 text-center text-sm">Loading...</div>
      <div v-else-if="error" class="text-error py-8 text-center text-sm">{{ error }}</div>
      <div v-else-if="notifications.length === 0" class="text-muted py-12 text-center">
        <Bell class="mx-auto mb-4 h-12 w-12" />
        <p class="text-sm font-medium">No notifications yet</p>
      </div>

      <ul v-else class="space-y-4">
        <li
          v-for="(item, index) in notifications"
          :key="item.notification_id"
          class="group relative cursor-pointer rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-200"
          @click="handleNotificationClick(item.notification_id, index)"
        >
          <div class="mr-4 flex items-start gap-3">
            <div
              class="mt-2 h-2 w-2 shrink-0 rounded-full transition-colors"
              :class="{ 'bg-red-500': !item.read, 'bg-green-500': item.read }"
            ></div>

            <div class="min-w-0 flex-1">
              <p class="text-foreground truncate font-medium">{{ item.title }}</p>
              <p class="mt-1 line-clamp-2 text-sm">{{ item.message }}</p>
              <p class="mt-2 text-xs">{{ item.time }}</p>
            </div>

            <button
              class="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
              aria-label="Delete"
              @click.stop="deleteNotification(item.notification_id, index)"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </li>
      </ul>
    </PopoverContent>
  </Popover>
</template>
