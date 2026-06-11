import axios, { AxiosHeaders } from 'axios'
import type { AxiosRequestConfig } from 'axios'

import { API_BASE_URL } from '@/lib/config'
import { validateResponse } from '@/lib/response-validation'
import themedSwal from '@/lib/swal'
import getRouter from '@/router/instance'
import { useAuthStore } from '@/stores/auth-store'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
})

type RetryableAxiosRequestConfig = AxiosRequestConfig & { _retry?: boolean }

api.interceptors.request.use(
  (config) => {
    const auth = useAuthStore()
    const token = auth.accessToken

    if (token) {
      const headers = AxiosHeaders.from(config.headers ?? {})
      if (!headers.get('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      config.headers = headers
    }
    return config
  },
  (error) => Promise.reject(error),
)

let isSessionExpiredAlertActive = false
let refreshPromise: Promise<string> | null = null

const showSessionExpiredAlert = () => {
  if (isSessionExpiredAlertActive) return
  isSessionExpiredAlertActive = true
  void themedSwal
    .fire({
      title: 'Session timed out',
      text: 'Your session timed out. Please log in again to continue.',
      icon: 'warning',
      confirmButtonText: 'Login again',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: true,
      showCancelButton: false,
    })
    .finally(() => {
      isSessionExpiredAlertActive = false
      if (typeof window !== 'undefined') {
        const redirectPath =
          window.location.pathname + window.location.search + window.location.hash
        void getRouter().push({ name: 'login', query: { redirect: redirectPath } })
      }
    })
}

api.interceptors.response.use(
  (res) => {
    // Validate all successful responses to catch backend drift
    try {
      validateResponse(res)
    } catch (validationError) {
      // Log validation errors in development but don't break the flow
      if (import.meta.env.DEV) {
        console.error('[API] Response validation error:', validationError)
      }
    }
    return res
  },
  async (error) => {
    const status = error.response?.status
    const originalRequest = error.config as RetryableAxiosRequestConfig
    const isRefreshRequest = originalRequest?.url?.includes('/auth/token/refresh')
    const errorCode = error.response?.data?.error_code

    if (errorCode === 'ACCOUNT_PENDING_APPROVAL') {
      const auth = useAuthStore()
      auth.setAccountPendingApproval(true, error.response?.data?.message)
      if (typeof window !== 'undefined') {
        const isAppRoute = window.location.pathname.startsWith('/app')
        if (isAppRoute) {
          const router = getRouter()
          if (router.currentRoute.value.name !== 'account-pending-approval') {
            void router.push({ name: 'account-pending-approval' })
          }
        }
      }
      return Promise.reject(error)
    }

    if (status === 401) {
      const auth = useAuthStore()
      const hasRefreshToken = !!auth.refreshToken
      const logAuth = (...args: unknown[]) => {
        if (import.meta.env.DEV) console.warn('[auth]', ...args)
      }

      if (hasRefreshToken && !originalRequest?._retry && !isRefreshRequest) {
        if (!refreshPromise) {
          logAuth('401 -> attempting refresh', originalRequest?.url)
          refreshPromise = auth
            .refreshTokens()
            .catch((refreshError) => {
              logAuth('refresh failed', refreshError)
              throw refreshError
            })
            .finally(() => {
              refreshPromise = null
            })
        }

        try {
          const newAccessToken = await refreshPromise
          originalRequest._retry = true
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          logAuth('refresh rejected, clearing auth')
          auth.clearAuthState()
          showSessionExpiredAlert()
          return Promise.reject(refreshError)
        }
      }

      if (!hasRefreshToken) {
        logAuth('401 with no refresh token available', originalRequest?.url)
      }

      auth.clearAuthState()
      showSessionExpiredAlert()
    }
    return Promise.reject(error)
  },
)

export default api
