import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth-store'
import UserDropdown from '@/views/dashboard/UserDropdown.vue'

vi.mock('vue-router', () => ({
  RouterLink: {
    props: ['to'],
    template: '<a><slot /></a>',
  },
  useRoute: () => ({
    name: 'dashboard',
    params: {},
  }),
}))

const mountDropdown = () =>
  mount(UserDropdown, {
    slots: {
      default: '<button>Open menu</button>',
    },
    global: {
      stubs: {
        DropdownMenu: { template: '<div><slot /></div>' },
        DropdownMenuTrigger: { template: '<div><slot /></div>' },
        DropdownMenuContent: { template: '<div><slot /></div>' },
        DropdownMenuItem: { template: '<div><slot /></div>' },
        DropdownMenuSeparator: { template: '<hr />' },
      },
    },
  })

describe('UserDropdown', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows super admin navigation when the user has a super admin flag', () => {
    const authStore = useAuthStore()
    authStore.user = {
      id: 'user-1',
      email: 'admin@example.com',
      is_superadmin: true,
    }

    const wrapper = mountDropdown()

    expect(wrapper.text()).toContain('Super Admin')
  })

  it('shows super admin navigation when the user has a super admin role', () => {
    const authStore = useAuthStore()
    authStore.user = {
      id: 'user-1',
      email: 'admin@example.com',
      role: 'super_admin',
    }

    const wrapper = mountDropdown()

    expect(wrapper.text()).toContain('Super Admin')
  })

  it('hides super admin navigation for regular users', () => {
    const authStore = useAuthStore()
    authStore.user = {
      id: 'user-1',
      email: 'member@example.com',
      role: 'Member',
    }

    const wrapper = mountDropdown()

    expect(wrapper.text()).not.toContain('Super Admin')
  })
})
