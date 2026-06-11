<script setup lang="ts">
import { EllipsisVertical } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { invitationService } from '@/api/invitation'
import { organizationService } from '@/api/organization'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'
import type { Invitation, InvitationErrorResponse } from '@/types/invitation'
import type {
  Organization,
  OrganizationErrorResponse,
  OrganizationMember,
  RawOrganization,
} from '@/types/organization'
import type { UserProfile } from '@/types/user'

type MemberRole = 'Owner' | 'Admin' | 'Manager' | 'Member'
type MemberStatus = 'Active' | 'Pending' | 'Inactive'

type Member = {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
}

const route = useRoute()
const router = useRouter()
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()
const { organizations } = storeToRefs(organizationStore)
const { confirm: openConfirm } = useConfirmDialog()

const orgId = computed(() => {
  const id = route.params.organizationId
  return typeof id === 'string' ? id : ''
})

const organization = computed<Organization | null>(
  () => organizations.value.find((org) => org.id === orgId.value) || null,
)

const members = ref<Member[]>([])
const membersLoading = ref(false)
const membersError = ref<string | null>(null)
const memberActionLoading = ref<string | null>(null)
const currentUserId = ref<string | null>(null)

const inviteOpen = ref(false)
const inviteForm = ref({ email: '', role: 'Member' as MemberRole })
const inviteSending = ref(false)

const invitations = ref<Invitation[]>([])
const loadingInvites = ref(false)
const invitesError = ref<string | null>(null)
const statusFilter = ref<'pending' | 'accepted' | 'declined' | 'expired' | 'all'>('pending')

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('')

const statusClass = (status: MemberStatus) =>
  status === 'Active'
    ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
    : status === 'Pending'
      ? 'text-amber-700 bg-amber-50 border-amber-100'
      : 'text-error bg-red-50 border-red-100'

const roleClass = (role: MemberRole) => {
  switch (role) {
    case 'Owner':
      return 'text-[#0f5132] bg-[#e7f5ed] border-[#c6e8d6]'
    case 'Admin':
      return 'text-[#9b3413] bg-[#fbeadd] border-[#f1d2b8]'
    case 'Manager':
      return 'text-[#6e2b3f] bg-[#f9e7ec] border-[#f2c9d8]'
    default:
      return 'text-[#92400e] bg-[#fef6ec] border-[#f5e0c3]'
  }
}

const mapRawOrganization = (org: RawOrganization): Organization => ({
  id: org.organization_id || org.organizationId || org.id || (org as { _id?: string })._id || '',
  name: org.name,
  industry: org.industry,
  is_active: org.is_active,
  user_role: org.user_role || (org as { role?: string }).role,
  project_count:
    org.project_count ??
    (org as { projects_count?: number }).projects_count ??
    (Array.isArray((org as { projects?: unknown }).projects)
      ? (org as { projects?: Array<unknown> }).projects?.length
      : undefined),
  created_at: org.created_at,
  updated_at: org.updated_at,
})

const upsertOrganization = (raw: RawOrganization | null | undefined) => {
  if (!raw) return
  const mapped = mapRawOrganization(raw)
  if (!mapped.id) return
  const idx = organizationStore.organizations.findIndex((item) => item.id === mapped.id)
  if (idx >= 0) {
    organizationStore.organizations.splice(idx, 1, mapped)
  } else {
    organizationStore.organizations.push(mapped)
  }
}

const ensureUserId = async () => {
  const user =
    authStore.user || (authStore.accessToken ? await authStore.loadCurrentUser() : undefined)
  return user?.id || (user as { user_id?: string } | undefined)?.user_id || null
}

const ensureOrganizations = async () => {
  if (organizations.value.length) return
  const userId = await ensureUserId()
  if (userId) {
    await organizationStore.fetchOrganizations(userId)
  }
}

