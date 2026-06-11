<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAuthStore } from '@/stores/auth-store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { confirm: openConfirm } = useConfirmDialog()

const searchQuery = ref('')

const handleSearch = () => {
  console.log('Searching for:', searchQuery.value)
}

/** Admin dropdown */
const isAdminDropdownOpen = ref(false)
const adminButtonRef = ref<HTMLElement | null>(null)
const adminDropdownRef = ref<HTMLElement | null>(null)

const adminLabel = computed(() => authStore.user?.name || authStore.user?.email || 'Admin')

const closeAdminDropdown = () => {
  isAdminDropdownOpen.value = false
}

const toggleAdminDropdown = () => {
  isAdminDropdownOpen.value = !isAdminDropdownOpen.value
}

const onDocumentClick = (e: MouseEvent) => {
  const target = e.target as Node
  const btn = adminButtonRef.value
  const dropdown = adminDropdownRef.value

  if (!btn || !dropdown) return
  if (btn.contains(target)) return
  if (dropdown.contains(target)) return

  closeAdminDropdown()
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeAdminDropdown()
}

/** Logout (same pattern as your main nav) */
const handleLogout = () => {
  openConfirm({
    title: 'Log out?',
    description: 'You will need to sign in again to access your dashboard.',
    confirmText: 'Log out',
    cancelText: 'Cancel',
    async onConfirm() {
      closeAdminDropdown()

      await authStore.logout()
      toast.success('You have been logged out')

      router.replace({ name: 'login' })
    },
  })
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <section class="border-b p-4">
    <nav class="flex justify-between">
      <ul class="flex gap-4 self-center">
        <li>
          <RouterLink
            to="/super-admin"
            class="transition-colors hover:text-gray-700"
            :class="{ 'font-bold': route.path === '/super-admin' }"
          >
            Overview
          </RouterLink>
        </li>

        <li>
          <RouterLink
            to="/super-admin/customers"
            class="transition-colors hover:text-gray-700"
            :class="{ 'font-bold': route.path.startsWith('/super-admin/customers') }"
          >
            Customers
          </RouterLink>
        </li>

        <li>
          <RouterLink
            to="/super-admin/blog"
            class="transition-colors hover:text-gray-700"
            :class="{ 'font-bold': route.path.startsWith('/super-admin/blog') }"
          >
            Blog
          </RouterLink>
        </li>

        <li>
          <RouterLink
            to="/super-admin/campaigns"
            class="transition-colors hover:text-gray-700"
            :class="{ 'font-bold': route.path.startsWith('/super-admin/campaigns') }"
          >
            Campaigns
          </RouterLink>
        </li>
      </ul>

      <div class="flex items-center">
        <form class="mr-4" @submit.prevent="handleSearch">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="rounded-md border px-2 py-2 shadow outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <!-- Admin Dropdown -->
        <div class="relative">
          <button
            ref="adminButtonRef"
            type="button"
            class="flex w-48 items-center justify-between rounded-md border px-3 py-2 shadow outline-none hover:bg-gray-50"
            @click="toggleAdminDropdown"
          >
            <span class="truncate">{{ adminLabel }}</span>
            <ChevronDown class="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />
          </button>

          <div
            v-if="isAdminDropdownOpen"
            ref="adminDropdownRef"
            class="absolute right-0 z-50 mt-2 w-48 rounded-md border bg-white shadow-lg"
          >
            <button
              type="button"
              class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              @click="handleLogout"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  </section>
</template>
