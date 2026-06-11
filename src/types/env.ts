import { z } from 'zod'

// Define and validate the runtime environment variables from Vite
const EnvSchema = z.object({
  VITE_API_BASE_URL: z.url().optional(),
  VITE_MICROSOFT_REDIRECT_URI: z.url().optional(),
  VITE_APPLE_CLIENT_ID: z.string().optional(),
  VITE_APPLE_REDIRECT_URI: z.url().optional(),
  VITE_APP_ENV: z.enum(['local', 'staging', 'production']).optional(),
  // Vite-provided envs
  MODE: z.string().optional(),
})

export const ENV = EnvSchema.parse(import.meta.env)
