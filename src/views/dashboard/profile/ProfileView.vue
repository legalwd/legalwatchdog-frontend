<script setup lang="ts">
import { EllipsisVertical } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { organizationService } from '@/api/organization'
import { userService } from '@/api/user'
import UserProfileEditDialog from '@/components/dashboard/UserProfileEditDialog.vue'
import ProfileHeroSection from '@/components/reusable/ProfileHeroSection.vue'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'
import type { UserOrganizationDetails } from '@/types/organization'

const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const router = useRouter()
const {
  organizations,
  loading: organizationsLoading,
  error: organizationsError,
} = storeToRefs(organizationStore)
const organizationDetails = ref<Record<string, UserOrganizationDetails>>({})

const profileDialogOpen = ref(false)
const savingProfile = ref(false)
const uploadingImage = ref(false)
const editingName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const user = computed(() => authStore.user)
const fullName = computed(() => {
  if (user.value?.name) return user.value.name
  const first = user.value?.first_name ?? ''
  const last = user.value?.last_name ?? ''
  return `${first} ${last}`.trim()
})
const normalizeRole = (role?: string | null) => {
  const normalized = role?.toLowerCase() || ''
  if (normalized === 'owner') return 'Owner'
  if (normalized === 'admin') return 'Admin'
  if (normalized === 'member') return 'Member'
  return ''
}

const roleTitle = computed(() => {
  const directRole = normalizeRole(user.value?.role)
  if (directRole) return directRole
  const orgRole = normalizeRole(organizations.value[0]?.user_role)
  return orgRole
})
const email = computed(() => user.value?.email || '')
const avatarUrl = computed(() => user.value?.avatar_url || user.value?.profile_picture_url || '')

const openProfileDialog = () => {
  editingName.value = fullName.value
  profileDialogOpen.value = true
}

