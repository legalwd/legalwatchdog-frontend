<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import AuthCard from '@/components/authentication/AuthCard.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

const authStore = useAuthStore()
const router = useRouter()

const message = computed(
  () =>
    authStore.pendingApprovalMessage ||
    "Your account is pending approval. You'll receive an email once it's approved.",
)

const handleLogout = async () => {
  await authStore.logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <AuthCard header-text="Account pending approval">
    <template #desc>
      <p class="mt-2 text-sm text-gray-600">
        {{ message }}
      </p>
    </template>

    <div class="mt-8 flex flex-col gap-3">
      <RouterLink :to="{ name: 'contact-us' }" class="btn--default btn--lg w-full text-center">
        Contact support
      </RouterLink>
      <Button variant="secondary" class="w-full" type="button" @click="handleLogout">
        Log out
      </Button>
    </div>
  </AuthCard>
</template>
