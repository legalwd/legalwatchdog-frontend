<script setup lang="ts">
import { AlertCircle } from '@hugeicons/core-free-icons'
import { isAxiosError } from 'axios'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AuthCard from '@/components/authentication/AuthCard.vue'
import Icon from '@/components/reusable/Icon.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const DIGIT_COUNT = 6

const otpDigits = ref<string[]>(Array(DIGIT_COUNT).fill(''))
const digitInputs = ref<Array<HTMLInputElement | null>>([])
const otpContainerRef = ref<HTMLDivElement | null>(null)
const timer = ref(0)
const errorMessage = ref('')
const successMessage = ref('')
const isVerifying = ref(false)
const isResending = ref(false)
let interval: ReturnType<typeof setInterval> | null = null

const email = computed(() => authStore.email)
const otpPurpose = computed(
  () =>
    authStore.otpPurpose ?? (route.query.flow === 'password-reset' ? 'password-reset' : 'signup'),
)

const obfuscatedEmail = computed(() => {
  if (!email.value) return ''
  const [username, domain] = email.value.split('@')
  if (!domain) return email.value
  const firstChar = username && username.length > 0 ? username[0] : ''
  return `${firstChar}*****@${domain}`
})

const subtitle = computed(() =>
  otpPurpose.value === 'password-reset'
    ? 'We have sent an email with password reset information to'
    : 'We have sent an email with sign up OTP code information to',
)
const headingText = computed(() =>
  otpPurpose.value === 'password-reset' ? 'We have sent an email.' : 'Verify your email',
)
const backRoute = computed(() =>
  otpPurpose.value === 'password-reset' ? { name: 'forgot-password' } : { name: 'signup' },
)
const isPasswordResetFlow = computed(() => otpPurpose.value === 'password-reset')
const backText = computed(() =>
  isPasswordResetFlow.value ? 'Back to login screen' : 'Back to sign up',
)
const isComplete = computed(() => otpDigits.value.join('').length === DIGIT_COUNT)
const timerDuration = computed(() => (isPasswordResetFlow.value ? 5 * 60 : 5 * 60))

const startTimer = (seconds?: number) => {
  timer.value = typeof seconds === 'number' ? seconds : timerDuration.value
  if (interval) {
    clearInterval(interval)
  }
  interval = setInterval(() => {
    if (timer.value <= 0) {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      return
    }
    timer.value--
  }, 1000)
}

onMounted(() => {
  if (!authStore.otpPurpose) {
    authStore.setOtpPurpose(otpPurpose.value)
  }
  if (!email.value) {
    router.replace(backRoute.value)
    return
  }
  startTimer()

  // Add paste event listener to the container
  if (otpContainerRef.value) {
    otpContainerRef.value.addEventListener('paste', handleContainerPaste)
  }
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
  // Remove paste event listener
  if (otpContainerRef.value) {
    otpContainerRef.value.removeEventListener('paste', handleContainerPaste)
  }
})

watchEffect(() => {
  if (!email.value) {
    router.replace(backRoute.value)
  }
})

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const handleDigitInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').slice(0, 1)
  otpDigits.value[index] = value
  target.value = value

  if (value && index < digitInputs.value.length - 1) {
    digitInputs.value[index + 1]?.focus()
  }
}

const handleKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace') {
    if (otpDigits.value[index]) {
      otpDigits.value[index] = ''
      return
    }
    if (index > 0) {
      digitInputs.value[index - 1]?.focus()
    }
  }
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    digitInputs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index < digitInputs.value.length - 1) {
    event.preventDefault()
    digitInputs.value[index + 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent, index: number) => {
  event.preventDefault()
  const paste = event.clipboardData?.getData('text') ?? ''
  const digits = paste.replace(/\D/g, '').split('')

  // Fill all digits starting from the current index
  for (let i = 0; i < DIGIT_COUNT; i++) {
    const targetIndex = index + i
    if (targetIndex < DIGIT_COUNT) {
      const digit = digits[i]
      if (digit) {
        otpDigits.value[targetIndex] = digit
        const input = digitInputs.value[targetIndex]
        if (input) input.value = digit
      } else {
        otpDigits.value[targetIndex] = ''
        const input = digitInputs.value[targetIndex]
        if (input) input.value = ''
      }
    }
  }

  // Focus on the last input or the next empty input
  const lastFilledIndex = Math.min(index + digits.length, DIGIT_COUNT - 1)
  digitInputs.value[lastFilledIndex]?.focus()
}

// Alternative: Paste anywhere in the container
const handleContainerPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const paste = event.clipboardData?.getData('text') ?? ''
  const digits = paste.replace(/\D/g, '').split('').slice(0, DIGIT_COUNT)

  // Fill all digits from the beginning
  for (let i = 0; i < DIGIT_COUNT; i++) {
    const digit = digits[i]
    otpDigits.value[i] = digit || ''
    const input = digitInputs.value[i]
    if (input) input.value = digit || ''
  }

  // Focus on the next empty input or the last one
  const firstEmptyIndex = otpDigits.value.findIndex((digit) => !digit)
  const focusIndex =
    firstEmptyIndex === -1 ? DIGIT_COUNT - 1 : Math.min(firstEmptyIndex, DIGIT_COUNT - 1)
  digitInputs.value[focusIndex]?.focus()
}

