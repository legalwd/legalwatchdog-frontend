<script setup lang="ts">
import { isAxiosError } from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(true)
const isSubmitting = ref(false)
const serverError = ref('')
const errors = ref<string[]>([])

const MIN_PASSWORD_LENGTH = 8
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const sanitize = (v: string) => v.trim()

const isFormValid = () => email.value.trim() !== '' && password.value.trim() !== ''

/**
 * Accepted super admin role values
 */
const SUPER_ADMIN_ROLES = ['super-admin', 'superadmin', 'super_admin'] as const

/**
 * Type-safe super admin check
 */
type SuperAdminCheckUser = {
  role?: string
  is_superadmin?: boolean
  is_super_admin?: boolean
}

const isSuperAdminUser = (user: SuperAdminCheckUser): boolean => {
  if (user.is_superadmin === true || user.is_super_admin === true) {
    return true
  }

  const role = user.role?.toLowerCase()
  if (!role) return false

  return SUPER_ADMIN_ROLES.includes(role as (typeof SUPER_ADMIN_ROLES)[number])
}

const handleLogin = async () => {
  const sanitizedEmail = sanitize(email.value).toLowerCase()
  const sanitizedPassword = sanitize(password.value)
  const validationErrors: string[] = []

  if (!sanitizedEmail || !emailPattern.test(sanitizedEmail)) {
    validationErrors.push('Enter a valid email address.')
  }

  if (!sanitizedPassword) {
    validationErrors.push('Password is required.')
  } else if (sanitizedPassword.length < MIN_PASSWORD_LENGTH) {
    validationErrors.push('Password must be at least 8 characters long.')
  }

  errors.value = validationErrors
  if (validationErrors.length) return

  isSubmitting.value = true
  serverError.value = ''

  try {
    // Step 1: Login
    await auth.login({ email: sanitizedEmail, password: sanitizedPassword }, rememberMe.value)

    // Step 2: Load user profile
    const user = await auth.loadCurrentUser()

    if (!user) {
      toast.error('Failed to load user profile')
      await auth.logout()
      return
    }

    // Step 3: Super admin check
    console.log('User object:', user)

    if (!isSuperAdminUser(user)) {
      toast.error('Your account does not have super-admin access')
      console.error('Super admin role check failed:', user)
      await auth.logout()
      return
    }

    toast.success('Successfully signed in as super-admin')

    const redirectQuery = router.currentRoute.value.query.redirect
    const redirectTarget =
      typeof redirectQuery === 'string' && redirectQuery
        ? redirectQuery
        : { name: 'super-admin-overview' }

    await router.push(redirectTarget)
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      serverError.value =
        (err.response?.data as { message?: string })?.message ?? 'Unable to log in.'
      toast.error(serverError.value)
    } else {
      serverError.value = 'An unexpected error occurred. Please try again.'
      toast.error(serverError.value)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="flex min-h-screen w-full items-center justify-center bg-gray-50">
    <div class="flex w-full flex-col items-center gap-6">
      <div class="flex items-center gap-2">
        <div class="h-6 w-6 rounded-none bg-[#18181B]"></div>
        <p class="font-medium">Emerj</p>
      </div>

      <div class="w-full max-w-105 rounded-md border bg-white p-6 shadow-lg">
        <h1 class="text-center text-lg font-semibold">Super Admin Login</h1>
        <p class="mt-1 px-3 text-center text-sm text-[#71717A]">
          Please sign in with your admin credentials to access the Super Admin dashboard.
        </p>

        <form class="mt-5 flex flex-col gap-4" novalidate @submit.prevent="handleLogin">
          <div
            v-if="serverError"
            class="rounded-md border border-red-200 bg-red-50/70 p-3 text-sm text-red-700"
          >
            {{ serverError }}
          </div>
          <div
            v-if="errors.length"
            class="rounded-md border border-red-200 bg-red-50/70 p-3 text-sm text-red-700"
          >
            <p class="mb-2 font-semibold">Please fix the following:</p>
            <ul class="list-disc pl-5">
              <li v-for="e in errors" :key="e">{{ e }}</li>
            </ul>
          </div>

          <div class="flex flex-col gap-1">
            <label for="email" class="text-sm font-medium">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="w-full rounded-sm border px-3 py-2 outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label for="password" class="text-sm font-medium">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="w-full rounded-sm border px-3 py-2 outline-none"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 text-sm">
              <input v-model="rememberMe" type="checkbox" class="h-4 w-4" />
              Remember me
            </label>
            <router-link to="/forgot-password" class="text-sm text-gray-600 hover:underline"
              >Forgot password?</router-link
            >
          </div>

          <button
            type="submit"
            :disabled="isSubmitting || !isFormValid()"
            class="btn--default btn--lg btn--full"
          >
            <span v-if="!isSubmitting">Login</span>
            <span v-else>Signing in...</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
