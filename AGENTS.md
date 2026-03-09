# AGENTS

## 1. Purpose

- This file gives coding agents the repo-wide rules for working safely in `jaybeeuu-dev`.
- This root `AGENTS.md` applies across the whole monorepo unless a more local `AGENTS.md` exists in a subdirectory and overrides it for that subtree.
- Agents should follow the most local applicable `AGENTS.md` for the code they are editing. Package-level files such as `packages/site/AGENTS.md` or `packages/e2e/AGENTS.md` can add package-specific workflows, commands, and constraints.
- Check the local package README and config files before changing behavior in that package.

## 2. Repository Overview

- This is a `pnpm` monorepo for `jaybeeuu.dev`: a Preact/Vite site plus the supporting libraries, content pipeline, and test tooling used to build and validate it.
- The repo is TypeScript-first. Most packages expose source in `src/` and build output in `lib/`.
- Main package groups:
  - **Content and markdown pipeline:** `@jaybeeuu/compost`, `@jaybeeuu/posts`, `@jaybeeuu/reading-time-cli`
  - **Site and browser-facing code:** `@jaybeeuu/site`, `@jaybeeuu/e2e`, `@jaybeeuu/e2e-hooks`
  - **Shared libraries:** `@jaybeeuu/is`, `@jaybeeuu/conv`, `@jaybeeuu/utilities`, `@jaybeeuu/recoilless`, `@jaybeeuu/preact-async`, `@jaybeeuu/preact-recoilless`
  - **Tooling and repo config:** `@jaybeeuu/eslint-config`, `@jaybeeuu/scripts`, and the repo-level `changeset` configuration under `.changeset/`

## 3. Task Tracking

- Use GitHub Issues as the primary tracker for cloud-agent work.
- Use `bd` and the `beads-mcp` optionally for local planning, ready-work discovery, and dependency tracking.
- When both are used, keep GitHub as canonical and avoid duplicate unmanaged task lists in markdown or ad hoc notes.
- Track work before changing code and keep the relevant GitHub issue updated while implementing.
- If you use `bd`, prefer it as a working layer on top of GitHub-backed tasks:
  - use GitHub Issues for the authoritative task record, acceptance details, and status
  - use `bd ready --json` to find unblocked local work when helpful
  - create or update linked follow-up work when you discover dependencies or additional tasks
  - reconcile any important status changes back to GitHub before finishing

## 4. Git and PR Workflow

- Treat `main` as protected. Do not plan on landing work by pushing directly to `main`.
- Make changes on a branch and expect the normal path to be a pull request.
- Keep commits focused and easy to review. Avoid mixing unrelated package changes unless the task requires a cross-package change.
- If a task changes behavior across packages, describe the cross-package impact clearly in the PR or issue updates.

## 5. Working Rules

- Make minimal, focused changes that match the requested scope.
- Follow the naming, file layout, test style, and config patterns already used in the package you are editing.
- Avoid broad refactors unless they are required to complete the task.
- Keep docs, tests, and type definitions in sync with behavior changes.
- Prefer editing `src/`, config, tests, and docs; only touch built output when the task explicitly requires it.

## 6. Typing

- Keep TypeScript strict, self-documenting, and as complete as is feasible for the package you are changing.
- Prefer explicit types at module boundaries and public APIs: exported functions, component props, return values, config objects, parsed content, and shared package interfaces should be clearly typed.
- Model domain concepts with named types when that improves clarity. Prefer readable type aliases, interfaces, discriminated unions, and typed result shapes over loose object literals.
- Avoid `any`, broad casts, and non-null assertions unless there is no practical alternative. If you must use one, keep it narrow and local.
- Prefer types that describe the real runtime contract. When validating unknown data, keep runtime validation and static typing aligned.
- Validate inputs and outputs at the edges of the system. Do not assume user input, frontmatter, environment variables, file contents, network responses, third-party API payloads, or other loosely typed external data already match your TypeScript types.
- Parse, validate, and narrow unknown data before it reaches core logic. Prefer explicit guards, validators, and conversion steps at the boundary over pushing unchecked values deeper into the package.
- When returning data to other packages or external consumers, make the output contract explicit and keep serialization or transformation steps aligned with the declared types.
- Reuse existing repo patterns for validation and typing, especially packages such as `@jaybeeuu/is` and `@jaybeeuu/conv`, rather than inventing parallel approaches.
- Let inference work for local implementation details when it stays obvious, but do not rely on inference where it hides intent or weakens public API clarity.
- Keep type definitions updated with behaviour changes so `pnpm type-check` stays meaningful across package boundaries.

