# Compidar (Tech Radar Command) - Implementation Plan

## Overview

Add tech-radar command to compost: `compost tech-radar .` for compiling technology radar markdown files with front matter into JSON manifests and HTML content.

## Prerequisites

- Front matter support in compost (compost-frontmatter branch)
- js-yaml dependency
- @jaybeeuu/is validation system

## BDD Feature Implementation

### Feature 1: Tech Radar Content Type

**Scenario**: Compost can compile tech radar items with tech-specific front matter

**Components to Build:**

- **Tech radar schema** - Define tech item front matter structure using @jaybeeuu/is:
  ```yaml
  ---
  slug: "typescript"
  title: "TypeScript"
  quadrant: "languages" # languages | tools | techniques | platforms
  ring: "adopt" # adopt | trial | assess | hold
  description: "Static typing for JavaScript with excellent tooling"
  created: "2023-01-15"
  modified: "2024-03-20"
  ---
  ```
- **Tech radar content type** - Register tech radar as new content type
- **Output structure** - JSON metadata + separate HTML files (like blog posts)

**Testing Strategy:**

- **Add makeTechRadarFile helper** - Similar to writePostFile but with tech-specific metadata
- **Support useFrontMatter option** - Test both front matter and JSON approaches
- **Data-driven HTML compilation test** - Verify tech radar and blog posts produce similar HTML output structure

**BDD Steps:**

- **Red**: Write tests for tech radar compilation with front matter
- **Green**: Implement tech radar content type and validation
- **Commit**: Tech radar content type support

### Feature 2: Tech Radar CLI Command

**Scenario**: `compost tech-radar .` command compiles tech radar markdown files

**Components to Build:**

- **CLI command structure** - Add tech-radar subcommand to compost CLI
- **Command argument parsing** - Handle tech-radar specific options
- **Output directory structure** - Separate output from blog posts
- **Manifest format** - Tech radar specific JSON manifest structure

**Testing Strategy:**

- **CLI integration tests** - Test `compost tech-radar` command directly
- **Directory separation** - Ensure tech radar output doesn't conflict with blog posts
- **Manifest validation** - Verify correct JSON structure for tech radar items

**BDD Steps:**

- **Red**: Write integration tests for `compost tech-radar` CLI command
- **Green**: Implement tech-radar CLI command with proper argument handling
- **Commit**: Tech radar CLI command

### Feature 3: Content Type Compilation Consistency

**Scenario**: Both blog posts and tech radar items compile HTML consistently

**Testing Strategy:**

- **Data-driven compilation test** - Use `it.each` to test both content types
- **HTML structure comparison** - Verify similar HTML output patterns
- **Markdown processing consistency** - Ensure marked processes content identically

**Components to Test:**

- **Markdown → HTML conversion** - Both content types use same marked processing
- **File output structure** - Both produce JSON metadata + HTML content files
- **Build system integration** - Both work with existing build processes

**BDD Steps:**

- **Red**: Write parameterized tests comparing blog and tech radar HTML compilation
- **Green**: Ensure consistent compilation across content types
- **Commit**: Content type compilation consistency

## Technology Integration

- **js-yaml** - Front matter parsing (from compost-frontmatter)
- **@jaybeeuu/is** - Tech radar schema validation
- **marked** - Markdown → HTML (existing)
- **CLI framework** - Command structure (existing)

## Success Criteria

- `compost tech-radar .` command works identically to blog compilation
- Tech radar items validate against defined schema
- HTML output structure matches blog post patterns
- Separate output directories prevent conflicts
- Comprehensive test coverage using existing patterns
- No breaking changes to existing blog functionality

## Output Structure

```
out/
  tech-radar/
    manifest.json          # Tech radar manifest
    typescript-a1b2c3.html # Individual tech item HTML
    react-d4e5f6.html
  posts/                   # Existing blog structure unchanged
    manifest.json
    post-slug-g7h8i9.html
```
