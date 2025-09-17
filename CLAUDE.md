# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses **pnpm** as the package manager with workspace configurations.

### Essential Commands

- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages in the repo
- `pnpm build-changes` - Build only packages that have changed since main
- `pnpm test` - Run unit tests using Jest projects
- `pnpm type-check` - Run TypeScript type checking across all packages
- `pnpm lint` - Run ESLint across all packages
- `pnpm format` - Format code using Prettier
- `pnpm format-check` - Check code formatting
- `pnpm e2e` - Run Cypress end-to-end tests (add `run` for headless or `open` for UI)

### Development Workflow

- `pnpm start-all` - Start all packages in watch mode with workspace concurrency
- `pnpm start --filter @jaybeeuu/site` - Start only the main site in development mode
- `pnpm gen-certs` - Generate development SSL certificates for HTTPS

### Single Package Commands

Use `pnpm --filter <package-name>` to run commands in specific packages:

- `pnpm --filter @jaybeeuu/site test` - Run tests for site package only
- `pnpm --filter @jaybeeuu/recoilless start` - Start recoilless package in watch mode

## Architecture Overview

### Monorepo Structure

This is a pnpm workspace monorepo containing 14 packages under `/packages/`:

**Core Application:**

- `@jaybeeuu/site` - Main blog site built with Preact + Vite

**State Management & UI:**

- `@jaybeeuu/recoilless` - Custom state management library (similar to Recoil)
- `@jaybeeuu/preact-recoilless` - Preact bindings for recoilless
- `@jaybeeuu/preact-async` - Async utilities for Preact

**Utilities & Tools:**

- `@jaybeeuu/is` - Type validation and data validation library
- `@jaybeeuu/utilities` - General purpose utility functions
- `@jaybeeuu/conv` - Environment file validation with strict typing

**Content & Build:**

- `@jaybeeuu/posts` - Markdown source and metadata for blog posts
- `@jaybeeuu/compost` - CLI tool for compiling markdown posts to HTML
- `@jaybeeuu/reading-time-cli` - CLI wrapper for reading-time package

**Development:**

- `@jaybeeuu/scripts` - Environment setup CLI scripts
- `@jaybeeuu/eslint-config` - Shared ESLint configurations
- `@jaybeeuu/e2e` - Cypress end-to-end tests
- `@jaybeeuu/e2e-hooks` - CSS classes for E2E test hooks

### Technology Stack

- **Frontend:** Preact (React alternative) with TypeScript
- **Build Tool:** Vite
- **Testing:** Jest for unit tests, Cypress for E2E
- **State Management:** Custom recoilless library
- **Styling:** CSS Modules
- **Package Management:** pnpm workspaces
- **Type Checking:** TypeScript with strict configuration

### Code Conventions

- **Strict TypeScript:** `noImplicitAny`, `noImplicitReturns`, `noUncheckedIndexedAccess` enabled
- **Module System:** ESNext modules, bundler resolution
- **Formatting:** Prettier with 2-space tabs, trailing commas, double quotes
- **Git Hooks:** Pre-commit hook runs `pretty-quick --staged` for formatting
- **Component Pattern:** Preact functional components with TypeScript interfaces
- **State Management:** Uses custom recoilless atoms/selectors pattern
- **CSS:** CSS Modules with typed definitions (`.module.css.d.ts`)

### Coding Style Preferences

- **No Comments:** Prefer expressive, self-documenting code over comments
- **Minimal Comments:** Use comments sparingly and only when absolutely necessary for complex logic
- **Expressive Code:** Choose descriptive variable/function names that make intent clear
- **Clean Code:** Favor readability and simplicity over clever solutions

### Testing Strategy

- **Unit Tests:** Jest with projects configuration for each package
- **E2E Tests:** Cypress tests in dedicated package
- **Coverage:** Collected in `./coverage-reports/unit/`
- **Test Reports:** JUnit format in `./test-reports/`

### Build & Deployment

- **Development:** Vite dev server with HTTPS certificates
- **Production:** Vite build process
- **CI/CD:** CircleCI configuration in `.circleci/`
- **Changesets:** Uses changesets for version management and releases
