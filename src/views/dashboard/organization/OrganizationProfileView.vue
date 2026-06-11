<script setup lang="ts">
import { EllipsisVertical } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { organizationService } from '@/api/organization'
import OrganizationFormDialog from '@/components/dashboard/OrganizationFormDialog.vue'
import UserProfileEditDialog from '@/components/dashboard/UserProfileEditDialog.vue'
import ProfileHeroSection from '@/components/reusable/ProfileHeroSection.vue'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import { Label } from '@/components/ui/label'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'
import type { OrganizationMember, UserOrganizationDetails } from '@/types/organization'
import type { UserProfile } from '@/types/user'

type MemberStatus = 'Active' | 'Pending' | 'Inactive'

type Member = {
  id: string
  name: string
  email: string
  role: string
  status: MemberStatus
  lastActive: string
  avatarUrl?: string
}

const route = useRoute()
const router = useRouter()
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()
const { confirm: openConfirm } = useConfirmDialog()
const orgId = computed(() => {
  const id = route.params.organizationId
  return typeof id === 'string' ? id : ''
})
const members = ref<Member[]>([])
const membersLoading = ref(false)
const membersError = ref<string | null>(null)
const selectedMemberIds = ref<string[]>([])
const bulkDeleting = ref(false)
const organizationDetails = ref<UserOrganizationDetails | null>(null)
const detailsLoading = ref(false)
const activeMember = ref<Member | null>(null)
const orgEditDialogOpen = ref(false)
const orgEditSaving = ref(false)
const orgEditError = ref<string | null>(null)
const orgEditFieldErrors = ref<Record<string, string[]> | null>(null)
const orgName = computed(() => organizationDetails.value?.name || '')
const orgIndustry = computed(() => organizationDetails.value?.industry || '')
const orgLocation = computed(() => organizationDetails.value?.location || '')
const planLabel = computed(() => organizationDetails.value?.plan || '')
const orgLogoUrl = computed(() => organizationDetails.value?.logo_url || '')
const teamMembersCount = computed(() => members.value.length)
const hasSelection = computed(() => selectedMemberIds.value.length > 0)

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('')

const formatRelativeTime = (dateString?: string | null) => {
  if (!dateString) return 'Not available'
  const timestamp = new Date(dateString).getTime()
  if (Number.isNaN(timestamp)) return 'Not available'
  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(timestamp).toLocaleDateString()
}

const statusClass = (status: MemberStatus) =>
  status === 'Active'
    ? 'text-success bg-success-background border-[var(--color-green-100)]'
    : status === 'Pending'
      ? 'text-[var(--color-orange-800)] bg-[var(--color-orange-50)] border-[var(--color-orange-200)]'
      : 'text-muted bg-[var(--color-gray-50)] border-border'

