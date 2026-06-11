import { defineStore } from 'pinia'

import { authService } from '@/api/auth'
import { userService } from '@/api/user'
import { useBillingStore } from '@/stores/billing-store'
import { useInvitationStore } from '@/stores/invitation-store'
import { useJurisdictionStore } from '@/stores/jurisdiction-store'
import { useOrganizationStore } from '@/stores/organization-store'
import { useProjectStore } from '@/stores/project-store'
import { useSourceStore } from '@/stores/source-store'
import { useSuperadminCustomersStore } from '@/stores/super-admin-customers'
import { useSuperadminDashboardStore } from '@/stores/super-admin-dashboard'
import { useTicketStore } from '@/stores/ticket-store'
import type {
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  ResendOtpPayload,
  VerifyOTPPayload,
  PasswordResetRequestPayload,
  PasswordResetVerifyPayload,
  PasswordResetConfirmPayload,
  PasswordResetVerifyResponse,
  PasswordResetConfirmResponse,
  VerifyOtpResponse,
} from '@/types/auth'
import type { UserProfile } from '@/types/user'

interface Organisation {
  id: string
  name: string
  created_at: string
}

type User = UserProfile & {
  organisation_id?: string
}

interface State {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  email: string | null
  organisation: Organisation | null
  accountPendingApproval: boolean
  pendingApprovalMessage: string | null
  otpPurpose: 'signup' | 'password-reset' | null
  resetToken: string | null
  signupDraft: SignupDraft | null
  resetPasswordDraft: ResetPasswordDraft | null
  rememberMePreference: boolean
  guestToken: string | null
  isGuest: boolean
}

interface ApiTokenData {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  user?: User
}

interface LoginApiResponse {
  status: string
  status_code: number
  message: string
  data: ApiTokenData
}

interface ResendOtpApiResponse {
  status?: string
  message?: string
  status_code?: number
}

interface SignupDraft {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface ResetPasswordDraft {
  newPassword: string
  confirmPassword: string
}

const TOKEN_KEY = 'lwd_access_token'
const REFRESH_TOKEN_KEY = 'lwd_refresh_token'
const COOKIE_REFRESH_KEY = 'lwd_request_token'
const EMAIL_KEY = 'lwd_user_email'
const REMEMBER_ME_KEY = 'lwd_remember_me'
const GUEST_TOKEN_KEY = 'lwd_guest_token'
const IS_GUEST_KEY = 'lwd_is_guest'

const clearCookie = (key: string) => {
  if (typeof document === 'undefined') return
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

const clearStorageByPrefix = (storage: Storage, prefixes: string[]) => {
  const keys: string[] = []
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i)
    if (!key) continue
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      keys.push(key)
    }
  }
  keys.forEach((key) => storage.removeItem(key))
}

const clearAppStorage = () => {
  if (typeof window === 'undefined') return
  try {
    clearStorageByPrefix(localStorage, ['lwd', 'archived_jurisdiction'])
    clearStorageByPrefix(sessionStorage, ['lwd', 'archived_jurisdiction'])
  } catch {
    // Ignore storage errors
  }
  clearCookie(COOKIE_REFRESH_KEY)
}

