# AGENTS

## Scope

- This file applies to `packages/e2e`.
- Follow the root [AGENTS.md](../../AGENTS.md) first, then use this file for package-specific E2E guidance.

## Package Overview

- This package contains Cypress end-to-end tests for `@jaybeeuu/site`.
- It also builds test content through `compost` and uses selectors from `@jaybeeuu/e2e-hooks`.

## Working Rules

- Prefer accessibility-based selectors first, using roles, names, labels, and other user-facing semantics where practical.
- Use `@jaybeeuu/e2e-hooks` when accessibility-based selectors are not reliable enough or would make the test less clear, and avoid brittle structural selectors.
- Keep tests focused on critical user journeys and browser-visible behaviour.
- Avoid adding slow or flaky coverage when a lower-weight test in another package would provide the same confidence.
- If fixtures or compiled test content change, rebuild or rerun the relevant flow instead of patching around failures.

## Commands

- Start the site first.
- `pnpm --filter @jaybeeuu/e2e build`
- `pnpm --filter @jaybeeuu/e2e lint`
- `pnpm --filter @jaybeeuu/e2e type-check`
- `pnpm e2e run`
- `pnpm e2e open`

## Testing

- Keep Cypress tests deterministic and fix flakes rather than accepting intermittent failures.
- Prefer `open` for development and troubleshooting.
- Keep test setup obvious and local where practical; avoid hidden shared state between tests.
