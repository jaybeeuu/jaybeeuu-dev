# AGENTS

## Scope

- This file applies to `packages/site`.
- Follow the root [AGENTS.md](../../AGENTS.md) first, then use this file for site-specific guidance.

## Package Overview

- This package is the Preact application for `jaybeeuu.dev`.
- It is built with Vite and depends on workspace packages such as `@jaybeeuu/posts`, `@jaybeeuu/e2e-hooks`, `@jaybeeuu/preact-async`, `@jaybeeuu/preact-recoilless`, and `@jaybeeuu/recoilless`.

## Working Rules

- Keep component structure, routing, styling, and asset handling consistent with the existing app.
- Be careful when changing CSS classes, attributes, or DOM structure used by `@jaybeeuu/e2e-hooks` or Cypress tests.
- Prefer changes in `src/`; do not edit Vite output or generated assets by hand.
- When changing content rendering, routes, feeds, or manifests consumed from other packages, check downstream effects in the browser and in E2E coverage.

## Commands

- `pnpm --filter @jaybeeuu/site start`
- `pnpm --filter @jaybeeuu/site build`
- `pnpm --filter @jaybeeuu/site lint`
- `pnpm --filter @jaybeeuu/site test`
- `pnpm --filter @jaybeeuu/site type-check`

## Testing

- Prefer package-local `test`, `lint`, and `type-check` first.
- Run `pnpm e2e run` when site behavior, navigation, rendering, selectors, or content integration changes.
- If working iteratively on browser behavior, keep the site running and prefer `pnpm e2e open`.
