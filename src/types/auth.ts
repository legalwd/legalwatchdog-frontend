export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirm_password: string
}

export interface RegisterResponse {
  status?: string
  status_code?: number
  message?: string
  data?: {
    email?: string
  }
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  [x: string]: unknown
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: unknown // TODO: implement user type from backend docs
}

export interface LogoutResponse {
  message: string
  success: boolean
}

export interface RefreshTokenPayload {
  refresh_token?: string
}

export interface RefreshTokenResponse {
  status?: string
  status_code?: number
  message?: string
  data?: {
    access_token?: string
    refresh_token?: string
    token_type?: string
    expires_in?: number
  }
  access_token?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
}

export interface VerifyOTPPayload {
  email: string
  code: string
  otp_purpose?: 'signup' | 'password-reset' | string
}

export interface VerifyOtpResponse {
  status?: string
  status_code?: number
  message?: string
  otp_purpose?: string
  data?: LoginResponse
  login_data?: LoginResponse
}

export interface ResendOtpPayload {
  email: string
  otp_purpose?: 'signup' | 'password-reset' | string
}

export interface ResendOtpResponse {
  message: string
  status?: string
  status_code?: number
}

export interface PasswordResetRequestPayload {
  email: string
}

export interface PasswordResetRequestResponse {
  message?: string
  status?: string
  status_code?: number
}

export interface PasswordResetVerifyPayload {
  email: string
  code: string
}

export interface PasswordResetVerifyResponse {
  message?: string
  reset_token?: string
  status?: string
  status_code?: number
  data?: {
    reset_token?: string
  }
}

export interface PasswordResetConfirmPayload {
  reset_token: string
  new_password: string
  confirm_password: string
}

export interface PasswordResetConfirmResponse {
  message?: string
  status?: string
  status_code?: number
}

export interface MicrosoftOAuthLoginResponse {
  authorization_url: string
  state: string
}

export interface GoogleOAuthTokens {
  access_token?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  id_token?: string
  user?: unknown
}

export interface GoogleProfileResponse {
  status?: string
  status_code?: number
  message?: string
  data?:
    | {
        user?: unknown
        profile?: unknown
        email?: string
        picture?: string
        provider?: string
      }
    | unknown
}

export interface AppleSignInPayload {
  code: string
  id_token: string
  email?: string
  name?: string
  redirect_uri?: string
}

export interface AppleSignInResponse {
  status?: string
  status_code?: number
  message?: string
  data?: {
    access_token?: string
    refresh_token?: string
    token_type?: string
    expires_in?: number
    user?: unknown
  }
  access_token?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  user?: unknown
}

export interface AuthError {
  detail: {
    loc: (string | number)[]
    msg: string
    type: string
  }[]
}