const fetchOrganizationDetails = async () => {
  if (organization.value || !orgId.value) return
  try {
    const { data } = await organizationService.getOrganizationById(orgId.value)
    const raw = (data?.data as RawOrganization | undefined) ?? null
    upsertOrganization(raw)
  } catch (error) {
    console.error('Failed to fetch organization details', error)
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
  const role: MemberRole =
    normalizedRole === 'owner'
      ? 'Owner'
      : normalizedRole === 'admin'
        ? 'Admin'
        : normalizedRole === 'manager'
          ? 'Manager'
          : 'Member'
  const membershipActive = 'membership_active' in user ? user.membership_active : undefined
  const status: MemberStatus =
    role === 'Owner'
      ? 'Active'
      : membershipActive === false
        ? 'Inactive'
        : membershipActive === true
          ? 'Active'
          : 'Pending'
  return {
    id: memberId,
    name: fullName?.trim() || 'Unknown User',
    email: user.email || '',
    role,
    status,
  }
}

const fetchMembers = async () => {
  if (!orgId.value) return
  membersLoading.value = true
  membersError.value = null
  try {
    const { data } = await organizationService.listOrganizationUsers(orgId.value)
    const users = data.data?.users ?? []
    members.value = (users as Array<OrganizationMember | UserProfile>).map(mapUserToMember)
  } catch (error) {
    const err = error as OrganizationErrorResponse
    if (!err.response) {
      membersError.value = 'Network error: Unable to reach server'
    } else {
      membersError.value =
        err.response.data?.detail?.[0]?.msg ||
        err.response.data?.message ||
        'Failed to load members'
    }
  } finally {
    membersLoading.value = false
  }
}

const refreshMembersAndInvites = async () => {
  await Promise.all([fetchMembers(), fetchInvitations()])
}

const updateMemberRole = async (member: Member, targetRole: MemberRole) => {
  if (!orgId.value || !member.id) return
  memberActionLoading.value = `${member.id}-role`

  try {
    await organizationService.updateMemberRole(orgId.value, member.id, targetRole)

    members.value = members.value.map((item) =>
      item.id === member.id ? { ...item, role: targetRole } : item,
    )

    toast.success(`${member.name} is now ${targetRole}`)
  } catch (error) {
    const err = error as OrganizationErrorResponse

    const message = !err.response
      ? 'Network error: Unable to reach server'
      : err.response.data?.detail?.[0]?.msg || err.response.data?.message || 'Failed to update role'

    toast.error(message)
  } finally {
    memberActionLoading.value = null
  }
}

const toggleMemberStatus = async (member: Member) => {
  if (!orgId.value) return

  if (member.role === 'Owner') {
    toast.info('The Owner cannot be deactivated')
    return
  }

  if (!member.id) {
    toast.error('Cannot update status: missing user ID')
    return
  }

  const targetStatus: MemberStatus = member.status === 'Active' ? 'Inactive' : 'Active'

  memberActionLoading.value = `${member.id}-status`

  try {
    await organizationService.updateMemberStatus(orgId.value, member.id, targetStatus === 'Active')

    members.value = members.value.map((item) =>
      item.id === member.id ? { ...item, status: targetStatus } : item,
    )

    const verb = targetStatus === 'Active' ? 'activated' : 'deactivated'
    toast.success(`${member.name} has been ${verb}`)
  } catch (error) {
    const err = error as OrganizationErrorResponse

    const message = !err.response
      ? 'Network error: Unable to reach server'
      : err.response.data?.detail?.[0]?.msg ||
        err.response.data?.message ||
        'Failed to update status'

    toast.error(message)
  } finally {
    memberActionLoading.value = null
  }
}

const removeMember = async (member: Member) => {
  if (!orgId.value || !member.id) return
  if (currentUserId.value && member.id === currentUserId.value) {
    toast.error('You cannot remove yourself')
    return
  }

  openConfirm({
    title: 'Remove member?',
    description: `Remove ${member.name} from this organization.`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    async onConfirm() {
      memberActionLoading.value = `${member.id}-remove`
      try {
        await organizationService.deleteMember(orgId.value, member.id)
        members.value = members.value.filter((item) => item.id !== member.id)
        toast.success('Member removed')
      } catch (error) {
        const err = error as OrganizationErrorResponse
        const message = !err.response
          ? 'Network error: Unable to reach server'
          : err.response.data?.detail?.[0]?.msg ||
            err.response.data?.message ||
            'Failed to remove member'
        toast.error(message)
      } finally {
        memberActionLoading.value = null
      }
    },
  })
}

const sendInvitation = async () => {
  if (!orgId.value) {
    toast.error('Select an organization before inviting teammates')
    return
  }

  if (!inviteForm.value.email.trim()) {
    toast.error('Email is required')
    return
  }

  inviteSending.value = true

  try {
    const { data } = await organizationService.inviteMember(orgId.value, {
      invited_email: inviteForm.value.email.trim(),
      role_name: inviteForm.value.role,
    })

    const message = data.message || data.data?.message || 'Invitation sent'
    inviteOpen.value = false

    toast.success(message)

    inviteForm.value.email = ''
    inviteForm.value.role = 'Member'

    await fetchInvitations()
  } catch (error) {
    const err = error as OrganizationErrorResponse

    const message = !err.response
      ? 'Network error: Unable to reach server'
      : err.response.data?.detail?.[0]?.msg ||
        err.response.data?.message ||
        'Failed to send invitation'

    inviteOpen.value = false
    toast.error(message)
  } finally {
    inviteSending.value = false
  }
}

const normalizeInvitations = (payload: unknown): Invitation[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => ({
        id: (item as Invitation)?.id,
        token: (item as Invitation)?.token,
        organization_id: (item as Invitation)?.organization_id || orgId.value,
        organization_name: (item as Invitation)?.organization_name,
        invited_email: (item as Invitation)?.invited_email,
        role: (item as Invitation)?.role || (item as Invitation)?.role_name,
        role_name: (item as Invitation)?.role_name,
        status: (item as Invitation)?.status,
      }))
      .filter((item) => (item.id || item.token) && item.organization_id)
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as { invitations?: unknown; data?: unknown }
    const list = obj.invitations || obj.data
    if (Array.isArray(list)) return normalizeInvitations(list)
  }

  return []
}

