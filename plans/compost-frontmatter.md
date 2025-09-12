# Compost Front Matter Support - Implementation Plan

## Overview

Add YAML front matter parsing support to the existing @jaybeeuu/compost package while maintaining backward compatibility with current blog functionality.

## Goals

- Add generic front matter parsing capability using js-yaml
- Maintain 100% backward compatibility with existing blog compilation
- Prepare foundation for multiple content types (blogs, tech radar items, etc.)
- Comprehensive test coverage using existing mock filesystem utilities

## BDD Feature Implementation

### Feature 1: Front Matter Infrastructure

**Scenario**: Compost can parse YAML front matter from markdown files

**Components to Build:**

- **YAML parsing module** - Add js-yaml dependency and parsing logic
- **Front matter extraction** - Separate front matter from markdown content
- **Generic content interface** - TypeScript interfaces for front matter content
- **Backward compatibility** - Ensure existing blog compilation still works

**Testing Strategy:**

- **Modify writePostFile helper** - Add `useFrontMatter` option to treat meta as front matter in markdown
- **Data-driven test** - Use `it.each` with object signature to test both approaches
- **Manifest comparison** - Ensure front matter and JSON file produce identical manifests

**BDD Steps:**

- **Red**: Write parameterized test comparing front matter vs JSON file approaches
- **Green**: Implement YAML front matter parsing infrastructure
- **Commit**: Front matter parsing foundation

### Feature 2: Blog Content Type Migration

**Scenario**: Existing blog posts work with new front matter system

**Components to Build:**

- **Blog content schema** - Define blog post front matter structure using existing post metadata
- **Migration compatibility** - Handle posts with and without front matter
- **Schema validation** - Use @jaybeeuu/is to validate blog post front matter
- **Integration testing** - Ensure all existing blog functionality works

**BDD Steps:**

- **Red**: Write tests ensuring existing blog posts compile identically
- **Green**: Implement blog content type with front matter support
- **Commit**: Blog front matter compatibility

### Feature 3: Generic Content Type System

**Scenario**: Compost supports multiple content types with different schemas

**Components to Build:**

- **Content type registry** - System for registering different content types
- **Schema validation framework** - Generic validation using @jaybeeuu/is schemas
- **Output formatting** - Different JSON structures per content type
- **CLI preparation** - Foundation for multiple commands (blog, tech-radar, etc.)

**BDD Steps:**

- **Red**: Write tests for multiple content types with different schemas
- **Green**: Implement generic content type system
- **Commit**: Multi-content type support

## Technology Requirements

- **js-yaml** - YAML parsing for front matter
- **@jaybeeuu/is** - Schema validation
- **Backward compatibility** - All existing functionality must continue working
- **Mock filesystem testing** - Use existing compost test infrastructure

## Success Criteria

- All existing blog compilation works identically
- Front matter parsing handles YAML syntax correctly
- Multiple content types can be defined and validated
- Comprehensive test coverage matches existing compost standards
- No breaking changes to existing APIs or output formats
- Foundation ready for tech-radar command implementation

## Migration Strategy

1. **Additive changes only** - New functionality alongside existing code
2. **Feature flags** - Enable front matter parsing conditionally
3. **Regression testing** - Extensive testing against existing blog posts
4. **Documentation** - Update README with front matter capabilities
