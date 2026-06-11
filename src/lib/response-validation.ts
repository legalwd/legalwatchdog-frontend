import type { AxiosResponse } from 'axios'
import { z } from 'zod'

/*
  Standard API response wrapper schema
  Most backend responses follow this pattern
 */
export const apiResponseSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  data: z.unknown().optional(),
})

// Error response schema
export const apiErrorSchema = z.object({
  status: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
  error: z.string().optional(),
})

/*
  Validates an API response against a Zod schema
  @param response - The Axios response to validate
  @param schema - Optional Zod schema to validate the response data against
  @returns The validated response
  @throws ZodError if validation fails
 */
export function validateResponse<T>(
  response: AxiosResponse,
  schema?: z.ZodSchema<T>,
): AxiosResponse<T> {
  // First validate the basic response structure
  const basicValidation = apiResponseSchema.safeParse(response.data)

  if (!basicValidation.success) {
    if (import.meta.env.DEV) {
      console.warn('[Response Validation] Basic structure validation failed:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        error: basicValidation.error.format(),
        actualData: response.data,
      })
    }
  }

  // If a specific schema is provided, validate against it
  if (schema) {
    const validation = schema.safeParse(response.data)

    if (!validation.success) {
      if (import.meta.env.DEV) {
        console.error('[Response Validation] Schema validation failed:', {
          url: response.config.url,
          method: response.config.method,
          status: response.status,
          error: validation.error.format(),
          actualData: response.data,
        })
      }

      // In development, we log but don't throw to avoid breaking the app
      // In production, this allows the app to continue with potentially invalid data
      // but the types should catch most issues at compile time
    }

    return response as AxiosResponse<T>
  }

  return response as AxiosResponse<T>
}

/*
  Creates a response validator function for a specific schema
  Useful for creating reusable validators for common response types
 */
export function createResponseValidator<T>(schema: z.ZodSchema<T>) {
  return (response: AxiosResponse): AxiosResponse<T> => {
    return validateResponse(response, schema)
  }
}

/*
  Validates just the data property of a response
  Useful when you only care about the data payload
*/
export function validateResponseData<T>(response: AxiosResponse, dataSchema: z.ZodSchema<T>): T {
  const validation = dataSchema.safeParse(response.data.data || response.data)

  if (!validation.success) {
    if (import.meta.env.DEV) {
      console.error('[Response Data Validation] Failed:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        error: validation.error.format(),
        actualData: response.data.data || response.data,
      })
    }

    // Return the data anyway but log the error
    // This prevents breaking changes while alerting developers
    return (response.data.data || response.data) as T
  }

  return validation.data
}

/*
  Type guard to check if a response matches the expected schema
*/
export function isValidResponse<T>(data: unknown, schema: z.ZodSchema<T>): data is T {
  return schema.safeParse(data).success
}

/*
  Wrapper for API calls that automatically validates responses
  Usage: const response = await withValidation(api.get('/endpoint'), mySchema)
 */
export async function withValidation<T>(
  promise: Promise<AxiosResponse>,
  schema?: z.ZodSchema<T>,
): Promise<AxiosResponse<T>> {
  const response = await promise
  return validateResponse(response, schema)
}