const fetchInvitations = async () => {
  if (!orgId.value) return
  loadingInvites.value = true
  invitesError.value = null
  try {
    const { data } = await invitationService.listOrganizationInvitations(orgId.value, {
      status_filter: statusFilter.value,
    })
    const payload = data?.data ?? data
    invitations.value = normalizeInvitations(payload)
  } catch (err) {
    const errorResponse = err as InvitationErrorResponse
    if (!errorResponse.response) {
      invitesError.value = 'Network error: Unable to reach server'
    } else {
      invitesError.value =
        errorResponse.response.data?.detail?.[0]?.msg ||
        errorResponse.response.data?.message ||
        'Failed to load invitations'
    }
  } finally {
    loadingInvites.value = false
  }
}

const cancelInvitation = async (invite: Invitation) => {
  const invitationId = invite.id || invite.token
  if (!orgId.value || !invitationId) return
  try {
    await invitationService.cancelOrganizationInvitation(orgId.value, invitationId)
    invitations.value = invitations.value.filter(
      (item) => item.id !== invitationId && item.token !== invitationId,
    )
    toast.success('Invitation cancelled')
  } catch (err) {
    const errorResponse = err as InvitationErrorResponse
    const message = !errorResponse.response
      ? 'Network error: Unable to reach server'
      : errorResponse.response.data?.detail?.[0]?.msg ||
        errorResponse.response.data?.message ||
        'Failed to cancel invitation'
    toast.error(message)
  }
}

const goToProfile = () => {
  router.push({ name: 'organization-profile', params: { organizationId: orgId.value } })
}

onMounted(async () => {
  currentUserId.value = await ensureUserId()
  await ensureOrganizations()
  await fetchOrganizationDetails()
  await refreshMembersAndInvites()
})

watch(statusFilter, fetchInvitations)
</script>

