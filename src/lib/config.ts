// Central source of the API base URL to keep auth, billing and other clients in sync.
import { ENV } from '@/types/env'

export const API_BASE_URL = ENV.VITE_API_BASE_URL ?? 'https://api.legalwatch.dog/api/v1'
export const APP_ENV = ENV.VITE_APP_ENV ?? 'production'
