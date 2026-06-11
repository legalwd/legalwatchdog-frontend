<script setup lang="ts">
import { SecurityIcon } from '@hugeicons/core-free-icons'
import { isAxiosError } from 'axios'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import AuthCard from '@/components/authentication/AuthCard.vue'
import FormControl from '@/components/composables/FormControl.vue'
import Icon from '@/components/reusable/Icon.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

const email = ref('')
const errors = ref<string[]>([])
const serverError = ref('')
const isSubmitting = ref(false)

const router = useRouter()
const authStore = useAuthStore()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const handleSubmit = async () => {
  const sanitizedEmail = email.value.trim().toLowerCase()
  const validationErrors: string[] = []

  if (!sanitizedEmail || !emailPattern.test(sanitizedEmail)) {
    validationErrors.push('Enter a valid email address.')
  }

  errors.value = validationErrors
  if (validationErrors.length) return

  isSubmitting.value = true
  serverError.value = ''

  try {
    const response = await authStore.requestPasswordReset(sanitizedEmail)
    const statusCode = (response as { status_code?: number })?.status_code
    if (typeof statusCode === 'number' && statusCode >= 400) {
      serverError.value =
        (response as { message?: string })?.message ??
        'Unable to send reset email. Please try again.'
      return
    }

    authStore.setUserEmail(sanitizedEmail)
    authStore.setOtpPurpose('password-reset')
    router.push({ name: 'otp', query: { flow: 'password-reset' } })
  } catch (error) {
    if (isAxiosError(error)) {
      serverError.value =
        (error.response?.data as { message?: string })?.message ??
        'Unable to send reset email. Please try again.'
    } else {
      serverError.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthCard header-text="Forgot Password" class="mx-auto text-center">
    <template #desc>
      <p>Enter your email to reset your password.</p>
    </template>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div
        v-if="serverError"
        class="border-error bg-error-background text-error rounded-md border p-4 text-left text-sm"
      >
        {{ serverError }}
      </div>
      <div
        v-if="errors.length"
        class="border-error bg-error-background text-error rounded-md border p-4 text-left text-sm"
      >
        <p class="mb-2 font-semibold">Please fix the following:</p>
        <ul class="list-disc space-y-1 pl-4">
          <li v-for="issue in errors" :key="issue">{{ issue }}</li>
        </ul>
      </div>

      <FormControl
        v-model="email"
        type="email"
        label="Email address"
        placeholder="someone@email.com"
        autocomplete="email"
        required
      />

      <Button type="submit" :disabled="isSubmitting" class="w-full">
        <span v-if="!isSubmitting">Continue</span>
        <span v-else>Sending reset link...</span>
      </Button>
      <RouterLink
        :to="{ name: 'login' }"
        class="btn--link flex items-center justify-center gap-2 text-sm"
      >
        <ArrowLeftIcon :size="18" />
        <span>Back to login screen</span>
      </RouterLink>
    </form>

    <div class="mt-8 flex flex-row justify-start gap-4 rounded-2xl bg-blue-50 p-4 text-start">
      <div>
        <Icon :icon="SecurityIcon" class="size-8 text-blue-700" />
      </div>
      <div class="text-sm">
        <h3 class="mb-4 text-lg font-medium">Security Information</h3>
        <p class="mb-2">
          We'll send a password reset link to your email. This link expires after 15 minutes for
          your protection.
        </p>
        <p>For security reasons, we won't reveal whether an email exists in our system.</p>
      </div>
    </div>
  </AuthCard>
</template>