const handleContinue = async () => {
  if (!email.value) {
    router.replace(backRoute.value)
    return
  }

  const code = otpDigits.value.join('').trim()

  if (!code || code.length < DIGIT_COUNT) {
    errorMessage.value = 'Enter the 6-digit OTP sent to your email.'
    return
  }

  isVerifying.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (isPasswordResetFlow.value) {
      const response = await authStore.verifyPasswordReset({ email: email.value, code })
      const resetToken =
        response?.reset_token ?? response?.data?.reset_token ?? authStore.resetToken
      if (!resetToken) {
        throw new Error('Missing reset token from server response.')
      }
      successMessage.value =
        response?.message ?? 'Code verified. You can now create a new password.'
      router.replace({ name: 'reset-password' })
    } else {
      const response = await authStore.verifyOTP({
        email: email.value,
        code,
        otp_purpose: otpPurpose.value ?? 'signup',
      })

      successMessage.value = (response?.message as string) ?? 'Your account is verified.'

      await authStore.syncAuthFromStorage()
      router.replace({ name: 'create-organization' })
    }
  } catch (error) {
    if (isAxiosError(error)) {
      errorMessage.value =
        (error.response?.data as { message?: string })?.message ?? 'OTP verification failed.'
    } else {
      errorMessage.value = 'Unable to verify OTP. Please try again.'
    }

    if (!isPasswordResetFlow.value) {
      router.push({
        name: 'auth-status',
        query: {
          status: 'error',
          context: 'signup',
          issued: 'true',
          message: errorMessage.value,
        },
      })
    }
  } finally {
    isVerifying.value = false
  }
}

const handleResend = async () => {
  if (timer.value > 0) return
  if (!email.value) {
    router.replace(backRoute.value)
    return
  }

  isResending.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = isPasswordResetFlow.value
      ? await authStore.requestPasswordReset(email.value)
      : await authStore.resendOTP(email.value)

    otpDigits.value = Array(DIGIT_COUNT).fill('')
    digitInputs.value.forEach((input) => {
      if (input) input.value = ''
    })

    successMessage.value = response?.message ?? 'A new OTP has been sent to your email.'
    startTimer(5 * 60)
  } catch (error) {
    if (isAxiosError(error)) {
      errorMessage.value =
        (error.response?.data as { message?: string })?.message ?? 'Unable to resend OTP.'
    } else {
      errorMessage.value = 'Unable to resend OTP. Please try again.'
    }
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <AuthCard :header-text="headingText" class="text-center">
    <template #desc>
      <p class="text-base">
        {{ subtitle }}
        <span class="text-foreground font-semibold">{{ obfuscatedEmail }}</span>
      </p>
    </template>
    <div
      class="flex w-full max-w-5xl flex-col gap-10 px-2 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="w-full max-w-xl space-y-8">
        <!-- Added ref to the container for paste anywhere -->
        <div ref="otpContainerRef" class="flex justify-between gap-3">
          <input
            v-for="(_, index) in otpDigits"
            :key="index"
            ref="digitInputs"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            class="focus:ring-primary size-10 rounded-md border text-center text-lg font-medium ring-offset-0 focus:ring-2 sm:size-14"
            :value="otpDigits[index]"
            @input="handleDigitInput($event, index)"
            @keydown="handleKeydown($event, index)"
            @paste="handlePaste($event, index)"
          />
        </div>

        <div class="space-y-8">
          <Button
            type="button"
            :disabled="isVerifying || !isComplete"
            class="w-full"
            @click="handleContinue"
          >
            <span v-if="!isVerifying">Continue</span>
            <span v-else>Verifying...</span>
          </Button>

          <RouterLink
            :to="backRoute"
            class="btn--link flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeftIcon :size="18" />
            <span>{{ backText }}</span>
          </RouterLink>

          <div class="text-primary flex items-center justify-center gap-2 text-sm font-medium">
            <span>Didn't receive the link?</span>
            <span v-if="isResending">Sending...</span>
            <span v-else-if="timer > 0">{{ formatTime(timer) }}</span>
            <button
              v-else
              type="button"
              :disabled="timer > 0 || isResending"
              class="btn--link disabled:link--disabled"
              @click="handleResend"
            >
              <span>Resend Code</span>
            </button>
          </div>
        </div>

        <div
          v-if="errorMessage"
          class="bg-error-background text-error border-error rounded-md border p-3 text-sm"
        >
          {{ errorMessage }}
        </div>
        <div
          v-if="successMessage"
          class="border-success bg-success-background text-success rounded-md border p-3 text-sm"
        >
          {{ successMessage }}
        </div>
      </div>
    </div>

    <div
      class="bg-peach-amber-50 mt-4 flex flex-row justify-start gap-4 rounded-2xl p-4 text-start"
    >
      <div>
        <Icon :icon="AlertCircle" class="text-accent size-8" />
      </div>
      <div class="text-sm">
        <h3 class="mb-4 text-lg font-medium">Having Troubles?</h3>
        <p class="mb-2">
          If you don't receive an email within a few minutes, check your spam folder or
          <RouterLink
            :to="{ name: 'contact-us' }"
            class="text-blue-500 underline hover:no-underline"
            >contact support</RouterLink
          >.
        </p>
      </div>
    </div>
  </AuthCard>
</template>
