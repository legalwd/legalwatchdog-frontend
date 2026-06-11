# Latest Implementations

This document tracks recent major changes and migrations in the project to help contributors stay up-to-date.

## Table of Contents

1. [Package Manager Migration: npm -> pnpm](#package-manager-migration-npm---pnpm-december-2025)
2. [TypeScript Strict Mode Enforcement](#typescript-strict-mode-enforcement-december-2025)
3. [Auth Guards Refactoring](#auth-guards-refactoring-december-2025)
4. [Dashboard Routes Migration: /dashboard/* -> /app/*](#dashboard-routes-migration-dashboard---app-december-2025)

---

## Package Manager Migration: npm -> pnpm (December 2025)

The project has migrated from **npm** to **pnpm** for better performance, disk space efficiency, and stricter dependency management.

### Setup

**For first time clone** Enable corepack and install:
```bash
corepack enable && pnpm install && pnpm run dev
```

**If migrating from npm** Clean install:
```bash
rm -rf node_modules package-lock.json && corepack enable && pnpm install
```

Replace `npm` commands with `pnpm`: `npm install` -> `pnpm install`, `npm run dev` -> `pnpm dev`, etc.

### Key Changes

- **Configuration**: `.npmrc` (pnpm config), `.nvmrc` (Node 20.19.0+), `package.json` (packageManager field)
- **New Scripts**: `lint:strict` (zero warnings), `format:check`, `test:unit:run`, `ci` (full pipeline)
- **Benefits**: Faster installs, disk space savings, stricter dependency resolution, smaller lockfile

### Issues

| Problem | Fix |
|---------|-----|
| "Unsupported engine" | Update Node.js to v20.19.0+ |
| Dependencies not resolving | `rm -rf node_modules pnpm-lock.yaml .pnpm-store && pnpm install` |
| Pre-commit hooks failing | Pull latest changes (updated to use pnpm) |

See [CONTRIBUTING.md](../CONTRIBUTING.md) for more details.

---

## TypeScript Strict Mode Enforcement (December 2025)

The project enforces **strict TypeScript** with additional strictness flags (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`) and zero-tolerance ESLint rules, ensuring maximum type safety.

### Common Patterns

**Optional Props** - Explicitly include `undefined`:
```typescript
// Correct
interface Props {
  title?: string | undefined
}
const props = withDefaults(defineProps<Props>(), {
  title: undefined
})

// For objects, use factory
const props = withDefaults(defineProps<Props>(), {
  config: () => ({})
})
```

**Index Access** - Check for undefined:
```typescript
// Use optional chaining
array[0]?.property

// Or check explicitly
if (array[0]) { array[0].property }
```

**Props** - Don't pass undefined explicitly:
```typescript
// Correct - conditional spread
const componentProps = computed(() => ({
  required: value,
  ...(optional ? { optional } : {})
}))
<Component v-bind="componentProps" />
```

**UI Components** - Use proper prop forwarding:
```typescript
const props = defineProps<ComponentProps>()
const forwarded = computed(() => 
  filterUndefined(useForwardProps(props).value)
)
```

**Store Mappers** - Conditionally spread optional fields:
```typescript
return {
  id: item.id,
  name: item.name,
  ...(item.description ? { description: item.description } : {})
}
```

**Type Definitions** - Explicit undefined in unions:
```typescript
interface User {
  id: string
  name: string
  email?: string | undefined
  avatar?: string | undefined
}
```

### Environment Validation

Added Zod-based runtime validation (`src/types/env.ts`). Application won't start if required variables are missing/invalid:
- `VITE_API_BASE_URL` (required, must be valid URL)
- `VITE_MICROSOFT_REDIRECT_URI`, `VITE_APPLE_CLIENT_ID`, `VITE_APPLE_REDIRECT_URI` (optional)

### Key Files Modified

- `src/types/*.ts` - Optional fields updated with explicit `| undefined`
- `src/stores/*.ts` - Conditional spreading for optional properties
- `src/components/ui/**/*.vue` - Proper prop forwarding
- `src/views/**/*.vue` - Conditional prop binding
- `src/lib/utils.ts` - `filterUndefined` helper using `unknown`
- ESLint - Zero suppressions, import ordering enforced

### Verification

```bash
pnpm type-check  # TypeScript with strict flags
pnpm lint        # ESLint zero warnings
pnpm build       # Production build
pnpm ci          # Full pipeline
```

### Issues

| Problem | Fix |
|---------|-----|
| Type errors after pull | Run `pnpm type-check` and add `\| undefined` to optional fields, use optional chaining, conditionally spread props |
| Import order errors | Run `pnpm lint --fix` |
| Props not accepting undefined | Use conditional spreading or factory functions in `withDefaults` |

See `src/components/ui/` for component examples.

---

## Auth Guards Refactoring (December 2025)

Authentication guard logic refactored into a modular, testable system with `unplugin-vue-router` for typed routes. Guard logic extracted from `main.ts`.

### Structure

- **Module**: `src/router/guards/auth.ts` 
- **Tests**: `src/router/guards/auth.spec.ts` 
- **Integration**: `src/main.ts` - Single line: `router.beforeEach(authGuard)`

### Guard Functions

| Function | Purpose |
|----------|---------|
| `authGuard(to)` | Main orchestrator (use in `router.beforeEach`) |
| `isAuthRoute(routeName)` | Check if login/signup |
| `isOtpRoute(routeName)` | Check if OTP route |
| `requiresAuth(route)` | Check `meta: { requiresAuth: true }` |
| `handleAuthStatusGuard(context)` | OAuth callback (checks `issued=true`) |
| `handleOtpGuard()` | Always allow OTP |
| `handleAuthRouteGuard(context)` | Redirect authenticated from auth pages |
| `handleProtectedRouteGuard(context)` | Protect routes requiring auth |

### Adding Protected Routes

Add `meta: { requiresAuth: true }` to route definition. Guard auto-redirects unauthenticated users to login with redirect query:

```typescript
{
  path: '/dashboard/admin',
  name: 'admin-dashboard',
  component: AdminDashboardView,
  meta: { requiresAuth: true }
}
```

After login, redirect to original path via: `router.push(route.query.redirect || { name: 'dashboard' })`

### Extending Guards

Never modify `main.ts` guard logic. To add new guards:

1. Create function in `src/router/guards/auth.ts`:
   ```typescript
   export function handleAdminGuard(context: GuardContext): true | { name: string } {
     const { authStore } = context
     return authStore.user?.role === 'admin' ? true : { name: 'unauthorized' }
   }
   ```

2. Add test to `src/router/guards/auth.spec.ts` (maintain 100% coverage)

3. Integrate in appropriate handler

### Guard Flow

Routes handled in order: OAuth callback -> OTP -> Auth routes -> Protected routes -> Public routes

### Testing

Run: `pnpm test:unit:run src/router/guards/auth.spec.ts`

Test components needing auth:
```typescript
import { useAuthStore } from '@/stores/auth-store'
import { vi } from 'vitest'

vi.mock('@/stores/auth-store')

it('shows dashboard when authenticated', () => {
  ;(useAuthStore as any).mockReturnValue({
    isAuthenticated: true,
    user: { id: '1', name: 'Test' }
  })
  // test component
})
```

### Import Guards

```typescript
import {
  authGuard,
  isAuthRoute,
  requiresAuth,
  handleProtectedRouteGuard,
  type AuthStore,
  type GuardContext
} from '@/router/guards/auth'
```

### Type Safety

- `GuardContext`: Contains typed `route` and `authStore`
- `AuthStore`: Interface with `isAuthenticated` and `syncAuthFromStorage()`
- Full TypeScript prevents invalid contexts and missing properties

### Issues

| Problem | Check |
|---------|-------|
| User redirects unexpectedly | Does route have `meta: { requiresAuth: true }`? Is user authenticated? Did `syncAuthFromStorage()` run (automatic)? |
| TypeScript errors | Using correct types (`AuthStore`, `GuardContext`)? Is mock compatible with `AuthStore`? |
| Tests fail after changes | Are tests updated to match new behavior? |

See `docs/router-guards-quick-reference.md` and `docs/router-guard-examples.md` for quick reference and examples.

---

## Dashboard Routes Migration: /dashboard/* -> /app/* (December 2025)

All dashboard routes have been migrated from `/dashboard/*` to `/app/*` for clearer URL semantics. The application structure remains unchanged; this is purely a routing refactor.

### What Changed

**Route Base**: `/dashboard` -> `/app`
- `/app` - Dashboard entry (redirects to projects list)
- `/app/dashboard` - Alias for dashboard entry point
- `/app/organizations`, `/app/jurisdictions`, `/app/profile`, etc. - All subpaths under `/app`

**Backward Compatibility**: All old `/dashboard/*` links automatically redirect to `/app/*` via a catch-all redirect route.

### For Contributors

#### Using Dashboard Routes

When linking to dashboard pages, use `/app` paths:

```vue
<!-- New way -->
<RouterLink to="/app/organizations">Organizations</RouterLink>
<RouterLink to="/app/jurisdictions">Jurisdictions</RouterLink>

<!-- Old way (still works via redirect, but avoid) -->
<RouterLink to="/dashboard/organizations">...</RouterLink>
```

#### Adding New Dashboard Routes

All new routes under the dashboard layout should use `/app` path:

```typescript
{
  path: '/app/new-feature',
  name: 'new-feature',
  component: NewFeatureView,
  meta: { requiresAuth: true }
}
```

#### Programmatic Navigation

When using `router.push()`:

```typescript
// New way
router.push({ name: 'organizations' })  // Route name-based (recommended)
router.push('/app/organizations')       // Path-based

// Old way (avoid)
router.push('/dashboard/organizations')  // Redirects to /app/organizations
```

### Files Modified

**Router**: `src/router/index.ts`
- Root path changed to `/app`
- Catch-all redirect: `/dashboard/:pathMatch(.*)*` -> `/app/:pathMatch(.*)*`

**Components**: 8 files updated with `/app` paths
- Sidebar navigation links
- Header dashboard detection
- Project view CTA
- Organization view links
- Jurisdiction navigation

### Migration Path

**Old URLs still work** but are redirected:
- `/dashboard` -> `/app` (entry point)
- `/dashboard/organizations` -> `/app/organizations`
- `/dashboard/jurisdictions/123` -> `/app/jurisdictions/123`

**During development**, bookmark and remember `/app` as the new base path.

### Testing

Routes with `requiresAuth: true` automatically protect `/app/*` paths. Guards check for authentication and redirect to login if needed.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Links still point to `/dashboard` | Find and update to `/app` using sidebar/header as reference |
| Old bookmarks broken | Redirect routes handle them; update bookmarks to `/app` |
| Tests reference `/dashboard` | Update test fixtures to use `/app` (keep unit test redirects as-is) |

---

## Future Implementations

This section will be updated as new features and architectural changes are introduced.
