import api from '@/lib/api'
import type { ContactUsApiPayload, RequestDemoApiPayload } from '@/types/contact-us'

type ApiResponse<T> = {
  status?: string
  status_code?: number
  message?: string
  errors?: unknown
  data?: T
}

export async function submitContactForm(payload: ContactUsApiPayload) {
  return api.post<ApiResponse<{ message?: string }>>(`/contact-us`, payload)
}

export async function requestDemoForm(payload: RequestDemoApiPayload) {
  return api.post<ApiResponse<{ message?: string; errors?: unknown }>>(
    '/contact-us/request-demo',
    payload,
  )
}
