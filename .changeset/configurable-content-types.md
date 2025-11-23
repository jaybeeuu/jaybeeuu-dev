---
"@jaybeeuu/compost": major
"@jaybeeuu/is": minor
"@jaybeeuu/eslint-config": patch
---

# Make Compost configurable with user-defined content types

This is a major architectural refactor that transforms Compost from a blog-specific tool into a generic, configurable content processing system.

## Breaking Changes

- **Complete API overhaul**: The entire public API has been redesigned around configurable content types
- **Configuration required**: A `compost.config.ts` file is now required to define content types and their processing rules
- **Module reorganization**: Posts-specific logic moved from `/posts` to `/content` with generic abstractions
- **TypeScript type guards**: Content validation now uses TypeScript user-defined type guards instead of schema objects
- **Manifest format changes**: New V2 manifest format with backwards compatibility for V1

## New Features

- **Generic content type system**: Define custom content types with their own metadata schemas, file patterns, and processing rules
- **Flexible metadata architecture**: Separate input and output metadata types with optional transformation functions
- **User-defined validation**: Use TypeScript type guards for compile-time safe content validation
- **Automatic base metadata handling**: Common fields (title, publish) are automatically validated without user configuration
- **Hash-based change detection**: Improved performance with content hash-based change detection
- **Configurable file patterns**: Customize which files are processed for each content type

## Internal Improvements

- **Enhanced type safety**: Stronger typing throughout with generic constraints and better error handling
- **Improved test coverage**: Comprehensive integration tests for configuration validation and manifest versioning
- **Better error reporting**: More descriptive error messages with structured failure reasons
- **Performance optimizations**: Reduced redundant processing and better caching strategies

## Migration Guide

Users upgrading from previous versions will need to:

1. Create a `compost.config.ts` file defining their content types
2. Update any code using the old posts-specific API to use the new generic content API
3. Existing V1 manifests will be automatically upgraded to V2 format on first run

This change enables Compost to process any type of structured content beyond just blog posts, making it a truly generic content processing tool.
