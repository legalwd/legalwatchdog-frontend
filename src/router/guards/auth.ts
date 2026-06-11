import type { LocationQuery, RouteLocationNormalized } from 'vue-router'

import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'

export interface AuthStore {
  isAuthenticated: boolean
  accountPendingApproval?: boolean
  user?: { id?: string } | null
  loadCurrentUser?: () => Promise<{ id?: string } | null>
  syncAuthFromStorage(): void
}

export interface OrganizationStore {
  hasOrganizations: boolean
  loaded?: boolean
  loading?: boolean
  organizations: unknown[]
  fetchOrganizations: (
    userId: string,
    options?: { skipFallback?: boolean; prefetchSecondPage?: boolean },
  ) => Promise<void>
}

export interface GuardContext {
  route: RouteLocationNormalized
  authStore: AuthStore
}

export interface OrganizationGuardContext extends GuardContext {
  organizationStore: OrganizationStore
}

let bootstrapPromise: Promise<void> | null = null

async function bootstrapApp(
  to: RouteLocationNormalized,
  authStore: AuthStore,
  organizationStore: OrganizationStore,
) {
  if (bootstrapPromise) return bootstrapPromise
  bootstrapPromise = (async () => {
    if (!import.meta.env.SSR) {
      authStore.syncAuthFromStorage()
    }

    if (authStore.isAuthenticated) {
      await authStore.loadCurrentUser?.()
    }

    if (
      authStore.isAuthenticated &&
      requiresAuth(to) &&
      !requiresSuperAdmin(to) &&
      !isOrganizationSetupRoute(to.name)
    ) {
      const userId = authStore.user?.id ?? (await authStore.loadCurrentUser?.())?.id
      if (userId && !organizationStore.hasOrganizations && !organizationStore.loading) {
        await organizationStore.fetchOrganizations(userId, { prefetchSecondPage: false })
      }
    }
  })().finally(() => {
    bootstrapPromise = null
  })
  return bootstrapPromise
}

/**
 * Check if route is an auth route (login/signup)
 */
export function isAuthRoute(routeName?: string | symbol | null | undefined): boolean {
  return routeName === 'login' || routeName === 'signup'
}

/**
 * Check if route is the OTP verification route
 */
export function isOtpRoute(routeName?: string | symbol | null | undefined): boolean {
  return routeName === 'otp'
}

/**
 * Check if route is the organization setup route
 */
export function isOrganizationSetupRoute(routeName?: string | symbol | null | undefined): boolean {
  return routeName === 'create-organization'
}

export function isPendingApprovalRoute(routeName?: string | symbol | null | undefined): boolean {
  return routeName === 'account-pending-approval'
}

/**
 * Check if route requires authentication
 */
export function requiresAuth(to: RouteLocationNormalized): boolean {
  return to.matched.some((record: { meta: Record<string, unknown> }) => record.meta.requiresAuth)
}

/**
 * Check if route requires super admin
 */
export function requiresSuperAdmin(to: RouteLocationNormalized): boolean {
  return to.matched.some(
    (record: { meta: Record<string, unknown> }) => record.meta.requiresSuperAdmin,
  )
}

/**
 * Handle auth-status route (OAuth/social login callback)
 * Allows access if authenticated OR if issued=true query param present
 */
export function handleAuthStatusGuard(
  context: GuardContext,
): true | { name: string; query: LocationQuery } {
  const { route, authStore } = context
  const issued = route.query.issued === 'true'

  if (authStore.isAuthenticated || issued) {
    return true
  }

  return { name: 'login', query: { redirect: route.fullPath } }
}

/**
 * Handle OTP verification route
 * Always allow access (user may be verifying OTP after signup)
 */
export function handleOtpGuard(): true {
  return true
}

/**
 * Handle auth routes (login/signup)
 * Redirect authenticated users to organizations
 */
export function handleAuthRouteGuard(context: GuardContext): true | { name: string } {
  const { authStore } = context

  if (authStore.isAuthenticated) {
    return { name: 'organizations' }
  }

  return true
}

/**
 * Handle protected routes requiring authentication
 * Redirect unauthenticated users to login with redirect query
 */
export function handleProtectedRouteGuard(
  context: GuardContext,
): true | { name: string; query: LocationQuery } {
  const { route, authStore } = context

  if (authStore.isAuthenticated) {
    return true
  }

  return { name: 'login', query: { redirect: route.fullPath } }
}

/**
 * Handle organization onboarding for authenticated users with no organizations
 */
export async function handleOrganizationGuard(
  context: OrganizationGuardContext,
): Promise<true | { name: string }> {
  const { route, authStore, organizationStore } = context

  if (!authStore.isAuthenticated) return true
  if (!requiresAuth(route)) return true
  if (requiresSuperAdmin(route)) return true
  if (isOrganizationSetupRoute(route.name)) return true

  if (organizationStore.hasOrganizations) {
    return true
  }

  if (authStore.accountPendingApproval) {
    if (!route.path.startsWith('/app')) return true
    if (isPendingApprovalRoute(route.name)) return true
    return { name: 'account-pending-approval' }
  }

  const userId = authStore.user?.id ?? (await authStore.loadCurrentUser?.())?.id
  if (
    userId &&
    !organizationStore.hasOrganizations &&
    !organizationStore.loading &&
    !organizationStore.loaded
  ) {
    await organizationStore.fetchOrganizations(userId, { prefetchSecondPage: false })
  }

  if (!organizationStore.hasOrganizations) {
    return { name: 'create-organization' }
  }

  return true
}

/**
 * Check if route allows guest token access
 */
function isGuestAccessAllowed(to: RouteLocationNormalized): boolean {
  // Allow ticket-detail route with valid guest token
  if (to.name === 'ticket-detail') {
    const token = to.query.token
    return typeof token === 'string' && token.length > 0
  }
  return false
}

/**
 * Main auth guard - orchestrates all guard logic
 * Returns true to allow navigation, or a location to redirect
 */
export async function authGuard(
  to: RouteLocationNormalized,
): Promise<true | { name: string; query?: LocationQuery }> {
  const authStore = useAuthStore()
  const organizationStore = useOrganizationStore()
  const appStore = useAppStore()

  if (!appStore.ready) {
    await bootstrapApp(to, authStore, organizationStore)
    appStore.setReady(true)
  }

  const routePath = to.path ?? to.fullPath ?? ''
  if (
    requiresAuth(to) &&
    routePath.startsWith('/app') &&
    authStore.isAuthenticated &&
    !authStore.accountPendingApproval
  ) {
    await authStore.loadCurrentUser?.()
    if (authStore.accountPendingApproval) {
      return { name: 'account-pending-approval' }
    }
  }

  const context: GuardContext = { route: to, authStore }

  // Handle auth-status route
  if (to.name === 'auth-status') {
    return handleAuthStatusGuard(context)
  }

  // Allow OTP route
  if (isOtpRoute(to.name)) {
    return handleOtpGuard()
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute(to.name)) {
    return handleAuthRouteGuard(context)
  }

  // Allow guest token access to specific routes
  if (isGuestAccessAllowed(to)) {
    return true
  }

  // Skip auth check for public routes
  if (!requiresAuth(to)) {
    return true
  }

  // Check protected routes
  const protectedResult = handleProtectedRouteGuard(context)
  if (protectedResult !== true) {
    return protectedResult
  }

  return handleOrganizationGuard({ ...context, organizationStore })
}
