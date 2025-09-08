# Migration Plan: preact-router to wouter

## Overview

This plan outlines the steps to migrate from `preact-router` to `wouter`, a minimalist routing library that works well with Preact applications. The previous attempt to migrate to preact-iso was unsuccessful.

## Current Progress

**🚀 Migration Status: 30% Complete (Steps 1-3 of 10)**

- ✅ **Step 1**: wouter installed alongside preact-router
- ✅ **Step 2**: Main router configuration updated to wouter
- ✅ **Step 3**: Navigation links migrated to wouter API
- 🔄 **Next**: Step 4 - Update route components pattern
- ⏸️ **Remaining**: Steps 4-10 pending

**Current State:**

- ✅ Builds successfully
- ✅ TypeScript compiles without errors
- ✅ 3/4 navigation e2e tests pass
- ⚠️ 1 test failing (individual post page - likely needs route parameter handling)

**Commit**: `dacdc7c` - Core routing functionality working with wouter

## Current State Analysis

The application currently uses `preact-router` in the following ways:

- Main router configuration in `packages/site/src/app/app.tsx` using `<Router>` component
- Route navigation links using `Link` from `preact-router/match` in:
  - `packages/site/src/app/nav-bar/nav-bar.tsx`
  - `packages/site/src/app/title-bar/title-bar.tsx`
  - `packages/site/src/app/posts/posts.tsx`
- Route wrapper pattern using custom `asRoute` HOC
- Routes configured for: `/`, `/blog`, `/blog/:slug`, and 404 fallback

## Migration Steps

### ✅ 1. Install wouter (Keep preact-router for now) - COMPLETED

```bash
pnpm --filter @jaybeeuu/site add wouter
```

**Note**: Do NOT remove preact-router yet - keep it installed until all migration steps are complete to ensure the app continues to compile during migration.

**Status**: ✅ Completed - wouter 3.7.1 installed alongside preact-router 4.1.2

### ✅ 2. Update Main Router Configuration - COMPLETED

**File:** `packages/site/src/app/app.tsx`

- Replace `import { Router } from "preact-router"` with `import { Switch, Route } from "wouter"`
- **Note**: wouter does not require a top-level `<Router>` component
- Update routing structure to use wouter API:
  - Use `<Switch>` to ensure only first matching route renders
  - Use `<Route>` components for route definitions
  - Handle path parameters with wouter's parameter system
  - Update 404 handling using empty `<Route>` as catch-all (place last in `<Switch>`)

**Status**: ✅ Completed - Router structure migrated to wouter's `<Switch>/<Route>` pattern

### ✅ 3. Update Navigation Links - COMPLETED

**Files:**

- `packages/site/src/app/nav-bar/nav-bar.tsx`
- `packages/site/src/app/title-bar/title-bar.tsx`
- `packages/site/src/app/posts/posts.tsx`

Changes needed:

- Replace `import { Link } from "preact-router/match"` with `import { Link, useLocation } from "wouter"`
- Update `<Link>` components to use wouter's `Link` component for internal navigation
- **IMPORTANT**: Keep external links (GitHub, LinkedIn) and server-served routes (Atom feed `/feeds/atom.xml`) as regular `<a>` tags - these should NOT be handled by the client-side router
- Implement active state detection using `useLocation()` hook or `useRoute()` hook
- Handle client-side navigation with wouter's `Link` component for internal routes only
- **Note**: wouter's `<Link>` wraps `<a>` tags and handles click events automatically

**Status**: ✅ Completed - All Link components migrated to wouter API with custom active state detection

### 4. Update Route Components Pattern

**Files:** All route components and `packages/site/src/app/as-route.tsx`

Changes needed:

- Remove or update the `asRoute` HOC since wouter handles routing differently
- Update route components to work with wouter's routing pattern
- Handle path parameters using wouter's `useParams()` hook
- Update route component props interfaces

### 5. Handle Dynamic Routes

**File:** `packages/site/src/app/post/post.tsx`

- Update slug parameter extraction from route props to wouter's `useParams()` hook
- Ensure proper integration with the existing state management (recoilless)

### 6. Update Type Definitions

- Remove any custom type definitions for preact-router
- Add type definitions for wouter if needed
- Update component prop types to match new routing system

### 7. Testing Each Step with Cypress

After each major change, run the relevant Cypress tests to ensure functionality remains intact:

- **After step 2 (Router config)**: Run `pnpm e2e run --spec "integration/start-up.cy.ts"` to verify basic app startup
- **After step 3 (Navigation links)**: Run `pnpm e2e run --spec "integration/navigation-links.cy.ts"` to verify link functionality and active states
- **After step 4 (Route components)**: Run `pnpm e2e run --spec "integration/navigation-links.cy.ts"` again to verify route rendering
- **After step 5 (Dynamic routes)**: Test individual blog post access with manual navigation to `/blog/[slug]`
- **After all steps**: Run full test suite with `pnpm e2e run` to verify complete functionality

### 8. Remove preact-router dependency

```bash
pnpm --filter @jaybeeuu/site remove preact-router
```

**Test**: Run `pnpm build` and `pnpm type-check` to verify no compilation errors after removing preact-router.

### 9. Update Build Configuration

- Verify Vite configuration works with wouter
- Ensure proper code splitting if applicable
- Update any route-based optimizations
- **Test**: Run `pnpm build` and verify no build errors

## Key Differences to Address

### preact-router vs wouter

1. **Component Structure**: preact-router uses component-based routes, wouter uses `<Route>` components (no top-level `<Router>` required)
2. **Link Handling**: Both provide `<Link>` components, but wouter's wraps `<a>` tags automatically
3. **Parameter Access**: wouter uses `useParams()` hook instead of route props
4. **Active State**: wouter provides `useLocation()` and `useRoute()` hooks for custom active state implementation
5. **404 Handling**: wouter uses empty `<Route>` as catch-all (must be placed last in `<Switch>`)
6. **Route Exclusions**: Need to properly exclude server-served routes (like `/feeds/atom.xml`) from client-side routing
7. **Bundle Size**: wouter is significantly smaller (~2.1 KB) compared to preact-router

### Migration Challenges

1. **Custom asRoute HOC**: May need significant refactoring or removal since wouter doesn't require top-level `<Router>`
2. **Active Link Detection**: Will need custom implementation using `useLocation()` or `useRoute()` hooks
3. **Route Parameters**: Different parameter extraction pattern using `useParams()` hook
4. **State Integration**: Ensure compatibility with existing recoilless state management
5. **Server Route Exclusions**: Ensure Atom feed (`/feeds/atom.xml`) and other server-served content bypass client-side routing
6. **Route Structure**: Need to restructure from component-based routing to `<Switch>/<Route>` pattern

## Rollback Plan

If issues arise during migration:

1. Revert package.json changes
2. Restore original import statements
3. Run `pnpm install` to restore preact-router
4. Test application functionality

### 10. Update Changelog with Changesets

- Create a changeset documenting the migration from preact-router to wouter
- Include breaking changes if any APIs change
- Document any new features or improvements gained from the migration

## Success Criteria

- All existing routes work correctly
- Navigation between routes functions properly
- Active link highlighting works with custom implementation
- Server-served routes (atom feed) bypass client-side routing
- 404 page displays for invalid routes
- No TypeScript errors
- All existing tests pass (unit and e2e)
- Changelog updated with appropriate changeset
