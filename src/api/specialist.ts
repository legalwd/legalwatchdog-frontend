import api from '@/lib/api'

export interface HireSpecialistPayload {
  company_name: string
  company_email: string
  industry: string
  brief_description: string
}

export const specialistApi = {
  hire: (payload: HireSpecialistPayload) => api.post('/api/v1/specialists/hire-requests', payload),
}