## 7. Commands

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

## 8. Version Management

- This repo uses the `changeset` tool from `@changesets/cli` for version tracking and releases.
- Use these commands for version workflow:
  - `pnpm changeset` to run the interactive `changeset` CLI and create a release-intent file for package changes
  - `pnpm changeset status --verbose` to inspect pending release state from existing changeset files
  - `pnpm changeset version` to apply version bumps and update package changelogs from recorded changesets
- If you change a published package or public API, run `pnpm changeset` and add or update the generated changeset unless the task explicitly says not to.
- `pnpm changeset` is interactive by default. For automation or agent workflows that cannot answer prompts, write the changeset file directly in `.changeset/` instead of waiting on interactive input.
- Do not manually edit package versions or changelog release entries when the `changeset` workflow should produce them.
- Agents should add or update changesets when needed, but should not run release publishing steps unless explicitly asked.
- For releasable package changes, keep the `changeset` files aligned with the code change so versioning and generated changelog output stay accurate.

## 9. Testing Expectations

- Run the narrowest relevant validation first.
- Prefer tests with a strong value-to-weight ratio: choose tests that give clear confidence for the maintenance cost, setup complexity, and runtime they add.
- Test behaviour and public APIs rather than implementation details. Refactors that preserve behaviour should not force widespread test rewrites.
- For package-local changes, start with that package’s `test`, `lint`, and `type-check` scripts.
- Prefer package-local `lint`, `test`, and `type-check` runs for package-local changes. Use broader repo validation only when the change affects shared code, repo config, or behavior that crosses package boundaries.
- Use broader validation when changing shared packages or repo-wide config:
  - root `pnpm test` for Jest project coverage across packages
  - root `pnpm lint` and `pnpm type-check` when shared APIs or config change
  - `pnpm e2e run` when site behavior, routing, rendering, or content integration changes
- Keep tests independent, deterministic, and passing. Fix flakes instead of working around them or normalizing intermittent failures.
- Keep setup minimal and local to the test. Prefer obvious inline data and small helpers over hidden state, broad hooks, or over-abstracted fixtures.
- Treat test code like production code: keep it readable, maintainable, and aligned with the package’s linting and typing standards.
- Prefer unit and integration tests for fast feedback, and use E2E coverage for the smaller set of critical user journeys where browser-level confidence is worth the extra weight.
- For Cypress work, keep the site running while iterating and prefer `open` during development.

## 10. Package Guidance

- **Content / markdown compilation (`compost`, `posts`):** preserve frontmatter expectations, manifest shape, and file naming conventions. If compiled post output changes, check downstream consumers in `site` and `e2e`.
- **Site app (`site`):** this is a Preact app built with Vite. Keep component structure, routing, asset handling, and hook usage consistent with the existing package. Be careful with selectors and CSS classes consumed by `e2e-hooks`.
- **E2E tests (`e2e`, `e2e-hooks`):** prefer stable selectors from `@jaybeeuu/e2e-hooks`. If fixtures or compiled test content change, rebuild or rerun the relevant flow instead of patching snapshots blindly.
- **Shared utilities and state libraries (`is`, `conv`, `utilities`, `recoilless`, `preact-*`):** these packages feed other packages in the workspace and some are published. Keep API changes small, typed, and well-tested.
- **Tooling packages (`eslint-config`, `scripts`):** changes here can affect the whole repo. Validate consumers after modifying shared tooling.

## 11. Change Safety

- Do not hand-edit generated or build output. This usually includes `lib/`, coverage artifacts, test reports, generated manifests, generated post output, and generated certificates.
- Be careful with cross-package API changes; check workspace dependents before finalizing them.
- Preserve backwards compatibility unless the task explicitly requires a breaking change.
- When in doubt, check the local package README, `package.json`, `jest.config.ts`, `tsconfig*.json`, `eslint.config.ts`, `compost.config.ts`, or `cypress.config.ts` before changing behavior.

## 12. Documentation

- Update package READMEs, changelogs, and related docs when behavior, public APIs, or developer workflow changes materially.
- Keep documentation concise, practical, and aligned with the commands that already exist in the repo.
- If a change only affects internal implementation, avoid unnecessary doc churn in READMEs, changelogs, and other user-facing docs.