const getCookieValue = (key: string) => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`))
  return match && match[1] ? decodeURIComponent(match[1]) : null
}

const getStoredValue = (key: string, cookieKey?: string) =>
  localStorage.getItem(key) ??
  sessionStorage.getItem(key) ??
  getCookieValue(String(cookieKey ?? key))

const clearStoredValue = (key: string) => {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

const setStoredValue = (key: string, value: string, persist = true) => {
  clearStoredValue(key)
  const storage = persist ? localStorage : sessionStorage
  storage.setItem(key, value)
}

const getStoredRememberPreference = () => {
  const stored =
    localStorage.getItem(REMEMBER_ME_KEY) ?? sessionStorage.getItem(REMEMBER_ME_KEY) ?? 'false'
  return stored === 'true'
}

const setStoredRememberPreference = (remember: boolean) => {
  localStorage.setItem(REMEMBER_ME_KEY, String(remember))
  sessionStorage.setItem(REMEMBER_ME_KEY, String(remember))
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    accessToken: import.meta.env.SSR ? null : getStoredValue(TOKEN_KEY),
    refreshToken: import.meta.env.SSR
      ? null
      : getStoredValue(REFRESH_TOKEN_KEY, COOKIE_REFRESH_KEY),
    user: null,
    email: import.meta.env.SSR ? null : getStoredValue(EMAIL_KEY),
    organisation: null,
    accountPendingApproval: false,
    pendingApprovalMessage: null,
    otpPurpose: null,
    resetToken: null,
    signupDraft: null,
    guestToken: import.meta.env.SSR ? null : getStoredValue(GUEST_TOKEN_KEY),
    isGuest: import.meta.env.SSR ? false : getStoredValue(IS_GUEST_KEY) === 'true',
    resetPasswordDraft: null,
    rememberMePreference: import.meta.env.SSR ? false : getStoredRememberPreference(),
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    setAccessToken(token: string | null, persist?: boolean) {
      const shouldPersist = persist ?? this.rememberMePreference ?? true
      this.accessToken = token
      if (token) {
        setStoredValue(TOKEN_KEY, token, shouldPersist)
      } else {
        clearStoredValue(TOKEN_KEY)
      }
    },

    setRefreshToken(token: string | null, persist?: boolean) {
      const shouldPersist = persist ?? this.rememberMePreference ?? true
      this.refreshToken = token
      if (token) {
        setStoredValue(REFRESH_TOKEN_KEY, token, shouldPersist)
      } else {
        clearStoredValue(REFRESH_TOKEN_KEY)
      }
    },

    setUserEmail(email: string | null, persist?: boolean) {
      const shouldPersist = persist ?? this.rememberMePreference ?? true
      this.email = email
      if (email) {
        setStoredValue(EMAIL_KEY, email, shouldPersist)
      } else {
        clearStoredValue(EMAIL_KEY)
      }
    },

    setRememberPreference(rememberMe: boolean) {
      this.rememberMePreference = rememberMe
      setStoredRememberPreference(rememberMe)
    },

    setOtpPurpose(purpose: 'signup' | 'password-reset' | null) {
      this.otpPurpose = purpose
    },

    setResetToken(token: string | null) {
      this.resetToken = token
    },

    setAccountPendingApproval(pending: boolean, message?: string | null) {
      this.accountPendingApproval = pending
      this.pendingApprovalMessage = pending ? (message ?? this.pendingApprovalMessage) : null
    },

    setSignupDraft(draft: SignupDraft | null) {
      this.signupDraft = draft
    },

    clearSignupDraft() {
      this.signupDraft = null
    },

    setResetPasswordDraft(draft: ResetPasswordDraft | null) {
      this.resetPasswordDraft = draft
    },

    clearResetPasswordDraft() {
      this.resetPasswordDraft = null
    },

    setGuestToken(token: string | null) {
      this.guestToken = token
      if (token) {
        setStoredValue(GUEST_TOKEN_KEY, token, false) // Session storage only for guest tokens
      } else {
        clearStoredValue(GUEST_TOKEN_KEY)
      }
    },

    setGuestMode(isGuest: boolean) {
      this.isGuest = isGuest
      if (isGuest) {
        setStoredValue(IS_GUEST_KEY, 'true', false) // Session storage only
      } else {
        clearStoredValue(IS_GUEST_KEY)
      }
    },

    clearAuthState() {
      this.email = null
      this.user = null
      this.organisation = null
      this.accessToken = null
      this.refreshToken = null
      this.accountPendingApproval = false
      this.pendingApprovalMessage = null
      this.otpPurpose = null
      this.resetToken = null
      this.signupDraft = null
      this.resetPasswordDraft = null
      this.guestToken = null
      this.isGuest = false
      clearStoredValue(TOKEN_KEY)
      clearStoredValue(REFRESH_TOKEN_KEY)
      clearStoredValue(EMAIL_KEY)
      clearStoredValue(GUEST_TOKEN_KEY)
      clearStoredValue(IS_GUEST_KEY)
      clearAppStorage()

      useOrganizationStore().$reset()
      useProjectStore().$reset()
      useInvitationStore().$reset()
      useBillingStore().$reset()
      useSuperadminDashboardStore().$reset()
      useSuperadminCustomersStore().$reset()
      useJurisdictionStore().resetStore()
      useSourceStore().resetStore()
      useTicketStore().resetStore()
    },

    syncAuthFromStorage() {
      const storedToken = getStoredValue(TOKEN_KEY)
      if (!storedToken) {
        this.accessToken = null
        this.user = null
        this.organisation = null
      }

      if (!this.accessToken) {
        this.accessToken = storedToken
      }

      const storedRefreshToken = getStoredValue(REFRESH_TOKEN_KEY)
      if (storedRefreshToken && !this.refreshToken) {
        this.refreshToken = storedRefreshToken
      }

      const storedEmail = getStoredValue(EMAIL_KEY)
      if (storedEmail && !this.email) {
        this.email = storedEmail
      }
    },

    handleLoginSuccess(
      token: string,
      rememberMe: boolean,
      user?: User,
      refreshToken?: string | null,
    ) {
      this.setRememberPreference(rememberMe)
      this.setAccessToken(token, rememberMe)
      this.setRefreshToken(refreshToken ?? null, rememberMe)
      this.setAccountPendingApproval(false, null)
      if (user) {
        this.user = user
      }
    },

    async register(payload: RegisterPayload) {
      const response = await authService.registerUser(payload)
      const responseBody = response.data as RegisterResponse
      const registeredEmail = responseBody?.data?.email || payload.email
      this.setUserEmail(registeredEmail)
      this.setOtpPurpose('signup')
      this.setResetToken(null)
      return responseBody
    },
    async login(payload: LoginPayload, rememberMe?: boolean) {
      const response = await authService.login(payload)
      const responseBody = response.data as unknown as LoginApiResponse
      const authData = responseBody.data

      if (!authData?.access_token) {
        throw new Error('Login response missing access token.')
      }

      const persist = rememberMe ?? true
      this.handleLoginSuccess(
        authData.access_token,
        persist,
        authData.user as User | undefined,
        authData.refresh_token ?? null,
      )
      this.setUserEmail(payload.email, persist)

      return true
    },

    async verifyOTP(payload: VerifyOTPPayload) {
      const response = await authService.verifyOtp({
        ...payload,
        otp_purpose: payload.otp_purpose ?? this.otpPurpose ?? 'signup',
      })
      const responseBody = response.data as VerifyOtpResponse
      const authData = responseBody.data ?? responseBody.login_data

      const persist = this.rememberMePreference ?? true
      this.setUserEmail(payload.email, persist)

      if (authData?.access_token) {
        this.handleLoginSuccess(
          authData.access_token,
          persist,
          authData.user as User | undefined,
          authData.refresh_token ?? null,
        )
      }

      this.setOtpPurpose(null)
      return responseBody
    },

    async resendOTP(email: string) {
      const payload: ResendOtpPayload = {
        email,
        otp_purpose: this.otpPurpose ?? 'signup',
      }
      const response = await authService.resendOtp(payload)
      const responseBody = response.data as unknown as ResendOtpApiResponse
      this.setUserEmail(email)
      return responseBody
    },

    async requestPasswordReset(email: string) {
      const payload: PasswordResetRequestPayload = { email }
      const response = await authService.requestPasswordReset(payload)
      this.setUserEmail(email)
      this.setOtpPurpose('password-reset')
      this.setResetToken(null)
      return response.data
    },

    async verifyPasswordReset(payload: PasswordResetVerifyPayload) {
      const response = await authService.verifyPasswordReset(payload)
      const responseBody = response.data as PasswordResetVerifyResponse
      this.setOtpPurpose('password-reset')
      const token = responseBody?.reset_token ?? responseBody?.data?.reset_token
      if (token) this.setResetToken(token)
      return responseBody
    },

    async confirmPasswordReset(payload: PasswordResetConfirmPayload) {
      const response = await authService.confirmPasswordReset(payload)
      const responseBody = response.data as PasswordResetConfirmResponse
      this.clearAuthState()
      return responseBody
    },

    async loadCurrentUser(): Promise<UserProfile | null> {
      if (!this.accessToken) return null
      try {
        const response = await userService.getCurrentUser()
        const payload = response.data?.data
        const apiUser =
          (payload && typeof payload === 'object' && 'user' in payload
            ? (payload as { user?: UserProfile }).user
            : (payload as UserProfile | undefined)) ?? null
        if (apiUser) {
          this.user = apiUser as User
          this.setAccountPendingApproval(false, null)
          return apiUser
        }
      } catch (error) {
        const err = error as {
          response?: { status?: number; data?: { error_code?: string; message?: string } }
        }
        const status = err.response?.status
        const errorCode = err.response?.data?.error_code
        if (status === 401) {
          this.clearAuthState()
        } else if (status === 403 && errorCode === 'ACCOUNT_PENDING_APPROVAL') {
          this.setAccountPendingApproval(true, err.response?.data?.message)
        }
      }
      return null
    },

    async logout() {
      try {
        if (this.accessToken) {
          await authService.logout(this.accessToken)
        }
      } finally {
        this.clearAuthState()
      }
    },

    async refreshTokens() {
      const refreshToken = this.refreshToken
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refreshToken({ refresh_token: refreshToken })
      const payload = response.data
      const data = payload?.data ?? payload
      const newAccess = data?.access_token
      const newRefresh = data?.refresh_token ?? this.refreshToken

      if (!newAccess) {
        throw new Error('Failed to obtain refreshed access token')
      }

      const persist = this.rememberMePreference ?? true
      this.handleLoginSuccess(newAccess, persist, this.user ?? undefined, newRefresh)
      return newAccess
    },
  },
})
