<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { useAuthStore } from '@/stores/auth-store'
import { useInvitationStore } from '@/stores/invitation-store'
import { useOrganizationStore } from '@/stores/organization-store'

const router = useRouter()
const invitationStore = useInvitationStore()
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()
const { invitations, loading, error } = storeToRefs(invitationStore)
const pageLoading = ref(true)

const ensureUserId = async () => {
  const immediateId = authStore.user?.id || authStore.user?.user_id
  if (immediateId) return immediateId
  const loadedUser = await authStore.loadCurrentUser()
  return loadedUser?.id || (loadedUser as { user_id?: string } | null)?.user_id || null
}

const loadInvitations = async () => {
  await invitationStore.fetchMyInvitations()
}

const acceptInvite = async (token: string) => {
  try {
    const result = await invitationStore.acceptInvitation(token)
    toast.success(result.message || 'Invitation accepted')

    const userId = await ensureUserId()
    if (userId) {
      await organizationStore.fetchOrganizations(userId)
    }
  } catch (err) {
    toast.error(invitationStore.error || 'Could not accept invitation')
    void err
  }
}

const goToOrganizations = () => router.push({ name: 'organizations' })

onMounted(async () => {
  await loadInvitations()
  pageLoading.value = false
})
</script>

<template>
  <main class="app-container min-h-screen flex-1 bg-gray-50">
    <section class="mx-auto max-w-4xl py-8 sm:py-12">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Invitations</p>
          <h1 class="text-3xl font-bold text-gray-900 lg:text-4xl">Organization invites</h1>
          <p class="mt-1 text-sm">Review and accept invitations to join organizations.</p>
        </div>
        <div class="flex flex-wrap items-end gap-3">
          <button class="btn--link" @click="loadInvitations">Refresh</button>
          <button class="btn--link" @click="goToOrganizations">Back to Organizations</button>
        </div>
      </div>

      <div v-if="pageLoading || loading" class="space-y-3">
        <div
          v-for="n in 4"
          :key="n"
          class="bg-background h-14 animate-pulse rounded-xl shadow-sm"
        ></div>
      </div>

      <div
        v-else-if="error"
        class="text-error rounded-2xl border border-red-100 bg-red-50 p-6 text-sm"
      >
        {{ error }}
      </div>

      <div
        v-else-if="!invitations.length"
        class="bg-background rounded-2xl p-8 text-center shadow-sm"
      >
        <h2 class="text-xl font-semibold text-gray-900">No pending invitations</h2>
        <p class="mt-2 text-sm">
          When someone invites you to their organization, it will show up here.
        </p>
      </div>

      <div v-else class="space-y-3">
        <article
          v-for="invite in invitations"
          :key="invite.token"
          class="bg-background flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 shadow-sm"
        >
          <div>
            <p class="text-sm font-semibold text-gray-900">
              {{ invite.organization_name || 'Organization Invitation' }}
            </p>
            <p class="text-xs text-gray-500">
              Role: {{ invite.role_name || invite.role || 'Member' }}
            </p>
          </div>
          <button class="btn--default btn--lg" @click="acceptInvite(invite.token)">Accept</button>
        </article>
      </div>
    </section>
  </main>
</template>