const handleSaveProfile = async () => {
  if (!user.value) return
  savingProfile.value = true
  try {
    const response = await userService.updateProfile({ name: editingName.value.trim() })
    const payload = response.data?.data ?? response.data
    if (payload) {
      authStore.user = { ...user.value, ...payload }
    } else if (editingName.value.trim()) {
      authStore.user = { ...user.value, name: editingName.value.trim() }
    }
    toast.success('Profile updated successfully')
    profileDialogOpen.value = false
  } catch (error) {
    console.error('Failed to update profile', error)
    toast.error('Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

const openImagePicker = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file || !user.value) return

  uploadingImage.value = true
  try {
    const response = await userService.uploadProfilePicture(file)
    const url = response.data?.data?.profile_picture_url
    if (url) {
      authStore.user = {
        ...user.value,
        avatar_url: url,
        profile_picture_url: url,
      }
    }
    toast.success('Profile image updated')
  } catch (error) {
    console.error('Failed to upload profile image', error)
    toast.error('Failed to update profile image')
  } finally {
    uploadingImage.value = false
    if (target) target.value = ''
  }
}

const handleAddMembers = (organizationId: string) => {
  if (!organizationId) return
  router.push({ name: 'organization-members', params: { organizationId } })
}

const handleSignOut = async () => {
  await authStore.logout()
  router.replace({ name: 'login' })
}

const getProjectCount = (organizationId: string | undefined, fallback?: number) => {
  if (!organizationId) return fallback ?? 0
  const count = organizationDetails.value[organizationId]?.projects_count
  if (typeof count === 'number') return count
  return fallback ?? 0
}

const fetchOrganizationDetails = async (organizationIds: string[]) => {
  if (!organizationIds.length) return
  const results = await Promise.allSettled(
    organizationIds.map((organizationId) =>
      organizationService.getOrganizationById(organizationId),
    ),
  )
  const nextDetails = { ...organizationDetails.value }
  results.forEach((result, index) => {
    if (result.status !== 'fulfilled') return
    const organizationId = organizationIds[index]
    if (!organizationId) return
    const payload = result.value?.data?.data ?? result.value?.data
    if (payload && typeof payload === 'object') {
      nextDetails[organizationId] = payload as UserOrganizationDetails
    }
  })
  organizationDetails.value = nextDetails
}

const ensureUserId = async () => {
  const existing = authStore.user?.id || authStore.user?.user_id
  if (existing) return existing
  const loaded = await authStore.loadCurrentUser()
  return loaded?.id || loaded?.user_id || null
}

onMounted(async () => {
  const userId = await ensureUserId()
  if (userId) {
    await organizationStore.fetchOrganizations(userId, { prefetchSecondPage: false })
  }
})

watch(
  organizations,
  (list) => {
    const ids = list.map((org) => org.id).filter((id): id is string => Boolean(id))
    const missing = ids.filter((id) => !organizationDetails.value[id])
    if (missing.length) {
      void fetchOrganizationDetails(missing)
    }
  },
  { immediate: true },
)
</script>

<template>
  <main class="app-container pt-6 pb-10 md:pt-8 md:pb-14">
    <div class="flex flex-col gap-8">
      <header>
        <h1 class="text-preset-heading-md text-foreground">Profile Information</h1>
      </header>

      <ProfileHeroSection
        :image-src="avatarUrl"
        :image-name="fullName"
        editable
        :image-loading="uploadingImage"
        :image-disabled="uploadingImage"
        @edit="openProfileDialog"
      >
        <h2 v-if="fullName" class="text-preset-heading-md text-foreground">{{ fullName }}</h2>
        <p v-if="roleTitle" class="text-preset-body-sm text-foreground">{{ roleTitle }}</p>
        <p v-if="email" class="text-preset-body-sm text-muted">{{ email }}</p>
      </ProfileHeroSection>

      <section class="border-border bg-background rounded-lg border p-5">
        <div class="flex items-center justify-between">
          <h3 class="text-preset-body-md text-foreground font-semibold">Organizations</h3>
        </div>
        <div v-if="organizationsLoading" class="mt-4 space-y-3">
          <div class="border-border bg-muted-background h-16 animate-pulse rounded-md border"></div>
          <div class="border-border bg-muted-background h-16 animate-pulse rounded-md border"></div>
        </div>
        <p v-else-if="organizationsError" class="text-preset-body-sm text-error mt-4">
          {{ organizationsError }}
        </p>
        <p v-else-if="!organizations.length" class="text-preset-body-sm text-muted mt-4">
          No organizations available.
        </p>
        <div v-else class="mt-4 flex flex-col gap-3">
          <div
            v-for="organization in organizations"
            :key="organization.id"
            class="profile-list-card flex items-start justify-between gap-4 sm:items-center"
          >
            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-1">
                <p class="text-preset-body-md text-foreground font-semibold">
                  {{ organization.name }}
                </p>
                <p v-if="organization.industry" class="text-preset-body-sm text-muted">
                  {{ organization.industry }}
                </p>
              </div>
              <p class="text-preset-body-sm text-muted">
                Projects available:
                {{ getProjectCount(organization.id, organization.project_count) }}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  class="btn btn--icon-only text-muted hover:text-foreground"
                  type="button"
                  aria-label="Organization actions"
                >
                  <EllipsisVertical :size="20" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="handleAddMembers(organization.id)">
                  Add Members
                </DropdownMenuItem>
                <DropdownMenuItem class="text-error" @click="handleSignOut">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      <section class="border-border bg-background rounded-lg border p-5">
        <h3 class="text-preset-body-md text-foreground font-semibold">Security</h3>
        <div class="border-border bg-background mt-4 rounded-md border p-4">
          <p class="text-preset-body-sm text-muted">Coming soon.</p>
        </div>
      </section>

      <section class="border-border bg-background rounded-lg border p-5">
        <h3 class="text-preset-body-md text-foreground font-semibold">Active Devices</h3>
        <div class="border-border bg-background mt-4 rounded-md border p-4">
          <p class="text-preset-body-sm text-muted">Coming soon.</p>
        </div>
      </section>
    </div>

    <UserProfileEditDialog
      :open="profileDialogOpen"
      title="Edit Profile"
      :name="editingName"
      :email="email"
      :avatar-url="avatarUrl"
      :loading-image="uploadingImage"
      :saving="savingProfile"
      :show-role="false"
      @update:open="profileDialogOpen = $event"
      @update:name="editingName = String($event)"
      @save="handleSaveProfile"
      @edit-image="openImagePicker"
    />
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleImageUpload"
    />
  </main>
</template>
