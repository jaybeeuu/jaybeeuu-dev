# AGENTS

## Scope

- This file applies to `packages/compost`.
- Follow the root [AGENTS.md](../../AGENTS.md) first, then use this file for `compost`-specific guidance.

## Package Overview

- `@jaybeeuu/compost` is the markdown compilation tool used to turn source content into HTML plus a manifest.
- It is part of the content pipeline used by `@jaybeeuu/posts`, `@jaybeeuu/site`, and `@jaybeeuu/e2e`.

## Working Rules

- Preserve config shape, manifest shape, file naming conventions, and CLI behaviour unless the task explicitly requires a change.
- Be careful with frontmatter parsing, metadata validation, generated hrefs, and downstream manifest consumers.
- Keep validation and typing aligned at content boundaries; this package is a key edge between loose content input and typed consumers.
- Prefer changes in `src/`; do not edit `lib/` by hand.

## Commands

- `pnpm --filter @jaybeeuu/compost build`
- `pnpm --filter @jaybeeuu/compost start`
- `pnpm --filter @jaybeeuu/compost lint`
- `pnpm --filter @jaybeeuu/compost test`
- `pnpm --filter @jaybeeuu/compost type-check`

## Testing

- Start with package-local `test`, `lint`, and `type-check`.
- If output shape changes, check downstream consumers in `posts`, `site`, and `e2e`.
- Prefer behaviour-focused tests around compilation inputs, manifest outputs, and edge-case content handling.
