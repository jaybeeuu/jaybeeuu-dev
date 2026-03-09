# AGENTS

## Scope

- This file applies to `packages/posts`.
- Follow the root agent guide first, then use this file for content guidance in this package.

## Package Overview

- This package contains the markdown source, metadata, and build configuration for blog posts.
- Posts are compiled with `@jaybeeuu/compost` and consumed by `@jaybeeuu/site` and `@jaybeeuu/e2e`.

## Working Rules

- Preserve established front matter fields, file naming conventions, and content organization unless the task requires a deliberate content-model change.
- Treat markdown, front matter, and generated manifests as part of a pipeline: changes here can affect site rendering and E2E coverage.
- Prefer editing source content and config; do not hand-edit generated output under `lib/`.

## Commands

- `pnpm --filter @jaybeeuu/posts build`
- `pnpm --filter @jaybeeuu/posts start`
- `pnpm --filter @jaybeeuu/posts lint`
- `pnpm --filter @jaybeeuu/posts type-check`
- `pnpm --filter @jaybeeuu/posts spell-check`

## Validation

- Run markdown linting and spell-check when changing post content or docs in this package.
- If manifest or compiled output changes, check downstream consumers in `site` and `e2e`.
- Keep front matter and config changes compatible with the validation rules used during compilation.
