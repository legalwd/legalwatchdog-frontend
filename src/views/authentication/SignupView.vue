<script setup lang="ts">
import { isAxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import AuthCard from '@/components/authentication/AuthCard.vue'
import SocialLogins from '@/components/authentication/SocialLogins.vue'
import FormControl from '@/components/composables/FormControl.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
// import { Label } from '@/components/ui/label'
// import { Checkbox } from '@/components/ui/checkbox'

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
// const agreeToTerms = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = ref<string[]>([])
const serverError = ref('')
const isSubmitting = ref(false)

const router = useRouter()

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const hasUppercase = /[A-Z]/
const hasLowercase = /[a-z]/
const hasNumber = /[0-9]/
const hasSpecial = /[^A-Za-z0-9]/
const MIN_PASSWORD_LENGTH = 8

const sanitize = (value: string) => value.trim()

const hydrateFromDraft = () => {
  if (authStore.signupDraft) {
    name.value = authStore.signupDraft.name
    email.value = authStore.signupDraft.email
    password.value = authStore.signupDraft.password
    confirmPassword.value = authStore.signupDraft.confirmPassword
  }
}

onMounted(hydrateFromDraft)

const resetForm = () => {
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  // agreeToTerms.value = false
  showPassword.value = false
  showConfirmPassword.value = false
  errors.value = []
  serverError.value = ''
}

const isFormValid = () => {
  return (
    name.value.trim() !== '' &&
    email.value.trim() !== '' &&
    password.value.trim() !== '' &&
    confirmPassword.value.trim() !== ''
  )
}

const validateSignupForm = () => {
  const sanitizedName = sanitize(name.value)
  const sanitizedEmail = sanitize(email.value).toLowerCase()
  const sanitizedPassword = sanitize(password.value)
  const sanitizedConfirm = sanitize(confirmPassword.value)

  const validationErrors: string[] = []

  if (!sanitizedName) {
    validationErrors.push('Name is required.')
  }

  if (!sanitizedEmail || !emailPattern.test(sanitizedEmail)) {
    validationErrors.push('Enter a valid work email address.')
  }

  if (!sanitizedPassword) {
    validationErrors.push('Password is required.')
  } else {
    if (sanitizedPassword.length < MIN_PASSWORD_LENGTH) {
      validationErrors.push('Password must be at least 8 characters.')
    }
    if (
      !hasUppercase.test(sanitizedPassword) ||
      !hasLowercase.test(sanitizedPassword) ||
      !hasNumber.test(sanitizedPassword) ||
      !hasSpecial.test(sanitizedPassword)
    ) {
      validationErrors.push(
        'Password must include an uppercase letter, a lowercase letter, a number, and a special character.',
      )
    }
  }

  if (sanitizedPassword && sanitizedConfirm && sanitizedPassword !== sanitizedConfirm) {
    validationErrors.push('Passwords do not match.')
  }

  // if (!agreeToTerms.value) {
  //   validationErrors.push('You must agree to the terms to continue.')
  // }

  errors.value = validationErrors
  return validationErrors.length === 0
}

const captureDraft = () => ({
  name: name.value,
  email: email.value,
  password: password.value,
  confirmPassword: confirmPassword.value,
})

const handleCreateAccount = async () => {
  if (!validateSignupForm()) return
  serverError.value = ''
  isSubmitting.value = true
  authStore.setSignupDraft(captureDraft())

  const sanitizedEmail = sanitize(email.value).toLowerCase()

  try {
    const response = await authStore.register({
      name: sanitize(name.value),
      email: sanitizedEmail,
      password: sanitize(password.value),
      confirm_password: sanitize(confirmPassword.value),
    })

    const statusCode = response?.status_code
    if (typeof statusCode === 'number' && statusCode >= 400) {
      serverError.value = response?.message ?? 'Unable to complete registration.'
      return
    }

    resetForm()
    router.push({ name: 'otp', query: { flow: 'signup' } })
  } catch (error) {
    if (isAxiosError(error)) {
      const apiMessage = (error.response?.data as { message?: string })?.message
      const isPendingOtp =
        typeof apiMessage === 'string' &&
        apiMessage.toLowerCase().includes('pending otp verification')

      if (isPendingOtp) {
        try {
          authStore.setUserEmail(sanitizedEmail)
          authStore.setOtpPurpose('signup')
          await authStore.resendOTP(sanitizedEmail)
          resetForm()
          router.push({ name: 'otp' })
          return
        } catch (resendError) {
          serverError.value =
            (isAxiosError(resendError) &&
              (resendError.response?.data as { message?: string })?.message) ||
            'We could not resend your OTP. Please try again.'
          return
        }
      }

      serverError.value = apiMessage ?? 'An error occurred while creating your account.'
    } else {
      serverError.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthCard header-text="Create a new account">
    <form class="space-y-5" @submit.prevent="handleCreateAccount">
      <div
        v-if="errors.length"
        class="border-error bg-error-background text-error rounded-md border p-4 text-left text-sm"
      >
        <p class="mb-2 font-semibold">Please fix the following:</p>
        <ul class="list-disc space-y-1 pl-4">
          <li v-for="issue in errors" :key="issue">{{ issue }}</li>
        </ul>
      </div>

      <FormControl v-model="name" label="Full Name" placeholder="Enter your full name" required />

      <FormControl
        v-model="email"
        type="email"
        label="Work Email"
        placeholder="Enter your work email"
        required
      />

      <FormControl
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        label="Password"
        placeholder="Enter your password"
        required
      >
        <template #trailing>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 focus:outline-none"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="!showPassword" />
            <Eye v-else />
          </button>
        </template>
      </FormControl>

      <FormControl
        v-model="confirmPassword"
        :type="showConfirmPassword ? 'text' : 'password'"
        label="Confirm Password"
        placeholder="Confirm your password"
        required
        @paste.prevent
        @copy.prevent
        @cut.prevent
        @drop.prevent
      >
        <template #trailing>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 focus:outline-none"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <EyeOff v-if="!showConfirmPassword" />
            <Eye v-else />
          </button>
        </template>
      </FormControl>

      <!-- I can't remove this in good conscience because as a policy scrapper handling organization data, policies, terms and conditions should be clear -->

      <!-- <Label for="agreeToTerms" row>
        <Checkbox id="agreeToTerms" v-model="agreeToTerms" required />

        <p>
          I agree to the
          <a href="#" class="hover:text-primary font-medium text-gray-900 underline decoration-1"
            >terms of service</a
          >
          and
          <a href="#" class="hover:text-primary font-medium text-gray-900 underline decoration-1"
            >Privacy policy</a
          >
        </p>
      </Label> -->

      <Button
        type="submit"
        :disabled="isSubmitting || !isFormValid()"
        class="w-full"
        :class="{ 'cursor-not-allowed opacity-50': !isFormValid() }"
        :style="!isFormValid() ? 'background-color: #E3E3E3; color: #999;' : ''"
      >
        <span v-if="!isSubmitting">Signup</span>
        <span v-else>Creating account...</span>
      </Button>
      <div class="text-center">
        <p>
          Already have an account? <RouterLink to="/login" class="btn--link">Sign in</RouterLink>
        </p>
      </div>
      <div
        v-if="serverError"
        class="border-error bg-error-background text-error rounded-md border p-4 text-left text-sm"
      >
        {{ serverError }}
      </div>

      <div class="relative mt-9 py-2">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background text-muted px-4 tracking-wider">OR</span>
        </div>
      </div>
      <SocialLogins />
    </form>
  </AuthCard>
</template>
