<script setup lang="ts">
import { ArrowRight, EllipsisVertical, Plus } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import OrganizationFormDialog from '@/components/dashboard/OrganizationFormDialog.vue'
import BrandLogo from '@/components/reusable/BrandLogo.vue'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'
import type { Organization } from '@/types/organization'

const organizationStore = useOrganizationStore()
const { organizations, loading, error } = storeToRefs(organizationStore)
const router = useRouter()
const authStore = useAuthStore()
const { confirm: openConfirm } = useConfirmDialog()

const pageLoading = ref(true)
const createDialogOpen = ref(false)
const createSaving = ref(false)
const createError = ref<string | null>(null)
const createFieldErrors = ref<Record<string, string[]> | null>(null)
const editDialogOpen = ref(false)
const editingOrg = ref<Organization | null>(null)
const editSaving = ref(false)
const editError = ref<string | null>(null)
const editFieldErrors = ref<Record<string, string[]> | null>(null)

const userEmail = computed(() => authStore.user?.email || authStore.email || '')

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'O'
  const first = parts[0]?.[0] || ''
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
  return `${first}${second}`.toUpperCase()
}

const ensureUserId = async () => {
  const immediateId = authStore.user?.id || authStore.user?.user_id
  if (immediateId) return immediateId
  const loadedUser = await authStore.loadCurrentUser()
  return loadedUser?.id || (loadedUser as { user_id?: string } | null)?.user_id || null
}

const openCreateOrganization = () => {
  createError.value = null
  createFieldErrors.value = null
  createDialogOpen.value = true
}

const goToOrganization = (organizationId: string) => {
  router.push({ name: 'organization-projects', params: { organizationId } })
}

const goToInvitations = () => router.push({ name: 'invitations' })
const goToMembers = (organizationId: string) =>
  router.push({ name: 'organization-members', params: { organizationId } })

const hasMoreOrganizations = computed(() => organizationStore.hasMoreOrganizations)

const loadMoreOrganizations = async () => {
  const userId = await ensureUserId()
  if (!userId) {
    organizationStore.setError('User information missing. Please re-login.')
    return
  }
  await organizationStore.fetchMoreOrganizations(userId)
}

const openEditOrganization = (org: Organization) => {
  editingOrg.value = org
  editError.value = null
  editFieldErrors.value = null
  editDialogOpen.value = true
}

const handleCreateSave = async (payload: {
  company_size?: string
  country?: string
  email?: string
  name: string
  industry: string
  job_title?: string
  org_type?: string
  location?: string
  logoFile?: File | null
}) => {
  createSaving.value = true
  createError.value = null
  createFieldErrors.value = null
  void payload.location
  void payload.logoFile

  const created = await organizationStore.addOrganization({
    company_size: payload.company_size || '',
    country: payload.country || '',
    email: payload.email || userEmail.value,
    name: payload.name,
    industry: payload.industry,
    job_title: payload.job_title || '',
    org_type: payload.org_type || '',
  })

  if (created) {
    createDialogOpen.value = false
    toast.success('Organization created successfully.')
    const userId = await ensureUserId()
    if (userId) {
      await organizationStore.fetchOrganizations(userId)
    }
  } else if (organizationStore.error) {
    createError.value = organizationStore.error
    createFieldErrors.value = organizationStore.fieldErrors
  } else if (organizationStore.fieldErrors) {
    createFieldErrors.value = organizationStore.fieldErrors
  }

  createSaving.value = false
}

const handleEditSave = async (payload: {
  company_size?: string
  country?: string
  email?: string
  name: string
  industry: string
  job_title?: string
  org_type?: string
  location?: string
  logoFile?: File | null
}) => {
  if (!editingOrg.value) return

  editSaving.value = true
  editError.value = null
  editFieldErrors.value = null

  const updatePayload: {
    name: string
    industry: string
    location?: string
    email?: string
    job_title?: string
    org_type?: string
    company_size?: string
    country?: string
  } = {
    name: payload.name,
    industry: payload.industry,
  }
  if (payload.location) {
    updatePayload.location = payload.location
  }
  if (payload.email) updatePayload.email = payload.email
  if (payload.job_title) updatePayload.job_title = payload.job_title
  if (payload.org_type) updatePayload.org_type = payload.org_type
  if (payload.company_size) updatePayload.company_size = payload.company_size
  if (payload.country) updatePayload.country = payload.country
  void payload.logoFile

  const updated = await organizationStore.updateOrganization(editingOrg.value.id, updatePayload)

  if (updated) {
    editDialogOpen.value = false
    toast.success('Organization updated successfully.')
  } else if (organizationStore.error) {
    editError.value = organizationStore.error
    editFieldErrors.value = organizationStore.fieldErrors
  } else if (organizationStore.fieldErrors) {
    editFieldErrors.value = organizationStore.fieldErrors
  }

  editSaving.value = false
}

const confirmDeleteOrganization = (org: Organization) => {
  openConfirm({
    title: 'Delete organization?',
    description: 'This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    async onConfirm() {
      const deleted = await organizationStore.deleteOrganization(org.id)

      if (deleted) {
        toast.success('Organization removed successfully.')
        if (!organizationStore.hasOrganizations) {
          router.replace({ name: 'create-organization' })
        }
      } else if (organizationStore.error) {
        toast.error(organizationStore.error)
      }
    },
  })
}