const toggleMemberSelection = (memberId: string, isChecked: boolean) => {
  if (isChecked) {
    if (!selectedMemberIds.value.includes(memberId)) {
      selectedMemberIds.value = [...selectedMemberIds.value, memberId]
    }
    return
  }
  selectedMemberIds.value = selectedMemberIds.value.filter((id) => id !== memberId)
}
const fetchOrganizationDetails = async () => {
  if (!orgId.value) return
  detailsLoading.value = true
  try {
    const userId = authStore.user?.id || (await authStore.loadCurrentUser?.())?.id
    if (!userId) return
    const { data } = await organizationService.getUserOrganizationDetails(userId, orgId.value)
    organizationDetails.value = (data?.data as UserOrganizationDetails | undefined) ?? null
  } catch (error) {
    console.error('Failed to fetch organization details', error)
  } finally {
    detailsLoading.value = false
  }
}
const mapUserToMember = (user: OrganizationMember | UserProfile): Member => {
  const isOrganizationMember = 'membership_active' in user || 'role_id' in user
  const memberId =
    ('user_id' in user && user.user_id) ||
    ('id' in user && typeof user.id === 'string' ? user.id : '') ||
    ''
  const fullName =
    user.name ||
    (!isOrganizationMember
      ? `${(user as UserProfile).first_name ?? ''} ${(user as UserProfile).last_name ?? ''}`.trim()
      : '')
  const normalizedRole = (user.role || '').toLowerCase()
  const roleLabel =
    normalizedRole === 'owner'
      ? 'Owner'
      : normalizedRole === 'admin'
        ? 'Admin'
        : normalizedRole === 'manager'
          ? 'Manager'
          : 'Member'
  const membershipActive = 'membership_active' in user ? user.membership_active : undefined
  const status: MemberStatus =
    normalizedRole === 'owner'
      ? 'Active'
      : membershipActive === false
        ? 'Inactive'
        : membershipActive === true
          ? 'Active'
          : 'Pending'
  const lastActiveSource =
    'joined_at' in user && user.joined_at
      ? user.joined_at
      : 'created_at' in user && user.created_at
        ? user.created_at
        : 'updated_at' in user
          ? user.updated_at
          : null
  const avatarUrl =
    user.avatar_url ||
    ('profile_picture_url' in user ? (user as UserProfile).profile_picture_url : undefined)

  const mapped: Member = {
    id: memberId,
    name: fullName?.trim() || 'Unknown User',
    email: user.email || '',
    role: roleLabel,
    status,
    lastActive: formatRelativeTime(lastActiveSource),
  }

  if (avatarUrl) {
    mapped.avatarUrl = avatarUrl
  }
  return mapped
}
const fetchMembers = async () => {
  if (!orgId.value) return
  membersLoading.value = true
  membersError.value = null
  try {
    const { data } = await organizationService.listOrganizationUsers(orgId.value)
    const users = data.data?.users ?? []
    members.value = (users as Array<OrganizationMember | UserProfile>).map(mapUserToMember)
    selectedMemberIds.value = selectedMemberIds.value.filter((id) =>
      members.value.some((member) => member.id === id),
    )
  } catch (_error) {
    membersError.value = 'Failed to load members'
  } finally {
    membersLoading.value = false
  }
}
const openEditOrganization = () => {
  if (!organizationDetails.value) return
  orgEditError.value = null
  orgEditFieldErrors.value = null
  orgEditDialogOpen.value = true
}
const handleOrgSave = async (payload: {
  name: string
  industry: string
  location?: string
  email?: string
  job_title?: string
  org_type?: string
  company_size?: string
  country?: string
  logoFile?: File | null
}) => {
  if (!orgId.value) return

  orgEditSaving.value = true
  orgEditError.value = null
  orgEditFieldErrors.value = null

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
  const updated = await organizationStore.updateOrganization(orgId.value, updatePayload)

  if (updated) {
    orgEditDialogOpen.value = false
    toast.success('Organization updated successfully')
    await fetchOrganizationDetails()
  } else if (organizationStore.error) {
    orgEditError.value = organizationStore.error
    orgEditFieldErrors.value = organizationStore.fieldErrors
    toast.error(organizationStore.error)
  } else if (organizationStore.fieldErrors) {
    orgEditFieldErrors.value = organizationStore.fieldErrors
  }

  orgEditSaving.value = false
}
const confirmDeleteOrganization = async () => {
  if (!orgId.value || !organizationDetails.value) return

  openConfirm({
    title: 'Delete organization?',
    description: 'This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    async onConfirm() {
      const deleted = await organizationStore.deleteOrganization(orgId.value)

      if (deleted) {
        toast.success('Organization removed successfully')
        if (!organizationStore.hasOrganizations) {
          router.replace({ name: 'create-organization' })
        } else {
          router.push({ name: 'organizations' })
        }
      } else if (organizationStore.error) {
        toast.error(organizationStore.error)
      }
    },
  })
}
const clearSelection = () => {
  selectedMemberIds.value = []
}
const openMemberDetails = (member: Member) => {
  activeMember.value = member
}

