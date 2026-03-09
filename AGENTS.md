# AGENTS

> **Use `bd` and the `beads-mcp` for task tracking**

## 1. Purpose

- This file gives coding agents the repo-wide rules for working safely in `jaybeeuu-dev`.
- These instructions apply across the whole monorepo unless a more local `AGENTS.md` exists in a subdirectory and overrides them.
- Check the local package README and config files before changing behavior in that package.

## 2. Repository Overview

- This is a `pnpm` monorepo for `jaybeeuu.dev`: a Preact/Vite site plus the supporting libraries, content pipeline, and test tooling used to build and validate it.
- The repo is TypeScript-first. Most packages expose source in `src/` and build output in `lib/`.
- Main package groups:
   - **Content and markdown pipeline:** `@jaybeeuu/compost`, `@jaybeeuu/posts`, `@jaybeeuu/reading-time-cli`
   - **Site and browser-facing code:** `@jaybeeuu/site`, `@jaybeeuu/e2e`, `@jaybeeuu/e2e-hooks`
   - **Shared libraries:** `@jaybeeuu/is`, `@jaybeeuu/conv`, `@jaybeeuu/utilities`, `@jaybeeuu/recoilless`, `@jaybeeuu/preact-async`, `@jaybeeuu/preact-recoilless`
   - **Tooling and repo config:** `@jaybeeuu/eslint-config`, `@jaybeeuu/scripts`

## 3. Task Tracking

- Use `bd` and the `beads-mcp` for task tracking.
- Track work before changing code and keep the issue updated while implementing.
- Prefer the normal flow:
   - `bd ready --json` to find unblocked work
   - `bd create ... --json` if a task does not exist yet
   - claim the task before editing
   - create linked follow-up work for anything discovered during implementation
- Do not create markdown TODO lists or separate tracking systems in the repo.

## 4. Working Rules

- Make minimal, focused changes that match the requested scope.
- Follow the naming, file layout, test style, and config patterns already used in the package you are editing.
- Avoid broad refactors unless they are required to complete the task.
- Keep docs, tests, and type definitions in sync with behavior changes.
- Prefer editing `src/`, config, tests, and docs; only touch built output when the task explicitly requires it.

## 5. Commands

- Environment baseline:
   - Node `>=24`
   - `pnpm >=10 <11`
- Root-level commands:
   - `pnpm install`
   - `pnpm build`
   - `pnpm build-changes`
   - `pnpm test`
   - `pnpm lint`
   - `pnpm type-check`
   - `pnpm format-check`
   - `pnpm format`
   - `pnpm spell-check`
   - `pnpm gen-certs`
   - `pnpm start-all`
- Common targeted commands:
   - `pnpm --filter @jaybeeuu/site start`
   - `pnpm --filter @jaybeeuu/site build`
   - `pnpm --filter @jaybeeuu/posts start`
   - `pnpm --filter @jaybeeuu/compost test`
   - `pnpm --filter @jaybeeuu/recoilless test`
   - `pnpm --filter @jaybeeuu/<package> lint`
   - `pnpm --filter @jaybeeuu/<package> type-check`
- E2E commands:
   - start the site first
   - `pnpm e2e run` for headless Cypress runs
   - `pnpm e2e open` for interactive Cypress work
- Prefer targeted package commands first. Use full-repo runs when touching shared code, workspace config, or behavior that crosses package boundaries.

## 6. Testing Expectations

- Run the narrowest relevant validation first.
- For package-local changes, start with that package’s `test`, `lint`, and `type-check` scripts.
- Use broader validation when changing shared packages or repo-wide config:
   - root `pnpm test` for Jest project coverage across packages
   - root `pnpm lint` and `pnpm type-check` when shared APIs or config change
   - `pnpm e2e run` when site behavior, routing, rendering, or content integration changes
- For Cypress work, keep the site running while iterating and prefer `open` during development.

## 7. Package Guidance

- **Content / markdown compilation (`compost`, `posts`):** preserve frontmatter expectations, manifest shape, and file naming conventions. If compiled post output changes, check downstream consumers in `site` and `e2e`.
- **Site app (`site`):** this is a Preact app built with Vite. Keep component structure, routing, asset handling, and hook usage consistent with the existing package. Be careful with selectors and CSS classes consumed by `e2e-hooks`.
- **E2E tests (`e2e`, `e2e-hooks`):** prefer stable selectors from `@jaybeeuu/e2e-hooks`. If fixtures or compiled test content change, rebuild or rerun the relevant flow instead of patching snapshots blindly.
- **Shared utilities and state libraries (`is`, `conv`, `utilities`, `recoilless`, `preact-*`):** these packages feed other packages in the workspace and some are published. Keep API changes small, typed, and well-tested.
- **Tooling packages (`eslint-config`, `scripts`):** changes here can affect the whole repo. Validate consumers after modifying shared tooling.

## 8. Change Safety

- Do not hand-edit generated or build output unless necessary. This usually includes `lib/`, coverage artifacts, test reports, generated manifests, and generated certificates.
- Be careful with cross-package API changes; check workspace dependents before finalizing them.
- Preserve backwards compatibility unless the task explicitly requires a breaking change.
- When in doubt, check the local package README, `package.json`, `jest.config.ts`, `tsconfig*.json`, `eslint.config.ts`, `compost.config.ts`, or `cypress.config.ts` before changing behavior.

## 9. Documentation

- Update package READMEs, changelogs, and related docs when behavior, public APIs, or developer workflow changes materially.
- Keep documentation concise, practical, and aligned with the commands that already exist in the repo.
- If a change only affects internal implementation, avoid unnecessary doc churn.
