<script setup lang="ts">
import { Check, ChevronDown } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const ismobileOpen = ref(false)
const { organizations, loading } = storeToRefs(organizationStore)

const hasOrganizations = computed(() => organizations.value.length > 0)
const syncWithRouteOrganization = () => {
  const routeId = route.params.organizationId
  if (typeof routeId === 'string' && routeId) {
    organizationStore.setCurrentOrganization(routeId)
  }
}

const selectedOrganizationId = computed({
  get: () => {
    const routeId = route.params.organizationId
    if (typeof routeId === 'string' && routeId) return routeId
    return organizationStore.currentOrganizationId || ''
  },
  set: async (value: string) => {
    if (!value) return
    organizationStore.setCurrentOrganization(value)

    if (route.name === 'organization-projects' && route.params.organizationId === value) {
      return
    }

    await router.push({
      name: 'organization-projects',
      params: { organizationId: value },
    })
  },
})

const ensureOrganizations = async () => {
  if (!authStore.isAuthenticated) return
  if (organizations.value.length || loading.value) return

  let userId = authStore.user?.id
  if (!userId) {
    const user = await authStore.loadCurrentUser?.()
    userId = user?.id
  }

  if (userId) {
    await organizationStore.fetchOrganizations(userId, { prefetchSecondPage: false })
  }

  syncWithRouteOrganization()
}

onMounted(() => {
  void ensureOrganizations()
})

watch(
  () => route.params.organizationId,
  (newId) => {
    if (typeof newId === 'string' && newId) {
      organizationStore.setCurrentOrganization(newId)
    }
  },
)

watch(
  () => organizations.value.length,
  () => syncWithRouteOrganization(),
)

const toggleOrganizationDropdown = () => {
  ismobileOpen.value = !ismobileOpen.value
}

const handleChangeOrganization = (orgId: string) => {
  ismobileOpen.value = false
  selectedOrganizationId.value = orgId
}
</script>

<template>
  <div class="hidden items-center lg:flex">
    <div class="mx-6 hidden h-10 w-0.5 bg-gray-300 lg:block"></div>
    <Select v-model="selectedOrganizationId" :disabled="loading || !hasOrganizations">
      <SelectTrigger
        class="hover:border-primary text-foreground w-full border-none px-0 font-medium"
      >
        <SelectValue
          :placeholder="
            loading ? 'Loading...' : hasOrganizations ? 'Select organization' : 'No organizations'
          "
        />
      </SelectTrigger>
      <SelectContent align="start" class="w-60">
        <SelectItem
          v-for="org in organizations"
          :key="org.id"
          :value="org.id"
          class="cursor-pointer font-medium"
        >
          {{ org.name || 'Organization' }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div class="flex w-full flex-col lg:hidden">
    <button
      class="text-foreground flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-semibold transition hover:bg-gray-50"
      @click="toggleOrganizationDropdown()"
    >
      <span>{{
        organizations.find((org) => org.id === selectedOrganizationId)?.name || 'Organization'
      }}</span>
      <ChevronDown class="size-5 transition-transform" :class="{ 'rotate-180': ismobileOpen }" />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="ismobileOpen" class="mt-4 ml-8 flex flex-col gap-4">
        <div
          v-for="org in organizations"
          :key="org.id"
          :value="org.id"
          class="cursor-pointer font-medium"
        >
          <button
            class="flex w-full items-center justify-between pr-8"
            @click="handleChangeOrganization(org.id)"
          >
            <p>
              {{ org.name || 'Organization' }}
            </p>
            <Check v-if="org.id === selectedOrganizationId" class="text-muted size-4" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
