<script setup lang="ts">
import { isAxiosError } from 'axios'
import { ref } from 'vue'

import { authService } from '@/api/auth'
import { useAuthStore } from '@/stores/auth-store'
// import { useRouter } from 'vue-router'

const baseButtonClass =
  'w-full btn--with-icon border bg-background btn--sm font-medium shadow-[0_1px_0_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:shadow-sm'

const props = defineProps<{
  rememberMe?: boolean
}>()

// const microsoftRedirectUri = import.meta.env.VITE_MICROSOFT_REDIRECT_URI
// const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID
// const appleRedirectUri = import.meta.env.VITE_APPLE_REDIRECT_URI

const isGoogleLoading = ref(false)
// const isMicrosoftLoading = ref(false)
// const isAppleLoading = ref(false)
const socialError = ref('')

// const router = useRouter()
const authStore = useAuthStore()

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string
          scope: string
          redirectURI: string
          usePopup?: boolean
        }) => void
        signIn: () => Promise<{
          authorization?: { code?: string; id_token?: string }
          user?: { email?: string; name?: { firstName?: string; lastName?: string } }
        }>
      }
    }
  }
}

const handleGoogleLogin = async () => {
  if (isGoogleLoading.value) return

  socialError.value = ''
  isGoogleLoading.value = true
  const persist = props.rememberMe ?? authStore.rememberMePreference
  authStore.setRememberPreference(persist)
  const defaultError = 'Unable to start Google login. Please try again.'

  try {
    const authorizationUrl = authService.getGoogleLoginUrl()

    if (!authorizationUrl) {
      throw new Error('Authorization URL missing from response.')
    }

    window.location.href = authorizationUrl
  } catch (error) {
    if (isAxiosError(error)) {
      const responseData = (error.response?.data ?? {}) as {
        message?: string
        detail?: string
        error?: string
      }
      socialError.value =
        responseData.message || responseData.detail || responseData.error || defaultError
    } else {
      socialError.value = defaultError
    }
  } finally {
    isGoogleLoading.value = false
  }
}

// const handleMicrosoftLogin = async () => {
//   if (isMicrosoftLoading.value) return

//   socialError.value = ''
//   isMicrosoftLoading.value = true
//   const defaultError = 'Unable to start Microsoft login. Please try again.'

//   try {
//     const { data } = await authService.getMicrosoftLoginUrl(microsoftRedirectUri)
//     const authorizationUrl = data?.authorization_url

//     if (!authorizationUrl) {
//       throw new Error('Authorization URL missing from response.')
//     }

//     window.location.href = authorizationUrl
//   } catch (error) {
//     if (isAxiosError(error)) {
//       const responseData = (error.response?.data ?? {}) as {
//         message?: string
//         detail?: string
//         error?: string
//       }
//       socialError.value =
//         responseData.message || responseData.detail || responseData.error || defaultError
//     } else {
//       socialError.value = defaultError
//     }
//   } finally {
//     isMicrosoftLoading.value = false
//   }
// }

// const loadAppleScript = () =>
//   new Promise<void>((resolve, reject) => {
//     if (document.getElementById('apple-signin')) {
//       resolve()
//       return
//     }
//     const script = document.createElement('script')
//     script.id = 'apple-signin'
//     script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
//     script.onload = () => resolve()
//     script.onerror = () => {
//       script.remove()
//       reject(new Error('Failed to load Apple Sign In'))
//     }
//     document.head.appendChild(script)
//   })

// const handleAppleLogin = async () => {
//   if (isAppleLoading.value) return

//   socialError.value = ''
//   isAppleLoading.value = true

//   const missingConfig = !appleClientId || !appleRedirectUri
//   if (missingConfig) {
//     socialError.value = 'Apple login is not available right now. Please try again later.'
//     isAppleLoading.value = false
//     return
//   }

//   try {
//     await loadAppleScript()

//     const apple = window.AppleID
//     if (!apple?.auth) throw new Error('Apple Sign In not available.')

//     apple.auth.init({
//       clientId: appleClientId,
//       scope: 'name email',
//       redirectURI: appleRedirectUri,
//       usePopup: true,
//     })

//     const response = await apple.auth.signIn()
//     const auth = response?.authorization
//     const user = response?.user

//     if (!auth?.code || !auth?.id_token) {
//       throw new Error('Apple Sign In did not return a valid authorization code.')
//     }

//     const name =
//       user?.name?.firstName || user?.name?.lastName
//         ? `${user?.name?.firstName ?? ''} ${user?.name?.lastName ?? ''}`.trim()
//         : undefined

//     const apiResponse = await authService.appleSignIn({
//       code: auth.code,
//       id_token: auth.id_token,
//       email: user?.email,
//       name,
//       redirect_uri: appleRedirectUri,
//     })

//     const payload = apiResponse.data as {
//       data?: { access_token?: string; user?: unknown }
//       access_token?: string
//       user?: unknown
//     }
//     const accessToken = payload.data?.access_token ?? payload.access_token
//     const userData = payload.data?.user ?? payload.user

//     if (accessToken) {
//       authStore.handleLoginSuccess(accessToken, true, userData as never)
//       router.push({ name: 'organizations' })
//     } else {
//       router.push({ name: 'auth-status', query: { status: 'success', context: 'signup' } })
//     }
//   } catch (error) {
//     if (isAxiosError(error)) {
//       const responseData = (error.response?.data ?? {}) as {
//         message?: string
//         detail?: string
//         error?: string
//       }
//       socialError.value =
//         responseData.message || responseData.detail || responseData.error || 'Apple login failed.'
//     } else {
//       socialError.value = (error as Error)?.message || 'Apple login failed.'
//     }
//   } finally {
//     isAppleLoading.value = false
//   }
// }
</script>

<template>
  <div class="space-y-2">
    <button
      type="button"
      :class="[baseButtonClass, { 'cursor-not-allowed opacity-60': isGoogleLoading }]"
      :disabled="isGoogleLoading"
      @click="handleGoogleLogin"
    >
      <img src="/images/google.png" alt="Google" class="h-5 w-5" />
      <span>{{ isGoogleLoading ? 'Connecting...' : 'Continue with Google' }}</span>
    </button>

    <!-- <button
      type="button"
      :class="[baseButtonClass, { 'cursor-not-allowed opacity-60': isAppleLoading }]"
      :disabled="isAppleLoading"
      @click="handleAppleLogin"
    >
      <img src="/images/apple.png" alt="Apple" class="h-5 w-5" />
      <span>{{ isAppleLoading ? 'Connecting...' : 'Apple' }}</span>
    </button>

    <button
      type="button"
      :class="[baseButtonClass, { 'cursor-not-allowed opacity-60': isMicrosoftLoading }]"
      :disabled="isMicrosoftLoading"
      @click="handleMicrosoftLogin"
    >
      <img src="/images/microsoft.png" alt="Microsoft" class="h-5 w-5" />
      <span>{{ isMicrosoftLoading ? 'Connecting...' : 'Microsoft' }}</span>
    </button> -->

    <p v-if="socialError" class="mt-4 text-center text-sm text-red-600">
      {{ socialError }}
    </p>
  </div>
</template>