onMounted(async () => {
  const userId = await ensureUserId()
  if (!userId) {
    organizationStore.setError('User information missing. Please re-login.')
    pageLoading.value = false
    return
  }
  await organizationStore.fetchOrganizations(userId)
  pageLoading.value = false
})
</script>

<template>
  <main class="app-container min-h-screen flex-1 bg-gray-50">
    <div class="mx-auto max-w-3xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center text-center">
        <BrandLogo class="mb-6 h-10" />
        <p class="text-preset-heading-lg text-foreground">Welcome back! Ready to monitor.</p>
        <p class="text-muted text-preset-body-sm mt-1">
          Choose an organization below to continue your compliance watch.
        </p>
      </div>

      <div class="mt-8 w-full">
        <p class="text-preset-label-md text-gray-500">Ready to monitor</p>
        <p class="text-sm text-gray-700">{{ userEmail || 'Signed in' }}</p>
      </div>

      <div class="mt-4 w-full overflow-hidden rounded-sm border border-gray-100 bg-white shadow-sm">
        <div v-if="pageLoading" class="space-y-0">
          <div
            v-for="n in 4"
            :key="`org-skeleton-${n}`"
            class="flex items-center gap-4 border-b border-gray-100 px-6 py-5 last:border-b-0"
          >
            <div class="h-12 w-12 rounded-2xl bg-gray-200"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-40 rounded bg-gray-200"></div>
              <div class="h-3 w-28 rounded bg-gray-100"></div>
            </div>
          </div>
        </div>

        <div v-else-if="!loading && error && organizations.length === 0" class="px-6 py-8">
          <p class="text-error text-sm">{{ error }}</p>
          <button
            class="text-primary mt-3 text-sm underline"
            @click="authStore.user?.id && organizationStore.fetchOrganizations(authStore.user.id)"
          >
            Retry
          </button>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="org in organizations"
            :key="org.id"
            class="hover:bg-muted/10 flex items-center justify-between gap-4"
          >
            <button
              class="flex flex-1 cursor-pointer items-center gap-4 px-4 py-4 text-left"
              type="button"
              @click="goToOrganization(org.id)"
            >
              <div
                class="bg-muted/10 text-foreground flex h-12 w-12 items-center justify-center rounded-sm text-sm font-semibold"
              >
                {{ getInitials(org.name) }}
              </div>
              <div class="space-y-1">
                <p class="text-foreground text-sm font-semibold">{{ org.name }}</p>
                <p class="text-muted text-xs">
                  {{ org.industry || 'Industry not specified' }}
                </p>
              </div>
            </button>
            <div class="flex items-center gap-2 pe-4">
              <button
                class="text-muted hover:text-foreground flex items-center"
                type="button"
                @click="goToOrganization(org.id)"
              >
                <ArrowRight class="h-4 w-4" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button class="text-muted hover:text-foreground" type="button" @click.stop>
                    <EllipsisVertical :size="18" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click.stop="goToMembers(org.id)"> Members </DropdownMenuItem>
                  <DropdownMenuItem @click.stop="openEditOrganization(org)">
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="text-red-600"
                    @click.stop="confirmDeleteOrganization(org)"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center"
      >
        <div>
          <p class="text-sm font-semibold text-gray-900">Need a different organization?</p>
          <p class="text-xs text-gray-500">Create a new organization to start monitoring.</p>
        </div>
        <button class="btn--with-icon btn--secondary btn--sm" @click="openCreateOrganization">
          <Plus :size="14" />
          Create Organization
        </button>
      </div>

      <div class="mt-8 w-full">
        <div class="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
          <p class="text-sm font-semibold text-gray-900">Pending invitations</p>
          <p class="text-xs text-gray-500">
            Review organization invites waiting for your response.
          </p>
          <button class="btn--default btn--sm mt-4" @click="goToInvitations">
            View Invitations
          </button>
        </div>
      </div>

      <div v-if="hasMoreOrganizations" class="mt-8 flex justify-center">
        <button
          class="btn--default btn--lg"
          :disabled="organizationStore.loadingMore"
          @click="loadMoreOrganizations"
        >
          <span v-if="organizationStore.loadingMore">Loading...</span>
          <span v-else>Load more</span>
        </button>
      </div>
    </div>

    <!-- Keep Edit Dialog -->
    <OrganizationFormDialog
      v-if="createDialogOpen"
      v-model:open="createDialogOpen"
      :initial-name="''"
      :initial-industry="''"
      :initial-location="''"
      :initial-logo-url="''"
      :initial-email="userEmail"
      mode="create"
      title="Create organization"
      submit-label="Create organization"
      :loading="createSaving"
      :error="createError"
      :field-errors="createFieldErrors"
      @save="handleCreateSave"
    />
    <OrganizationFormDialog
      v-if="editDialogOpen && editingOrg"
      v-model:open="editDialogOpen"
      :initial-name="editingOrg.name"
      :initial-email="editingOrg.email || userEmail"
      :initial-industry="editingOrg.industry || ''"
      :initial-job-title="editingOrg.job_title || ''"
      :initial-org-type="editingOrg.org_type || ''"
      :initial-company-size="editingOrg.company_size || ''"
      :initial-country="editingOrg.country || ''"
      :initial-location="''"
      :initial-logo-url="''"
      title="Edit organization"
      submit-label="Save changes"
      :loading="editSaving"
      :error="editError"
      :field-errors="editFieldErrors"
      @save="handleEditSave"
    />
  </main>
</template>
