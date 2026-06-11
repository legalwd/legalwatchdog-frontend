<script setup lang="ts">
import { Notification01Icon } from '@hugeicons/core-free-icons'
import { ChevronDown, Menu, X } from 'lucide-vue-next'
import { ref, onUnmounted, watch, computed, onMounted, defineAsyncComponent } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { notificationService } from '@/api/notification'
import UserAvatar from '@/components/dashboard/UserAvatar.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAuthStore } from '@/stores/auth-store'

import BrandLogo from '../reusable/BrandLogo.vue'
import Icon from '../reusable/Icon.vue'
import { Button } from '../ui/button'

const Notification = defineAsyncComponent(() => import('@/components/dashboard/Notification.vue'))
const OrganizationSwitcher = defineAsyncComponent(
  () => import('@/components/dashboard/OrganizationSwitcher.vue'),
)
const UserDropdown = defineAsyncComponent(() => import('@/views/dashboard/UserDropdown.vue'))

const router = useRouter()
const { confirm: openConfirm } = useConfirmDialog()
const route = useRoute()

type NavLink = {
  name: string
  to?: string | { path: string; hash?: string }
  dropdown?: Array<{ name: string; to: string; description?: string }>
}

const isLandingHome = computed(() => route.name === 'home')
const isMenuOpen = ref(false)
const isMobileDropdownOpen = ref(false)
const activeDropdown = ref<string | null>(null)
const activeMobileDropdown = ref<string | null>(null)
const isScrolled = ref(false)
const canAnimate = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isGuest = computed(() => authStore.isGuest)
const isOrganizationsPage = computed(() => route.name === 'organizations')
const avatarUrl = computed(
  () =>
    authStore.user?.avatar_url ||
    (authStore.user as { profile_picture_url?: string })?.profile_picture_url ||
    '',
)
const displayName = computed(() => {
  const user = authStore.user
  if (!user) return 'User'
  const fullName = user.name || `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
  if (fullName) return fullName
  if (user.email) return user.email.split('@')[0] || 'User'
  return 'User'
})

onMounted(async () => {
  if (!authStore.user && authStore.accessToken) {
    await authStore.loadCurrentUser()
  }
})

const fetchUnreadCount = async () => {
  try {
    const stats = await notificationService.getStats()
    unreadCount.value = stats.unread_count
  } catch (err) {
    console.error('Failed to fetch notification stats', err)
    unreadCount.value = 0
  }
}
onMounted(() => {
  if (isAuthenticated.value) {
    fetchUnreadCount()
  }
})
const isDashboard = route.path.includes('/app')
const navLinks: NavLink[] = isDashboard ? [] : []
// : [
//     /* {
//       name: 'Company',
//       dropdown: [
//         { name: 'About Us', to: '/about-us', description: 'Get to know us' },
//         { name: 'FAQ', to: '/faq', description: 'Frequently asked questions' },
//         { name: 'Blog', to: '/blog', description: 'Latest articles and insights' },
//         ],
//         }, */
//     { name: 'Features', to: '/features' },
//     { name: 'About Us', to: '/about-us' },
//     { name: 'Contact Us', to: '/contact-us' },
//   ]

let bodyOverflow: string | null = null
const toggleBodyScroll = (lock: boolean) => {
  if (typeof document === 'undefined') return
  const body = document.body
  if (lock) {
    bodyOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    return
  }
  body.style.overflow = bodyOverflow || ''
  bodyOverflow = null
}

watch(
  isLandingHome,
  (newVal) => {
    if (newVal) {
      canAnimate.value = false
      setTimeout(() => {
        canAnimate.value = true
      }, 300)
    } else {
      canAnimate.value = false
    }
  },
  { immediate: true },
)

watch(isMenuOpen, (newVal) => {
  toggleBodyScroll(newVal)
  if (!newVal) {
    isMobileDropdownOpen.value = false
    activeMobileDropdown.value = null
  }
})

watch(
  () => route.name,
  () => {
    isMenuOpen.value = false
    isMobileDropdownOpen.value = false
    activeDropdown.value = null
    activeMobileDropdown.value = null
  },
)

const closeMenu = () => {
  isMenuOpen.value = false
  isMobileDropdownOpen.value = false
  activeDropdown.value = null
  activeMobileDropdown.value = null
}

const toggleDropdown = (linkName: string) => {
  if (activeDropdown.value === linkName) {
    activeDropdown.value = null
  } else {
    activeDropdown.value = linkName
  }
}

const toggleMobileDropdown = (linkName: string) => {
  if (activeMobileDropdown.value === linkName) {
    activeMobileDropdown.value = null
  } else {
    activeMobileDropdown.value = linkName
  }
}

const closeDropdown = () => {
  activeDropdown.value = null
}

const handleLogout = () => {
  openConfirm({
    title: 'Log out?',
    description: 'You will need to sign in again to access your dashboard.',
    confirmText: 'Log out',
    cancelText: 'Cancel',
    async onConfirm() {
      isMenuOpen.value = false

      await authStore.logout()
      toast.success('You have been logged out')

      router.replace({ name: 'login' })
    },
  })
}

const notificationsButtonRef = ref<HTMLElement | null>(null)
const notificationsPopupRef = ref<HTMLElement | null>(null)
const unreadCount = ref(0)

const onDocumentClick = (e: MouseEvent) => {
  const target = e.target as Node
  const btn = notificationsButtonRef.value
  const popup = notificationsPopupRef.value

  if (!btn || !popup) return
  if (btn.contains(target)) return
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    activeDropdown.value = null
    activeMobileDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', handleScroll)
  toggleBodyScroll(false)
})
</script>

<template>
  <header
    class="text-text-main bg-background sticky top-0 z-50 w-full origin-center"
    :class="[
      isLandingHome
        ? isScrolled
          ? 'xl:fixed xl:top-0 xl:left-1/2 xl:w-full xl:-translate-x-1/2'
          : 'xl:fixed xl:top-8 xl:left-1/2 xl:w-4/5 xl:-translate-x-1/2 xl:rounded-xl xl:border'
        : 'sticky top-0 w-full',
      {
        'sticky top-0 w-full xl:transition-all xl:duration-300 xl:ease-in':
          isLandingHome && canAnimate,
      },
    ]"
  >
    <div class="app-container mx-auto flex w-full items-center justify-between px-4 py-4 lg:py-5">
      <RouterLink to="/" aria-label="Homepage" class="shrink-0">
        <BrandLogo class="h-8 w-auto sm:h-10" />
      </RouterLink>

      <div class="hidden lg:flex">
        <OrganizationSwitcher v-if="isAuthenticated && isDashboard && !isOrganizationsPage" />
      </div>

      <!-- DESKTOP NAV -->
      <nav aria-label="Primary" class="hidden flex-1 lg:flex lg:items-center lg:justify-center">
        <ul class="flex items-center gap-6 xl:gap-8">
          <li v-for="link in navLinks" :key="link.name" class="relative">
            <!-- Dropdown Link -->
            <template v-if="link.dropdown">
              <button
                class="hover:text-accent-main text-muted flex items-center gap-1 text-sm font-medium transition-colors xl:text-base"
                @click="toggleDropdown(link.name)"
                @mouseenter="activeDropdown = link.name"
              >
                {{ link.name }}
                <ChevronDown
                  class="size-5 transition-transform"
                  :class="{ 'rotate-180': activeDropdown === link.name }"
                />
              </button>

              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div
                  v-if="activeDropdown === link.name"
                  class="bg-background absolute top-full left-1/2 z-50 mt-2 w-72 -translate-x-1/2 rounded-lg border shadow-lg"
                  @mouseleave="closeDropdown"
                >
                  <div class="p-2">
                    <RouterLink
                      v-for="item in link.dropdown"
                      :key="item.name"
                      :to="item.to"
                      class="block rounded-md px-4 py-3 transition-colors hover:bg-gray-50"
                      @click="closeDropdown"
                    >
                      <div class="text-foreground font-medium">{{ item.name }}</div>
                      <div v-if="item.description" class="text-muted mt-0.5 text-sm">
                        {{ item.description }}
                      </div>
                    </RouterLink>
                  </div>
                </div>
              </Transition>
            </template>

            <!-- Regular Link -->
            <RouterLink
              v-else
              :to="link.to!"
              class="hover:text-primary text-muted text-sm font-medium transition-colors xl:text-base"
            >
              {{ link.name }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- RIGHT SIDE -->
      <div class="relative flex items-center md:gap-2">
        <!-- NOT LOGGED IN & NOT GUEST -->
        <template v-if="!isAuthenticated && !isGuest">
          <Button
            :as="RouterLink"
            :to="{ path: '/login' }"
            variant="outline"
            size="default"
            class="hidden text-sm sm:block sm:text-base"
          >
            Sign in
          </Button>
          <Button
            :as="RouterLink"
            :to="{ path: '/demo' }"
            variant="default"
            size="default"
            class="hidden text-sm sm:block sm:text-base"
          >
            Request a Demo
          </Button>
        </template>

        <div v-else class="flex items-center md:gap-2">
          <!-- NOTIFICATIONS -->
          <div class="relative flex items-center">
            <Notification>
              <button
                ref="notificationsButtonRef"
                aria-label="Open notifications"
                class="btn--icon-only btn--icon-md btn--default bg-muted-background flex items-center justify-center transition hover:bg-gray-400"
              >
                <Icon :icon="Notification01Icon" class="size-5 text-gray-800" />

                <span
                  v-if="unreadCount > 0"
                  class="pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-xs leading-none text-white"
                >
                  {{ unreadCount }}
                </span>
              </button>
            </Notification>
          </div>

          <!-- User Dropdown -->
          <div class="flex items-center space-x-4">
            <UserDropdown :is-organizations-page="isOrganizationsPage" @logout="handleLogout">
              <button
                class="btn btn--with-icon flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
              >
                <UserAvatar :name="displayName" :image-url="avatarUrl" :size="38" />
                <span
                  class="hidden max-w-25 truncate text-sm font-semibold text-gray-800 lg:block xl:max-w-35"
                >
                  {{ displayName }}
                </span>
              </button>
            </UserDropdown>
          </div>
        </div>

        <!-- MOBILE MENU TOGGLE -->
        <button
          class="btn--icon-only btn--icon-sm btn--default lg:hidden"
          aria-label="Toggle menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <Menu v-if="!isMenuOpen" class="h-5 w-5 sm:h-6 sm:w-6" />
          <X v-else class="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </div>

    <!-- MOBILE MENU -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-transform duration-300 ease-in-out"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-300 ease-in-out"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div
          v-if="isMenuOpen"
          id="mobile-menu"
          class="bg-background fixed top-0 left-0 z-70 h-screen w-full max-w-xs overflow-y-auto shadow-2xl sm:max-w-sm lg:hidden"
        >
          <div class="flex items-center justify-between border-b p-4 sm:p-6">
            <RouterLink to="/" @click="closeMenu">
              <BrandLogo class="h-8 w-auto sm:h-10" />
            </RouterLink>
            <button
              class="btn--icon-only btn--icon-sm btn--default"
              aria-label="Close menu"
              @click="closeMenu"
            >
              <X />
            </button>
          </div>

          <!-- AUTHENTICATED USER SECTION -->
          <template v-if="isAuthenticated">
            <!-- Organization Switcher -->
            <div v-if="isAuthenticated && isDashboard && !isOrganizationsPage" class="p-4 sm:p-6">
              <OrganizationSwitcher />
            </div>
          </template>

          <!-- NAV LINKS -->
          <template v-if="!isDashboard">
            <nav class="flex flex-col gap-1 p-4 sm:gap-2 sm:p-6">
              <div v-for="link in navLinks" :key="link.name">
                <!-- Dropdown Link -->
                <template v-if="link.dropdown">
                  <button
                    class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-50"
                    @click="toggleMobileDropdown(link.name)"
                  >
                    <span>{{ link.name }}</span>
                    <ChevronDown
                      class="size-5 transition-transform"
                      :class="{ 'rotate-180': activeMobileDropdown === link.name }"
                    />
                  </button>

                  <Transition
                    enter-active-class="transition ease-out duration-200"
                    enter-from-class="opacity-0 -translate-y-2"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition ease-in duration-150"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2"
                  >
                    <div
                      v-if="activeMobileDropdown === link.name"
                      class="mt-1 ml-4 space-y-1 border-l-2 pl-4"
                    >
                      <RouterLink
                        v-for="item in link.dropdown"
                        :key="item.name"
                        :to="item.to"
                        class="block rounded-md px-3 py-2 transition hover:bg-gray-50"
                        @click="closeMenu"
                      >
                        <div class="text-foreground text-sm font-medium">{{ item.name }}</div>
                        <div v-if="item.description" class="text-muted mt-0.5 text-xs">
                          {{ item.description }}
                        </div>
                      </RouterLink>
                    </div>
                  </Transition>
                </template>

                <!-- Regular Link -->
                <RouterLink
                  v-else
                  :to="link.to!"
                  class="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50"
                  @click="closeMenu"
                >
                  {{ link.name }}
                </RouterLink>
              </div>
            </nav>
          </template>

          <!-- AUTH BUTTONS / LOGOUT -->
          <div class="absolute bottom-4 w-full p-4">
            <template v-if="!isAuthenticated && !isGuest">
              <div class="flex flex-col gap-3">
                <Button
                  :as="RouterLink"
                  :to="{ path: '/login' }"
                  variant="default"
                  size="default"
                  class="w-full text-base"
                  @click="closeMenu"
                >
                  Sign In
                </Button>
              </div>
            </template>

            <template v-else-if="isAuthenticated">
              <Button
                size="lg"
                variant="default"
                class="bg-destructive w-full"
                @click="handleLogout"
              >
                Log Out
              </Button>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MOBILE OVERLAY -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMenuOpen"
          class="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          @click="closeMenu"
        ></div>
      </Transition>
    </Teleport>
  </header>
</template>
