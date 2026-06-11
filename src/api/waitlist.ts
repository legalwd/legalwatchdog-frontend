import api from '@/lib/api'

export type WaitlistPayload = {
  organization_name: string
  organization_email: string
}
export type earlyAccessPayload = {
  organization_name: string
  organization_email: string
}

type WaitlistSuccessResponse = {
  status: string
  message: string
  data?: WaitlistPayload
}

type WaitlistErrorDetail = {
  type?: string
  loc?: string[]
  msg?: string
}

type WaitlistErrorResponse = {
  message?: string
  detail?: WaitlistErrorDetail[]
}

const FALLBACK_SUCCESS_MESSAGE = 'You have been added to the waitlist'
const FALLBACK_ERROR_MESSAGE =
  'Unable to submit right now. Please check your details and try again shortly.'

export async function submitWaitlist(payload: WaitlistPayload) {
  try {
    const response = await api.post<WaitlistSuccessResponse>('/waitlist/signup', payload)

    return {
      ok: true,
      ...response.data,
      message: response.data?.message ?? FALLBACK_SUCCESS_MESSAGE,
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: unknown } }
    const message = extractErrorMessage(axiosError.response?.data) ?? FALLBACK_ERROR_MESSAGE
    throw new Error(message)
  }
}

function extractErrorMessage(body: unknown): string | null {
  if (!body) return null
  if (typeof body === 'string') {
    return body.trim() || null
  }

  const typedBody = body as WaitlistErrorResponse

  if (typedBody.message) return typedBody.message

  if (Array.isArray(typedBody.detail)) {
    const messages = typedBody.detail.map((detail) => detail?.msg).filter(Boolean)
    if (messages.length > 0) {
      return messages.join(', ')
    }
  }

  return null
}
