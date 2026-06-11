<script setup lang="ts">
import { LockedIcon } from '@hugeicons/core-free-icons'
import { isAxiosError } from 'axios'
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import AuthCard from '@/components/authentication/AuthCard.vue'
import FormControl from '@/components/composables/FormControl.vue'
import Icon from '@/components/reusable/Icon.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

const authStore = useAuthStore()
const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = ref<string[]>([])
const serverError = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

const resetToken = computed(() => authStore.resetToken)
const passwordCriteria = [
  (value: string) => value.length >= 8,
  (value: string) => /[A-Z]/.test(value),
  (value: string) => /[0-9]/.test(value),
  (value: string) => /[^A-Za-z0-9]/.test(value),
]

const strengthScore = computed(
  () => passwordCriteria.filter((check) => check(newPassword.value.trim())).length,
)

const sanitize = (value: string) => value.trim()

const hydrateFromDraft = () => {
  if (authStore.resetPasswordDraft) {
    newPassword.value = authStore.resetPasswordDraft.newPassword
    confirmPassword.value = authStore.resetPasswordDraft.confirmPassword
  }
}

onMounted(hydrateFromDraft)

watchEffect(() => {
  if (!resetToken.value && !successMessage.value) {
    router.replace({ name: 'forgot-password' })
  }
})

const validateForm = () => {
  const validationErrors: string[] = []
  const password = sanitize(newPassword.value)
  const confirm = sanitize(confirmPassword.value)

  if (!password || password.length < 8) {
    validationErrors.push('Password must be at least 8 characters long.')
  }
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    validationErrors.push('Include an uppercase letter, number, and symbol in your password.')
  }
  if (password !== confirm) {
    validationErrors.push('Passwords do not match.')
  }

  errors.value = validationErrors
  return validationErrors.length === 0
}

const handleSubmit = async () => {
  if (!resetToken.value) {
    router.replace({ name: 'forgot-password' })
    return
  }

  if (!validateForm()) return

  isSubmitting.value = true
  serverError.value = ''
  successMessage.value = ''
  authStore.setResetPasswordDraft({
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value,
  })

  try {
    const payload = {
      reset_token: resetToken.value,
      new_password: sanitize(newPassword.value),
      confirm_password: sanitize(confirmPassword.value),
    }
    const response = await authStore.confirmPasswordReset(payload)
    successMessage.value = response?.message ?? 'Password updated successfully.'
    newPassword.value = ''
    confirmPassword.value = ''
    router.replace({
      name: 'auth-status',
      query: {
        status: 'success',
        context: 'reset-password',
        issued: 'true',
        subtitle: successMessage.value,
      },
    })
  } catch (error) {
    if (isAxiosError(error)) {
      serverError.value =
        (error.response?.data as { message?: string })?.message ??
        'Unable to update password. Please try again.'
    } else {
      serverError.value = 'An unexpected error occurred. Please try again.'
    }

    router.push({
      name: 'auth-status',
      query: {
        status: 'error',
        context: 'reset-password',
        issued: 'true',
        subtitle: serverError.value,
      },
    })
  } finally {
    isSubmitting.value = false
    authStore.clearResetPasswordDraft()
  }
}
</script>

<template>
  <AuthCard header-text="New Password" class="text-center">
    <template #desc>
      <p class="">Choose a strong password that you haven't used before.</p>
    </template>

    <div class="grid grid-cols-1 gap-8">
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
        <div
          v-if="successMessage"
          class="rounded-md border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-emerald-700"
        >
          {{ successMessage }}
        </div>

        <FormControl
          v-model="newPassword"
          :type="showPassword ? 'text' : 'password'"
          label="New Password"
          placeholder="Enter a new password"
          autocomplete="new-password"
          required
        >
          <template #trailing>
            <button
              type="button"
              class="cursor-pointer px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              @click="showPassword = !showPassword"
            >
              <EyeOffIcon v-if="showPassword" :size="18" aria-hidden="true" />
              <EyeIcon v-else :size="18" aria-hidden="true" />
              <span class="sr-only">{{ showPassword ? 'Hide password' : 'Show password' }}</span>
            </button>
          </template>
        </FormControl>

        <div v-show="newPassword.length !== 0">
          <div class="flex items-center gap-2">
            <div
              v-for="index in passwordCriteria.length"
              :key="index"
              class="h-1 flex-1 rounded-full transition-all"
              :class="{
                'bg-red-500': strengthScore === 1 && index === 1,
                'bg-yellow-500': (strengthScore === 2 || strengthScore === 3) && index <= 3,
                'bg-green-500': strengthScore === 4,
                'bg-gray-200':
                  strengthScore === 0 ||
                  (strengthScore === 1 && index > 1) ||
                  ((strengthScore === 2 || strengthScore === 3) && index > 3),
              }"
            />
          </div>
          <p class="mt-2 text-start text-sm">
            Hint: Password must be at least 8 characters and include an uppercase letter, a number,
            and a symbol.
          </p>
        </div>

        <FormControl
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          label="Confirm New Password"
          placeholder="Confirm password"
          autocomplete="new-password"
          required
          @paste.prevent
          @copy.prevent
          @cut.prevent
          @drop.prevent
        >
          <template #trailing>
            <button
              type="button"
              class="cursor-pointer px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOffIcon v-if="showConfirmPassword" :size="18" aria-hidden="true" />
              <EyeIcon v-else :size="18" aria-hidden="true" />
              <span class="sr-only">
                {{ showConfirmPassword ? 'Hide password' : 'Show password' }}
              </span>
            </button>
          </template>
        </FormControl>

        <Button class="w-full" type="submit" :disabled="isSubmitting">
          <span v-if="!isSubmitting">Confirm</span>
          <span v-else>Updating password...</span>
        </Button>

        <RouterLink
          :to="{ name: 'login' }"
          class="btn--link flex items-center justify-center gap-2 text-sm"
        >
          <ArrowLeftIcon :size="18" />
          <span>Back to login screen</span>
        </RouterLink>
      </form>
    </div>

    <div class="mt-8 flex flex-row justify-start gap-4 rounded-2xl bg-blue-50 p-4 text-start">
      <div>
        <Icon :icon="LockedIcon" class="size-8 text-blue-700" />
      </div>
      <div class="text-sm">
        <h3 class="mb-4 text-lg font-medium">Security Information</h3>
        <ul class="list-disc space-y-2 pl-6">
          <li>Use a unique password you haven't used on other websites.</li>
          <li>Avoid personal information like birthdays or names.</li>
          <li>Consider using a password manager to generate and store strong passwords.</li>
        </ul>
      </div>
    </div>
  </AuthCard>
</template>
