<script setup lang="ts">
import { isAxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AuthCard from '@/components/authentication/AuthCard.vue'
import SocialLogins from '@/components/authentication/SocialLogins.vue'
import FormControl from '@/components/composables/FormControl.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useInvitationPrompt } from '@/composables/useInvitationPrompt'
import { useAuthStore } from '@/stores/auth-store'
import { useInvitationStore } from '@/stores/invitation-store'

const authStore = useAuthStore()
const invitationStore = useInvitationStore()
const router = useRouter()
const { promptToAcceptInvite } = useInvitationPrompt()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const errors = ref<string[]>([])
const serverError = ref('')
const isSubmitting = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const sanitize = (value: string) => value.trim()

onMounted(() => {
  rememberMe.value = authStore.rememberMePreference
  if (authStore.email) {
    email.value = authStore.email
  }
})

watch(
  () => rememberMe.value,
  (val) => authStore.setRememberPreference(val),
)

const isFormValid = () => {
  return email.value.trim() !== '' && password.value.trim() !== ''
}

const handleLogin = async () => {
  const sanitizedEmail = sanitize(email.value).toLowerCase()
  const sanitizedPassword = sanitize(password.value)

  const validationErrors: string[] = []

  if (!sanitizedEmail || !emailPattern.test(sanitizedEmail)) {
    validationErrors.push('Enter a valid company email.')
  }

  if (!sanitizedPassword) {
    validationErrors.push('Password is required.')
  } else if (sanitizedPassword.length < MIN_PASSWORD_LENGTH) {
    validationErrors.push('The email or password you entered is incorrect.')
  }

  errors.value = validationErrors
  if (validationErrors.length > 0) return

  isSubmitting.value = true
  serverError.value = ''
  authStore.setRememberPreference(rememberMe.value)

  try {
    const success = await authStore.login(
      {
        email: sanitizedEmail,
        password: sanitizedPassword,
      },
      rememberMe.value,
    )

    if (success) {
      const redirectQuery = router.currentRoute.value.query.redirect
      const redirectTarget = (typeof redirectQuery === 'string' && redirectQuery) || {
        name: 'organizations',
      }

      await router.push(redirectTarget)

      // If user came without a redirect but has a pending invite token, prompt after we leave the login screen
      if (!redirectQuery && invitationStore.token) {
        await promptToAcceptInvite()
      }
    }
  } catch (error) {
    if (isAxiosError(error)) {
      serverError.value =
        (error.response?.data as { message?: string })?.message ?? 'Unable to log in.'
    } else {
      serverError.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthCard header-text="Login to your account">
    <form class="space-y-6" @submit.prevent="handleLogin">
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
        label="Company Email"
        placeholder="Enter your registered email"
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

      <div class="flex items-center justify-between">
        <Label for="rememberMe" row>
          <Checkbox id="rememberMe" v-model="rememberMe" />
          Remember me
        </Label>
        <RouterLink to="/forgot-password" class="btn--link text-sm">Forgot password?</RouterLink>
      </div>

      <Button type="submit" class="w-full" :disabled="isSubmitting || !isFormValid()">
        <span v-if="!isSubmitting">Login</span>
        <span v-else>Checking credentials...</span>
      </Button>
      <p class="text-center text-sm">
        Don't have an account? <RouterLink to="/signup" class="btn--link">Sign up</RouterLink>
      </p>
      <div class="relative py-2">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background text-muted px-4 tracking-wider">OR</span>
        </div>
      </div>

      <SocialLogins :remember-me="rememberMe" />
    </form>
  </AuthCard>
</template>