const handleBulkDelete = async () => {
  if (!orgId.value || !hasSelection.value || bulkDeleting.value) return
  const count = selectedMemberIds.value.length
  openConfirm({
    title: `Delete ${count} member${count === 1 ? '' : 's'}?`,
    description: 'This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    async onConfirm() {
      bulkDeleting.value = true
      const idsToDelete = [...selectedMemberIds.value]
      const results = await Promise.allSettled(
        idsToDelete.map((memberId) => organizationService.deleteMember(orgId.value, memberId)),
      )

      const succeeded = results
        .map((result, index) => ({ result, id: idsToDelete[index] }))
        .filter(({ result }) => result.status === 'fulfilled')
        .map(({ id }) => id)
      const failed = results.length - succeeded.length
      const firstError = results.find((result) => result.status === 'rejected')
      const errorMessage =
        firstError && firstError.status === 'rejected'
          ? firstError.reason?.response?.data?.message || 'Some members could not be removed'
          : 'Some members could not be removed'

      members.value = members.value.filter((member) => !succeeded.includes(member.id))
      selectedMemberIds.value = selectedMemberIds.value.filter((id) => !succeeded.includes(id))

      if (failed) {
        toast.error(errorMessage)
      } else {
        toast.success('Selected members removed')
      }
      bulkDeleting.value = false
    },
  })
}

watch(
  orgId,
  async (id) => {
    if (!id) return
    await fetchOrganizationDetails()
    await fetchMembers()
  },
  { immediate: true },
)
</script>

