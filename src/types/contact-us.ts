import { z } from 'zod'

export const requestDemoSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  company_name: z.string().min(1, { message: 'Company name is required' }),
  company_size: z.string().min(1, { message: 'Company size is required' }),
  industry: z.string().min(1, { message: 'Industry is required' }),
  company_website_url: z.url().min(1, { message: 'Website is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  work_email: z.email({ message: 'Invalid email address' }),
  job_title: z.string().min(1, { message: 'Job title is required' }),
})

export interface ContactUsApiPayload {
  full_name: string
  phone_number: string
  email: string
  message: string
}

export type RequestDemoApiPayload = z.infer<typeof requestDemoSchema>

export type RequestDemoApiError = z.core.$ZodFlattenedError<RequestDemoApiPayload>['fieldErrors']
