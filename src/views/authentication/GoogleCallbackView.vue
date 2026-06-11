<script setup lang="ts">
import { isAxiosError } from 'axios'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { authService } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

type ViewStatus = 'working' | 'error'

const router = useRouter()
const authStore = useAuthStore()

const status = ref<ViewStatus>('working')
const errorMessage = ref('')
const errorDetail = ref('')

const readCookie = (key: string) => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`))
  return match && match[1] ? decodeURIComponent(match[1]) : null
}

const parseOauthParams = () => {
  const hashParams = new URLSearchParams(
    window.location.hash && window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash,
  )
  const queryParams = new URLSearchParams(
    window.location.search && window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search,
  )

  const getParam = (key: string) => queryParams.get(key) ?? hashParams.get(key)

  return {
    accessToken: getParam('access_token'),
    refreshToken: getParam('refresh_token'),
    tokenType: getParam('token_type'),
    expiresIn: getParam('expires_in'),
    idToken: getParam('id_token'),
    state: getParam('state'),
    isNewUser: getParam('is_new_user'),
    error: getParam('error'),
    errorDescription: getParam('error_description') ?? getParam('message') ?? getParam('detail'),
  }
}

const tryFetchGoogleProfile = async () => {
  try {
    const response = await authService.getGoogleProfile()
    const payload = response.data?.data ?? response.data
    const maybeUser =
      payload && typeof payload === 'object' && 'user' in payload
        ? (payload as { user?: unknown }).user
        : payload

    const email =
      (maybeUser as { email?: string | null })?.email ||
      (payload as { email?: string | null })?.email
    if (email) authStore.setUserEmail(email)

    return maybeUser ?? null
  } catch (error) {
    if (isAxiosError(error)) {
      errorDetail.value =
        (error.response?.data as { message?: string; detail?: string })?.message ??
        errorDetail.value
    }
    return null
  }
}

const finishGoogleLogin = async () => {
  const params = parseOauthParams()
  const rememberPreference = authStore.rememberMePreference
  const cookieAccess = readCookie('lwd_access_token')
  const cookieRefresh =
    readCookie('lwd_refresh_token') ?? readCookie('lwd_request_token') ?? undefined
  const accessToken = params.accessToken ?? cookieAccess ?? undefined
  const refreshToken = params.refreshToken ?? cookieRefresh ?? undefined

  if (params.error) {
    status.value = 'error'
    errorMessage.value = 'Google sign-in could not be completed.'
    errorDetail.value = params.errorDescription ?? params.error
    return
  }

  if (!accessToken) {
    status.value = 'error'
    errorMessage.value = 'Google sign-in did not return an access token.'
    errorDetail.value = params.errorDescription ?? ''
    return
  }

  try {
    authStore.handleLoginSuccess(accessToken, rememberPreference, undefined, refreshToken)

    const profileUser = await tryFetchGoogleProfile()
    if (profileUser) {
      authStore.handleLoginSuccess(
        accessToken,
        rememberPreference,
        profileUser as never,
        refreshToken,
      )
    } else {
      await authStore.loadCurrentUser()
    }

    const isNewUser = params.isNewUser === 'true'
    if (isNewUser) {
      await router.replace({
        name: 'auth-status',
        query: { status: 'success', context: 'signup', redirect: 'organizations', issued: 'true' },
      })
    } else {
      await router.replace({ name: 'organizations' })
    }
  } catch (error) {
    status.value = 'error'
    errorMessage.value = 'We could not finish signing you in with Google.'
    if (isAxiosError(error)) {
      errorDetail.value =
        (error.response?.data as { message?: string; detail?: string })?.message ??
        errorDetail.value
    } else {
      errorDetail.value = (error as Error)?.message || errorDetail.value
    }
  }
}

onMounted(finishGoogleLogin)

const goToLogin = () => router.replace({ name: 'login' })
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4 py-10">
    <div class="bg-background w-full max-w-lg rounded-2xl border p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full"
          :class="
            status === 'error'
              ? 'bg-error-background text-error'
              : 'bg-success-background text-success'
          "
        >
          <svg
            v-if="status === 'error'"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <svg
            v-else
            class="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" class="opacity-25" />
            <path d="M22 12a10 10 0 0 1-10 10" />
          </svg>
        </div>
        <div>
          <p class="text-foreground text-lg font-semibold">
            {{ status === 'error' ? 'Google sign-in failed' : 'Finishing Google sign-in' }}
          </p>
          <p class="text-sm">
            {{
              status === 'error'
                ? 'We could not complete your Google login.'
                : 'Please wait while we finalize your session.'
            }}
          </p>
        </div>
      </div>

      <div
        v-if="status === 'error'"
        class="bg-error-background text-error mt-4 rounded-lg border border-red-100 p-4 text-sm"
      >
        <p class="font-semibold">
          {{ errorMessage || 'We could not finish signing you in with Google.' }}
        </p>
        <p v-if="errorDetail" class="mt-1">
          {{ errorDetail }}
        </p>
      </div>

      <div class="mt-6 flex gap-3">
        <Button v-if="status === 'error'" type="button" class="w-full" @click="goToLogin">
          Back to Login
        </Button>
        <Button v-else type="button" class="w-full" disabled> Connecting... </Button>
      </div>
    </div>
  </div>
</template>
