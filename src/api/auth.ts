import axios from 'axios'

import { API_BASE_URL, APP_ENV } from '@/lib/config'
import type {
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  PasswordResetConfirmPayload,
  PasswordResetConfirmResponse,
  PasswordResetRequestPayload,
  PasswordResetRequestResponse,
  PasswordResetVerifyPayload,
  PasswordResetVerifyResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  RegisterPayload,
  RegisterResponse,
  AppleSignInPayload,
  AppleSignInResponse,
  MicrosoftOAuthLoginResponse,
  ResendOtpPayload,
  ResendOtpResponse,
  VerifyOTPPayload,
  VerifyOtpResponse,
  GoogleProfileResponse,
} from '@/types/auth'

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
})

const bearerHeader = (token?: string | null) => (token ? { Authorization: `Bearer ${token}` } : {})

export const authService = {
  registerUser: (payload: RegisterPayload) =>
    http.post<RegisterResponse>('/auth/register', payload),

  login: (payload: LoginPayload) => http.post<LoginResponse>('/auth/login', payload),

  logout: (token?: string | null) =>
    http.post<LogoutResponse>('/auth/logout', {}, { headers: bearerHeader(token) }),

  verifyOtp: (payload: VerifyOTPPayload) =>
    http.post<VerifyOtpResponse>('/auth/otp/verification', payload),

  resendOtp: (payload: ResendOtpPayload) =>
    http.post<ResendOtpResponse>('/auth/otp/requests', payload),

  requestPasswordReset: (payload: PasswordResetRequestPayload) =>
    http.post<PasswordResetRequestResponse>('/auth/password/resets', payload),

  verifyPasswordReset: (payload: PasswordResetVerifyPayload) =>
    http.post<PasswordResetVerifyResponse>('/auth/password/resets/verification', payload),

  confirmPasswordReset: (payload: PasswordResetConfirmPayload) =>
    http.post<PasswordResetConfirmResponse>('/auth/password/resets/confirmation', payload),

  refreshToken: (payload: RefreshTokenPayload) =>
    http.post<RefreshTokenResponse>('/auth/token/refresh', payload),

  getMicrosoftLoginUrl: (redirectUri?: string | null) =>
    http.get<MicrosoftOAuthLoginResponse>('/oauth/microsoft/login', {
      params: redirectUri ? { redirect_uri: redirectUri } : undefined,
    }),

  getGoogleLoginUrl: () => {
    const url = new URL(`${API_BASE_URL}/oauth/google/login`)
    url.searchParams.set('client', APP_ENV)
    return url.toString()
  },

  getGoogleProfile: () => http.get<GoogleProfileResponse>('/oauth/google/profile'),

  appleSignIn: (payload: AppleSignInPayload) =>
    http.post<AppleSignInResponse>('/auth/apple/signin', payload),
}
