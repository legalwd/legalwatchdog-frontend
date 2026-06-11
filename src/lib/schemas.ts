import { z } from 'zod'

/**
 * Example Zod schemas for API responses
 * These demonstrate how to add runtime validation to your existing TypeScript types
 */

// User Schemas
export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().url().nullable().optional(),
  is_verified: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const currentUserResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: z
    .object({
      user: userProfileSchema.optional(),
    })
    .or(userProfileSchema),
})

export const updateProfileResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: userProfileSchema.optional(),
})

// Auth Schemas
export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  user: z.unknown(), // Can be refined further
})

export const registerResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: z
    .object({
      email: z.string().email().optional(),
    })
    .optional(),
})

export const refreshTokenResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: z
    .object({
      access_token: z.string().optional(),
      refresh_token: z.string().optional(),
      token_type: z.string().optional(),
      expires_in: z.number().optional(),
    })
    .optional(),
  // Also handle flat structure
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
})

export const verifyOtpResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: z
    .object({
      access_token: z.string().optional(),
      refresh_token: z.string().optional(),
      token_type: z.string().optional(),
      expires_in: z.number().optional(),
    })
    .optional(),
})

// Organization Schemas
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const organizationResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: organizationSchema.or(z.object({ organization: organizationSchema })).optional(),
})

export const organizationListResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: z
    .object({
      organizations: z.array(organizationSchema).optional(),
      total: z.number().optional(),
      page: z.number().optional(),
      per_page: z.number().optional(),
    })
    .optional(),
})

// Project Schemas
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  organization_id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const projectResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: projectSchema.or(z.object({ project: projectSchema })).optional(),
})

export const projectListResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: z
    .object({
      projects: z.array(projectSchema).optional(),
      total: z.number().optional(),
      page: z.number().optional(),
      per_page: z.number().optional(),
    })
    .optional(),
})

// Pagination Schema (reusable)
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    status: z.string().optional(),
    status_code: z.number().optional(),
    message: z.string().optional(),
    data: z.object({
      items: z.array(itemSchema),
      total: z.number(),
      page: z.number(),
      per_page: z.number(),
      total_pages: z.number().optional(),
    }),
  })
}

// Generic Success Response
export const successResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string(),
  success: z.boolean().optional(),
})
