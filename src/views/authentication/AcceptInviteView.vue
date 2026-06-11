<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import BrandLogo from '@/components/reusable/BrandLogo.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAuthStore } from '@/stores/auth-store'
import { useInvitationStore } from '@/stores/invitation-store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const invitationStore = useInvitationStore()
const { confirm: openConfirm } = useConfirmDialog()

const accepting = ref(false)

onMounted(async () => {
  authStore.syncAuthFromStorage()
  const token = typeof route.params.token === 'string' ? route.params.token : ''

  if (authStore.isAuthenticated) {
    openConfirm({
      title: 'Accept this invitation?',
      description: 'Join this organization now or come back later.',
      confirmText: 'Accept invite',
      cancelText: 'Later',
      closeImmediately: true,
      async onConfirm() {
        if (!token) return
        accepting.value = true
        try {
          const result = await invitationStore.acceptInvitation(token)
          const organizationId = result.data?.organization_id || null
          toast.success(result.message)
          if (organizationId) {
            router.push({ name: 'organization-profile', params: { organizationId } })
          }
        } catch (error) {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || ''
          if (message) {
            toast.error(message)
          }
          router.push({ name: 'invitations' })
        } finally {
          invitationStore.setToken(null)
          accepting.value = false
        }
      },
      onCancel() {
        invitationStore.setToken(null)
        router.push({ name: 'invitations' })
      },
    })
    return
  }

  openConfirm({
    title: 'Sign in to accept invite',
    description: 'To accept this invitation, please sign in.',
    confirmText: 'Login',
    cancelText: 'Later',
    closeImmediately: true,
    onConfirm() {
      if (token) {
        invitationStore.setToken(token)
      }
      router.push({ name: 'login', query: { redirect: route.fullPath } })
    },
    onCancel() {
      router.push({ name: 'home' })
    },
  })
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
    <div class="bg-background w-full rounded-xl p-8 text-center shadow-sm ring-1 ring-gray-200">
      <div class="mb-4 flex h-full items-center justify-center"><BrandLogo /></div>
      <h1 class="text-xl font-semibold">Processing invitation</h1>
      <p class="mt-2 text-sm">
        {{
          accepting
            ? 'Hang tight while we confirm your invitation...'
            : 'Follow the prompts to continue.'
        }}
      </p>
    </div>
  </main>
</template>