<template>
  <main class="app-container pt-6 pb-10 md:pt-8 md:pb-14">
    <div class="flex flex-col gap-8">
      <header class="flex items-center justify-between">
        <h1 class="text-preset-heading-md text-foreground">Organization Profile</h1>
      </header>

      <ProfileHeroSection
        :loading="detailsLoading"
        :image-src="orgLogoUrl"
        :image-name="orgName"
        editable
        @edit="openEditOrganization"
      >
        <h2 class="text-preset-heading-md text-foreground">
          {{ orgName || 'Organization name unavailable' }}
        </h2>
        <p class="text-preset-body-md text-foreground">
          {{ orgIndustry || 'Industry not set' }}
        </p>
      </ProfileHeroSection>

      <section class="bg-background rounded-md p-5">
        <div v-if="detailsLoading" class="flex flex-col gap-3">
          <div class="bg-muted-background h-4 w-56 animate-pulse rounded"></div>
          <div class="bg-muted-background h-4 w-48 animate-pulse rounded"></div>
          <div class="bg-muted-background h-4 w-40 animate-pulse rounded"></div>
          <div class="bg-muted-background h-4 w-32 animate-pulse rounded"></div>
        </div>
        <div
          v-else
          class="flex flex-nowrap items-start gap-6 sm:gap-2 md:items-center md:justify-between"
        >
          <div class="flex w-full flex-col items-start gap-3">
            <div class="flex flex-nowrap items-center gap-2">
              <span class="text-preset-label-md text-foreground whitespace-nowrap">Industry :</span>
              <span class="text-preset-body-sm text-muted">{{
                orgIndustry || 'Industry not set'
              }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-preset-label-md text-foreground whitespace-nowrap">Location :</span>
              <span class="text-preset-body-sm text-muted">{{
                orgLocation || 'Location not set'
              }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-preset-label-md text-foreground whitespace-nowrap"
                >Team members :</span
              >
              <span class="text-preset-body-sm text-muted">
                {{ teamMembersCount }} member{{ teamMembersCount === 1 ? '' : 's' }}
              </span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-preset-label-md text-foreground whitespace-nowrap">Plan :</span>
              <span class="text-preset-body-sm text-muted capitalize">{{
                planLabel || 'Plan not set'
              }}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button
                class="btn text-muted hover:text-foreground p-1"
                type="button"
                aria-label="Organization actions"
              >
                <EllipsisVertical :size="25" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="openEditOrganization">Edit organization</DropdownMenuItem>
              <DropdownMenuItem class="text-error" @click="confirmDeleteOrganization">
                Delete organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h3 class="text-preset-body-md text-foreground font-semibold">Members</h3>
        </div>

        <div v-if="membersLoading" class="space-y-3">
          <div class="border-border bg-muted-background h-18 rounded-xl border"></div>
          <div class="border-border bg-muted-background h-18 rounded-xl border"></div>
        </div>
        <div v-else-if="membersError" class="text-error text-preset-body-sm">
          {{ membersError }}
        </div>
        <div v-else-if="!members.length" class="text-muted text-preset-body-sm">
          No members available yet.
        </div>
        <div v-else class="flex flex-col gap-2 overflow-x-scroll">
          <article
            v-for="member in members"
            :key="member.id"
            class="profile-list-card flex items-end-safe justify-between gap-6 sm:items-center"
          >
            <div class="flex items-center gap-6">
              <Label :for="`member-${member.id}`" :row="true" class="items-center">
                <Checkbox
                  :id="`member-${member.id}`"
                  :model-value="selectedMemberIds.includes(member.id)"
                  @update:model-value="toggleMemberSelection(member.id, $event === true)"
                />
              </Label>
              <div
                class="flex cursor-pointer items-center gap-2"
                @click="openMemberDetails(member)"
              >
                <div
                  class="border-border bg-muted-background flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border"
                >
                  <img
                    v-if="member.avatarUrl"
                    :src="member.avatarUrl"
                    :alt="member.name"
                    class="h-full w-full object-cover"
                  />
                  <span v-else class="text-muted text-sm font-semibold">
                    {{ initials(member.name || ' ') }}
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <p class="text-preset-body-lg text-foreground">{{ member.name }}</p>
                  <p class="text-preset-body-sm text-accent">{{ member.email }}</p>
                </div>
              </div>
            </div>
            <div
              class="col-start-3 row-start-2 md:col-auto md:row-start-auto md:justify-self-center"
            >
              <span
                class="text-preset-body-sm text-muted border-border bg-muted-background inline-flex items-center justify-center rounded-full border px-3 py-1 whitespace-nowrap"
              >
                {{ member.lastActive }}
              </span>
            </div>
            <div class="col-start-3 row-start-1 md:col-auto md:row-start-auto md:justify-self-end">
              <span
                class="inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium"
                :class="statusClass(member.status)"
              >
                {{ member.status }}
              </span>
            </div>
          </article>
        </div>

        <div
          v-if="hasSelection"
          class="sticky bottom-0 flex flex-wrap justify-center gap-4 py-4 backdrop-blur md:justify-end"
        >
          <button
            class="btn btn--secondary btn--md btn--disabled"
            type="button"
            @click="clearSelection"
          >
            Cancel
          </button>
          <button
            class="btn btn--default btn--md btn--disabled"
            type="button"
            :disabled="bulkDeleting"
            @click="handleBulkDelete"
          >
            {{ bulkDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="!organizationDetails && !detailsLoading"
      class="border-border bg-background mx-auto mt-10 max-w-xl rounded-2xl border p-8 text-center"
    >
      <p class="text-preset-heading-md text-foreground">Organization not found</p>
      <p class="text-preset-body-sm text-muted mt-2">
        Return to organizations to choose a valid profile.
      </p>
      <button class="btn--secondary btn--lg mt-4" @click="router.push('/app/organizations')">
        Go back
      </button>
    </div>

    <OrganizationFormDialog
      v-if="organizationDetails"
      v-model:open="orgEditDialogOpen"
      :initial-name="organizationDetails.name"
      :initial-industry="organizationDetails.industry || ''"
      :initial-location="organizationDetails.location || ''"
      :initial-logo-url="organizationDetails.logo_url || ''"
      :initial-email="organizationDetails.email || ''"
      :initial-job-title="organizationDetails.job_title || ''"
      :initial-org-type="organizationDetails.org_type || ''"
      :initial-company-size="organizationDetails.company_size || ''"
      :initial-country="organizationDetails.country || ''"
      title="Edit organization"
      submit-label="Save changes"
      :loading="orgEditSaving"
      :error="orgEditError"
      :field-errors="orgEditFieldErrors"
      @save="handleOrgSave"
    />
    <UserProfileEditDialog
      v-if="activeMember"
      :open="Boolean(activeMember)"
      title="Details"
      :name="activeMember.name"
      :email="activeMember.email"
      :role="activeMember.role"
      :avatar-url="activeMember.avatarUrl || ''"
      :show-image-edit="false"
      :show-footer="false"
      :disable-name="true"
      :disable-role="true"
      :disable-email="true"
      @update:open="(value) => !value && (activeMember = null)"
    />
  </main>
</template>
