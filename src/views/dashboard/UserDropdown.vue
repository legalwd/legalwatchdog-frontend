<script setup lang="ts">
import {
  Folder01Icon,
  SourceCodeIcon,
  Ticket01Icon,
  UserCircleIcon,
  CreditCardIcon,
  UserAdd01Icon,
  Logout05Icon,
  OfficeIcon,
  ShieldUserIcon,
} from '@hugeicons/core-free-icons'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import Icon from '@/components/reusable/Icon.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'

const emit = defineEmits<{
  (e: 'logout' | 'navigate'): void
}>()

const props = defineProps<{
  isOrganizationsPage?: boolean
}>()

const handleNavigate = () => {
  emit('navigate')
}

const organizationStore = useOrganizationStore()
const authStore = useAuthStore()
const route = useRoute()
const currentOrganizationId = computed(() => organizationStore.currentOrganizationId)
const jurisdictionContextId = computed(() =>
  route.name === 'jurisdiction-detail' && typeof route.params.id === 'string'
    ? route.params.id
    : '',
)

const SUPER_ADMIN_ROLES = ['super-admin', 'superadmin', 'super_admin'] as const

const isSuperAdmin = computed(() => {
  const user = authStore.user
  if (!user) return false
  if (user.is_superadmin === true || user.is_super_admin === true) return true

  const role = user.role?.toLowerCase()
  if (!role) return false

  return SUPER_ADMIN_ROLES.includes(role as (typeof SUPER_ADMIN_ROLES)[number])
})

const dropdownLinks = computed(() => {
  const orgId = currentOrganizationId.value
  const orgFallback = { name: 'organizations' }
  const jurisdictionId = jurisdictionContextId.value
  const ticketTarget = jurisdictionId
    ? { name: 'tickets', query: { context: 'jurisdiction', contextId: jurisdictionId } }
    : orgId
      ? { name: 'tickets', query: { context: 'organization', contextId: orgId } }
      : orgFallback
  const links = [
    {
      icon: UserCircleIcon,
      to: { name: 'profile' },
      name: 'Profile',
    },
    {
      icon: OfficeIcon,
      to: { name: 'organizations' },
      name: 'Organizations',
    },
    {
      icon: Folder01Icon,
      to: orgId
        ? { name: 'organization-projects', params: { organizationId: orgId } }
        : orgFallback,
      name: 'Projects',
    },
    {
      icon: Ticket01Icon,
      to: ticketTarget,
      name: 'Tickets',
    },
    {
      icon: UserAdd01Icon,
      to: { name: 'invitations' },
      name: 'Invitations',
    },
    {
      icon: CreditCardIcon,
      to: { name: 'billing' },
      name: 'Billing',
    },
    {
      icon: SourceCodeIcon,
      to: { name: 'api-access' },
      name: 'API Access',
    },
  ]
  if (isSuperAdmin.value) {
    links.push({
      icon: ShieldUserIcon,
      to: { name: 'super-admin-overview' },
      name: 'Super Admin',
    })
  }
  if (!props.isOrganizationsPage) return links
  return links.filter(
    (link) =>
      !['Organizations', 'Projects', 'Tickets', 'Billing', 'API Access'].includes(link.name),
  )
})
</script>

<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <slot />
      </DropdownMenuTrigger>
      <DropdownMenuContent class="mr-2 w-3xs p-3">
        <template v-for="link in dropdownLinks" :key="link.name">
          <DropdownMenuItem as-child class="p-3">
            <RouterLink :to="link.to" @click="handleNavigate">
              <Icon :icon="link.icon" class="text-foreground mr-2 inline-block sm:size-5" />
              {{ link.name }}
            </RouterLink>
          </DropdownMenuItem>
        </template>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="p-3" @click="emit('logout')">
          <Icon :icon="Logout05Icon" class="text-foreground mr-2 inline-block sm:size-5" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
