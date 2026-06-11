import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'

import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'

import {
  authGuard,
  handleAuthRouteGuard,
  handleAuthStatusGuard,
  handleOrganizationGuard,
  handleOtpGuard,
  handleProtectedRouteGuard,
  isAuthRoute,
  isOrganizationSetupRoute,
  isOtpRoute,
  requiresAuth,
  requiresSuperAdmin,
  type AuthStore,
  type OrganizationStore,
} from './auth'

// Mock the auth store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/stores/app-store', () => ({
  useAppStore: vi.fn(),
}))

vi.mock('@/stores/organization-store', () => ({
  useOrganizationStore: vi.fn(),
}))

describe('Auth Guards', () => {
  let mockAuthStore: AuthStore
  let mockOrganizationStore: OrganizationStore

  beforeEach(() => {
    mockAuthStore = {
      isAuthenticated: false,
      syncAuthFromStorage: vi.fn(),
      loadCurrentUser: vi.fn(),
    }
    ;(useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockAuthStore)
    mockOrganizationStore = {
      hasOrganizations: false,
      loaded: false,
      loading: false,
      organizations: [],
      fetchOrganizations: vi.fn(),
    }
    ;(useOrganizationStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockOrganizationStore,
    )
    ;(useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ready: true,
      setReady: vi.fn(),
    })
  })

  describe('Route Type Checkers', () => {
    it('should identify auth routes', () => {
      expect(isAuthRoute('login')).toBe(true)
      expect(isAuthRoute('signup')).toBe(true)
      expect(isAuthRoute('dashboard')).toBe(false)
      expect(isAuthRoute(null)).toBe(false)
    })

    it('should identify OTP route', () => {
      expect(isOtpRoute('otp')).toBe(true)
      expect(isOtpRoute('login')).toBe(false)
      expect(isOtpRoute(null)).toBe(false)
    })

    it('should identify organization setup route', () => {
      expect(isOrganizationSetupRoute('create-organization')).toBe(true)
      expect(isOrganizationSetupRoute('login')).toBe(false)
      expect(isOrganizationSetupRoute(null)).toBe(false)
    })
  })

  describe('requiresAuth', () => {
    it('should return true if route has requiresAuth meta', () => {
      const route = {
        matched: [{ meta: { requiresAuth: true } }],
      } as unknown as RouteLocationNormalized

      expect(requiresAuth(route)).toBe(true)
    })

    it('should return false if no route requires auth', () => {
      const route = {
        matched: [{ meta: {} }, { meta: { requiresAuth: false } }],
      } as unknown as RouteLocationNormalized

      expect(requiresAuth(route)).toBe(false)
    })

    it('should return false for empty matched routes', () => {
      const route = {
        matched: [],
      } as unknown as RouteLocationNormalized

      expect(requiresAuth(route)).toBe(false)
    })
  })

  describe('requiresSuperAdmin', () => {
    it('should return true if route has requiresSuperAdmin meta', () => {
      const route = {
        matched: [{ meta: { requiresSuperAdmin: true } }],
      } as unknown as RouteLocationNormalized

      expect(requiresSuperAdmin(route)).toBe(true)
    })

    it('should return false if no route requires super admin', () => {
      const route = {
        matched: [{ meta: {} }, { meta: { requiresSuperAdmin: false } }],
      } as unknown as RouteLocationNormalized

      expect(requiresSuperAdmin(route)).toBe(false)
    })
  })

  describe('handleAuthStatusGuard', () => {
    it('should allow access if authenticated', () => {
      mockAuthStore.isAuthenticated = true
      const route = {
        query: {},
        fullPath: '/auth-status',
      } as unknown as RouteLocationNormalized

      const result = handleAuthStatusGuard({ route, authStore: mockAuthStore })
      expect(result).toBe(true)
    })

    it('should allow access if issued=true in query', () => {
      mockAuthStore.isAuthenticated = false
      const route = {
        query: { issued: 'true' },
        fullPath: '/auth-status',
      } as unknown as RouteLocationNormalized

      const result = handleAuthStatusGuard({ route, authStore: mockAuthStore })
      expect(result).toBe(true)
    })

    it('should redirect to login if not authenticated and issued != true', () => {
      mockAuthStore.isAuthenticated = false
      const route = {
        query: { issued: 'false' },
        fullPath: '/auth-status?issued=false',
      } as unknown as RouteLocationNormalized

      const result = handleAuthStatusGuard({ route, authStore: mockAuthStore })
      expect(result).toEqual({
        name: 'login',
        query: { redirect: '/auth-status?issued=false' },
      })
    })
  })

  describe('handleOtpGuard', () => {
    it('should always allow OTP route access', () => {
      const result = handleOtpGuard()
      expect(result).toBe(true)
    })
  })

  describe('handleAuthRouteGuard', () => {
    it('should redirect authenticated users to organizations', () => {
      mockAuthStore.isAuthenticated = true
      const route = {} as unknown as RouteLocationNormalized

      const result = handleAuthRouteGuard({ route, authStore: mockAuthStore })
      expect(result).toEqual({ name: 'organizations' })
    })

    it('should allow unauthenticated users to access auth routes', () => {
      mockAuthStore.isAuthenticated = false
      const route = {} as unknown as RouteLocationNormalized

      const result = handleAuthRouteGuard({ route, authStore: mockAuthStore })
      expect(result).toBe(true)
    })
  })

  describe('handleProtectedRouteGuard', () => {
    it('should allow authenticated users to access protected routes', () => {
      mockAuthStore.isAuthenticated = true
      const route = {} as unknown as RouteLocationNormalized

      const result = handleProtectedRouteGuard({ route, authStore: mockAuthStore })
      expect(result).toBe(true)
    })

    it('should redirect unauthenticated users to login', () => {
      mockAuthStore.isAuthenticated = false
      const route = { fullPath: '/dashboard/profile' } as unknown as RouteLocationNormalized

      const result = handleProtectedRouteGuard({ route, authStore: mockAuthStore })
      expect(result).toEqual({
        name: 'login',
        query: { redirect: '/dashboard/profile' },
      })
    })
  })

  describe('handleOrganizationGuard', () => {
    it('should allow access to setup route even with no organizations', async () => {
      mockAuthStore.isAuthenticated = true
      const route = {
        name: 'create-organization',
        matched: [{ meta: { requiresAuth: true } }],
      } as unknown as RouteLocationNormalized

      const result = await handleOrganizationGuard({
        route,
        authStore: mockAuthStore,
        organizationStore: mockOrganizationStore,
      })
      expect(result).toBe(true)
    })

    it('should skip organization guard for super admin routes', async () => {
      mockAuthStore.isAuthenticated = true
      const route = {
        name: 'super-admin-overview',
        matched: [{ meta: { requiresAuth: true, requiresSuperAdmin: true } }],
      } as unknown as RouteLocationNormalized

      const result = await handleOrganizationGuard({
        route,
        authStore: mockAuthStore,
        organizationStore: mockOrganizationStore,
      })
      expect(result).toBe(true)
    })

    it('should redirect to create-organization when no organizations', async () => {
      mockAuthStore.isAuthenticated = true
      mockAuthStore.user = { id: 'user-1' }
      const route = {
        name: 'dashboard',
        matched: [{ meta: { requiresAuth: true } }],
      } as unknown as RouteLocationNormalized

      const result = await handleOrganizationGuard({
        route,
        authStore: mockAuthStore,
        organizationStore: mockOrganizationStore,
      })
      expect(result).toEqual({ name: 'create-organization' })
    })

    it('should allow access when organizations exist', async () => {
      mockAuthStore.isAuthenticated = true
      mockOrganizationStore.hasOrganizations = true
      const route = {
        name: 'dashboard',
        matched: [{ meta: { requiresAuth: true } }],
      } as unknown as RouteLocationNormalized

      const result = await handleOrganizationGuard({
        route,
        authStore: mockAuthStore,
        organizationStore: mockOrganizationStore,
      })
      expect(result).toBe(true)
    })
  })

  describe('authGuard (main guard)', () => {
    it('should allow access to public routes', async () => {
      const route = {
        name: 'home',
        matched: [{ meta: {} }],
        query: {},
        fullPath: '/',
      } as unknown as RouteLocationNormalized

      const result = await authGuard(route)
      expect(result).toBe(true)
    })

    it('should handle auth-status route with issued=true', async () => {
      const route = {
        name: 'auth-status',
        matched: [{ meta: {} }],
        query: { issued: 'true' },
        fullPath: '/auth-status?issued=true',
      } as unknown as RouteLocationNormalized

      const result = await authGuard(route)
      expect(result).toBe(true)
    })

    it('should allow OTP route access', async () => {
      const route = {
        name: 'otp',
        matched: [{ meta: {} }],
        query: {},
        fullPath: '/otp',
      } as unknown as RouteLocationNormalized

      const result = await authGuard(route)
      expect(result).toBe(true)
    })

    it('should redirect authenticated users away from login', async () => {
      mockAuthStore.isAuthenticated = true
      const route = {
        name: 'login',
        matched: [{ meta: {} }],
        query: {},
        fullPath: '/login',
      } as unknown as RouteLocationNormalized

      const result = await authGuard(route)
      expect(result).toEqual({ name: 'organizations' })
    })

    it('should redirect unauthenticated users from protected routes to login', async () => {
      mockAuthStore.isAuthenticated = false
      const route = {
        name: 'dashboard',
        matched: [{ meta: { requiresAuth: true } }],
        query: {},
        fullPath: '/dashboard',
      } as unknown as RouteLocationNormalized

      const result = await authGuard(route)
      expect(result).toEqual({
        name: 'login',
        query: { redirect: '/dashboard' },
      })
    })

    it('should allow access to protected routes when authenticated', async () => {
      mockAuthStore.isAuthenticated = true
      mockOrganizationStore.hasOrganizations = true
      const route = {
        name: 'dashboard',
        matched: [{ meta: { requiresAuth: true } }],
        query: {},
        fullPath: '/dashboard',
      } as unknown as RouteLocationNormalized

      const result = await authGuard(route)
      expect(result).toBe(true)
    })

    it('should redirect authenticated users without organizations to create-organization', async () => {
      mockAuthStore.isAuthenticated = true
      mockAuthStore.user = { id: 'user-1' }
      const route = {
        name: 'dashboard',
        matched: [{ meta: { requiresAuth: true } }],
        query: {},
        fullPath: '/dashboard',
      } as unknown as RouteLocationNormalized

      const result = await authGuard(route)
      expect(result).toEqual({ name: 'create-organization' })
    })
  })
})
