<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

type StatusType = 'success' | 'error'
type StatusContext = 'signup' | 'reset-password'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const getQueryValue = (value: unknown) => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] ?? ''
  return ''
}

const statusType = computed<StatusType>(() =>
  route.query.status === 'error' ? 'error' : 'success',
)

const context = computed<StatusContext>(() =>
  route.query.context === 'reset-password' ? 'reset-password' : 'signup',
)

const statusCopy = computed(() => {
  const customTitle = getQueryValue(route.query.title).trim() || null
  const customSubtitle = getQueryValue(route.query.subtitle).trim() || null

  const map: Record<
    StatusContext,
    Record<
      StatusType,
      { title: string; subtitle: string; message: string; cta: string; redirectName: string }
    >
  > = {
    signup: {
      success: {
        title: 'Account Successfully Created',
        subtitle: 'Let’s start your journey',
        message: 'We have set everything up. Continue to log in to get started.',
        cta: 'Continue',
        redirectName: 'create-organization',
      },
      error: {
        title: 'We Could Not Create Your Account',
        subtitle: 'Please review your details and try again',
        message: 'Use the button below to return to signup and adjust your information.',
        cta: 'Back to Signup',
        redirectName: 'signup',
      },
    },
    'reset-password': {
      success: {
        title: 'Password Successfully Changed',
        subtitle: 'Sign in with your new password',
        message: 'Your credentials have been updated. Continue to log in.',
        cta: 'Continue to Log In',
        redirectName: 'login',
      },
      error: {
        title: 'Password Change Was Not Completed',
        subtitle: 'Please try resetting your password again',
        message: 'Return to the reset form to fix the issue and resubmit.',
        cta: 'Back to Reset Password',
        redirectName: 'forgot-password',
      },
    },
  }

  const defaults = map[context.value][statusType.value]

  return {
    title: customTitle ?? defaults.title,
    subtitle: customSubtitle ?? defaults.subtitle,
    cta: defaults.cta,
    redirectName: defaults.redirectName,
  }
})

const targetRoute = computed(() => {
  const redirectName = getQueryValue(route.query.redirect).trim() || statusCopy.value.redirectName
  return { name: redirectName }
})

const isNavigating = ref(false)

const issuedFromFlow = computed(() => getQueryValue(route.query.issued) === 'true')
const showCta = computed(() => issuedFromFlow.value)

const handleRedirect = () => {
  if (isNavigating.value) return
  isNavigating.value = true
  if (statusType.value === 'success') {
    if (context.value === 'signup') authStore.clearSignupDraft()
    if (context.value === 'reset-password') authStore.clearResetPasswordDraft()
  }
  router.replace(targetRoute.value)
}

const isSuccess = computed(() => statusType.value === 'success')
</script>

<template>
  <AuthCard header-text="">
    <div class="flex min-h-[80vh] flex-col justify-center">
      <div class="w-full max-w-xl space-y-5 text-center">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white"
          :class="isSuccess ? 'bg-success' : 'bg-error'"
        >
          <svg
            v-if="isSuccess"
            class="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <svg
            v-else
            class="h-8 w-8"
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
        </div>

        <div class="space-y-3">
          <h1 class="text-3xl leading-tight font-semibold lg:text-[40px]">
            {{ statusCopy.title }}
          </h1>
          <p class="text-base font-medium lg:text-lg">
            {{ statusCopy.subtitle }}
          </p>
        </div>

        <div class="space-y-3">
          <Button
            v-if="showCta"
            type="button"
            :disabled="isNavigating"
            class="w-full"
            @click="handleRedirect"
          >
            <span>{{ isNavigating ? 'Redirecting...' : statusCopy.cta }}</span>
          </Button>
          <p v-else class="text-sm">
            This page is only available immediately after an action such as sign up or password
            reset.
          </p>
        </div>
      </div>
    </div>
  </AuthCard>
</template>