<template>
  <main class="app-container min-h-screen flex-1 bg-gray-50">
    <section class="mx-auto max-w-6xl py-8 sm:py-12">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {{ organization?.name || 'Organization' }}
          </p>
          <h1 class="text-3xl font-bold text-gray-900 lg:text-4xl">Members & Invitations</h1>
          <p class="mt-1 text-sm">Manage roles, statuses, and invitations for this organization.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button class="btn--secondary btn--lg" @click="goToProfile">Back to Organization</button>
          <button class="btn--default btn--lg" @click="refreshMembersAndInvites">Refresh</button>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="bg-background rounded-2xl p-5 shadow-sm ring-1 ring-gray-200/60">
          <div
            class="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center"
          >
            <div class="min-w-0">
              <p
                class="text-[10px] font-semibold tracking-wide text-[#9CA3AF] uppercase md:text-xs"
              >
                Members
              </p>
              <p class="truncate text-xs text-gray-500 md:text-sm">
                Invite teammates and manage their access.
              </p>
            </div>
            <Dialog v-model:open="inviteOpen">
              <DialogTrigger as-child>
                <button class="btn--default btn--sm md:btn--lgy whitespace-nowrap">
                  Invite Member
                </button>
              </DialogTrigger>
              <DialogContent class="w-[95%] rounded-xl sm:max-w-120">
                <DialogHeader>
                  <DialogTitle>Invite teammate</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to join this organization.
                  </DialogDescription>
                </DialogHeader>
                <form class="space-y-4" @submit.prevent="sendInvitation">
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-900" for="invite-email"
                      >Email</label
                    >
                    <input
                      id="invite-email"
                      v-model="inviteForm.email"
                      type="email"
                      placeholder="teammate@company.com"
                      required
                      class="focus:border-accent-main focus:ring-accent-main/20 h-10 w-full rounded-lg border border-[#D5D7DA] px-3 text-sm text-gray-900 placeholder-[#717680] focus:ring-2 focus:outline-none md:h-11"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-900" for="invite-role">Role</label>
                    <select
                      id="invite-role"
                      v-model="inviteForm.role"
                      class="focus:border-accent-main focus:ring-accent-main/20 h-10 w-full rounded-lg border border-[#D5D7DA] px-3 text-sm text-gray-900 focus:ring-2 focus:outline-none md:h-11"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>

                  <DialogFooter class="mt-2 flex items-center justify-end gap-3">
                    <DialogClose as-child>
                      <button type="button" class="btn--secondary btn--sm md:btn--lg btn--full">
                        Cancel
                      </button>
                    </DialogClose>
                    <button
                      type="submit"
                      :disabled="inviteSending"
                      class="btn--default btn--sm md:btn--lg btn--full"
                    >
                      <span v-if="inviteSending">Sending...</span>
                      <span v-else>Send Invite</span>
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div class="divide-y divide-gray-100">
            <div v-if="membersLoading" class="space-y-3">
              <div v-for="n in 4" :key="n" class="flex items-center justify-between py-3">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-full bg-gray-100 md:h-10 md:w-10"></div>
                  <div>
                    <div class="mb-1 h-3 w-24 rounded bg-gray-100 md:h-4 md:w-32"></div>
                    <div class="h-2 w-32 rounded bg-gray-100 md:h-3 md:w-40"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="membersError" class="py-4 text-xs text-red-600 md:text-sm">
              {{ membersError }}
            </div>

            <div v-else-if="!members.length" class="py-4 text-xs md:text-sm">
              No members yet. Invite someone to get started.
            </div>

            <template v-else>
              <article
                v-for="member in members"
                :key="member.id"
                class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0"
              >
                <div class="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4dfcd] text-xs font-semibold text-[#5c2a05] md:h-10 md:w-10 md:text-sm"
                  >
                    {{ initials(member.name) }}
                  </div>
                  <div class="min-w-0 flex-1 pr-2">
                    <p class="truncate text-xs font-semibold text-gray-900 md:text-sm">
                      {{ member.name }}
                    </p>
                    <p class="truncate text-[10px] text-[#9b755a] md:text-xs">{{ member.email }}</p>
                  </div>
                </div>

                <div
                  class="flex w-full items-center justify-between gap-3 pl-12 sm:w-auto sm:justify-start sm:pl-0"
                >
                  <div class="flex gap-2">
                    <Badge
                      :class="[
                        'border px-2 py-0.5 text-[10px] font-semibold md:px-3 md:py-1 md:text-xs',
                        roleClass(member.role),
                      ]"
                    >
                      {{ member.role }}
                    </Badge>
                    <Badge
                      :class="[
                        'border px-2 py-0.5 text-[10px] font-semibold md:px-3 md:py-1 md:text-xs',
                        statusClass(member.status),
                      ]"
                    >
                      {{ member.status }}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <button class="btn--icon-only btn--default btn--icon-sm" @click.stop>
                        <EllipsisVertical :size="16" class="md:hidden" />
                        <EllipsisVertical :size="18" class="hidden md:block" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        :disabled="
                          memberActionLoading === `${member.id}-role` ||
                          member.role === 'Admin' ||
                          member.role === 'Owner'
                        "
                        @click.stop="updateMemberRole(member, 'Admin')"
                      >
                        Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        :disabled="
                          memberActionLoading === `${member.id}-role` ||
                          member.role === 'Manager' ||
                          member.role === 'Owner'
                        "
                        @click.stop="updateMemberRole(member, 'Manager')"
                      >
                        Manager
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        :disabled="
                          memberActionLoading === `${member.id}-role` ||
                          member.role === 'Member' ||
                          member.role === 'Owner'
                        "
                        @click.stop="updateMemberRole(member, 'Member')"
                      >
                        Member
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        :disabled="
                          memberActionLoading === `${member.id}-status` || member.role === 'Owner'
                        "
                        @click.stop="toggleMemberStatus(member)"
                      >
                        {{ member.status === 'Active' ? 'Deactivate' : 'Activate' }}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        class="text-red-600 focus:text-red-600"
                        :disabled="
                          memberActionLoading === `${member.id}-remove` ||
                          member.role === 'Owner' ||
                          member.id === currentUserId
                        "
                        @click.stop="removeMember(member)"
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </article>
            </template>
          </div>
        </div>

        <div class="bg-background rounded-2xl p-5 shadow-sm ring-1 ring-gray-200/60">
          <div
            class="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center"
          >
            <div>
              <p
                class="text-[10px] font-semibold tracking-wide text-[#9CA3AF] uppercase md:text-xs"
              >
                Invitations
              </p>
              <p class="text-xs md:text-sm">Invites sent for this organization.</p>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-xs" for="status-filter">Status</label>
              <select
                id="status-filter"
                v-model="statusFilter"
                class="focus:border-accent-main bg-background h-9 rounded-md border px-2 text-xs text-gray-800 focus:outline-none md:h-10 md:px-3 md:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          <div v-if="loadingInvites" class="space-y-2">
            <div
              v-for="n in 3"
              :key="n"
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 shadow-sm"
            >
              <div class="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
              <div class="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div v-else-if="invitesError" class="text-xs text-red-600 md:text-sm">
            {{ invitesError }}
          </div>
          <div v-else-if="!invitations.length" class="text-xs md:text-sm">
            No invitations found.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="invite in invitations"
              :key="invite.id || invite.token"
              class="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <p class="truncate text-xs font-semibold text-gray-900 md:text-sm">
                  {{ invite.invited_email || invite.organization_name || 'Invitation' }}
                </p>
                <p class="truncate text-[10px] text-gray-500 md:text-xs">
                  Role: {{ invite.role_name || invite.role || 'Member' }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-if="invite.status"
                  class="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold tracking-wide text-gray-700 uppercase md:text-xs"
                >
                  {{ invite.status }}
                </span>
                <button
                  v-if="invite.status === 'pending'"
                  class="btn--secondary btn--sm sm:btn--md text-xs"
                  :disabled="!invite.id && !invite.token"
                  @click="cancelInvitation(invite)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
