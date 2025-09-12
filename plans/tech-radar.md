# Tech Radar Implementation Plan - BDD Approach

## Overview

Building a tech radar visualization for the jaybeeuu.dev blog site using BDD methodology. Each feature follows the Red-Green-Refactor cycle with E2E tests driving implementation.

## BDD Feature Implementation

### Feature 1: Tech Radar Page Navigation

**Scenario**: User can navigate to the tech radar page

**Components to Build:**

- **TechRadar Page Component** (`packages/site/src/app/tech-radar/tech-radar.tsx`) - Main page component routed to `/tech-radar`
- **Route Configuration** (modify `packages/site/src/app/app.tsx`) - Add new route to Switch component
- **E2E Test** (`packages/e2e/integration/tech-radar.cy.ts`) - Test navigation and page rendering
- **E2E Helper Functions** (`packages/e2e/features/tech-radar.ts`) - Helper functions for selecting elements

**BDD Steps:**

- **Red**: Write E2E test that navigates to `/tech-radar` and expects page to exist
- **Green**: Create basic tech radar route and page component
- **Commit**: Basic tech radar page navigation

### Feature 2: Tech Radar Structure Display

**Scenario**: User sees a structured tech radar with quadrants

**Components to Build:**

- **RadarQuadrants Component** - SVG/Canvas quadrant layout with labels
- **Quadrant data structure** - TypeScript interfaces for quadrant definitions
- **Quadrant positioning logic** - Mathematical functions for quadrant boundaries

**BDD Steps:**

- **Red**: Write E2E test expecting 4 quadrants (Tools, Techniques, Platforms, Languages)
- **Green**: Implement basic radar structure with quadrant labels
- **Commit**: Tech radar quadrants structure

### Feature 3: Technology Rings Visualization

**Scenario**: User sees concentric rings representing adoption levels

**Components to Build:**

- **RadarRings Component** - SVG concentric circles with labels
- **Ring data structure** - TypeScript interfaces for adoption levels
- **Ring positioning math** - Radius calculations and label positioning

**BDD Steps:**

- **Red**: Write E2E test expecting rings (Adopt, Trial, Assess, Hold)
- **Green**: Implement ring visualization with SVG circles and labels
- **Commit**: Technology rings display

### Feature 4: Compost Front Matter Support

**Scenario**: Compost supports front matter parsing for different content types

**Components to Build:**

- **Front matter parsing** - Add YAML front matter support to compost
- **Generic content types** - Support different schemas (blog posts, tech items)
- **CLI command structure** - Prepare for multiple commands (blog, tech-radar)

**BDD Steps:**

- **Red**: Write tests for front matter parsing with existing blog functionality
- **Green**: Add front matter support while maintaining backward compatibility
- **Commit**: Front matter support in compost

### Feature 5: Tech Radar Command in Compost

**Scenario**: Compost supports `compost tech-radar .` command

**Components to Build:**

- **Tech radar command** - Add `tech-radar` subcommand to compost CLI
- **Tech item types** - TypeScript interfaces for quadrants, rings, tech items
- **Front matter schema** - Define tech radar front matter structure using @jaybeeuu/is:
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
- **Output structure** - Generate separate JSON metadata and HTML content files (like posts)
  - JSON: Contains front matter + metadata + URL to HTML file
  - HTML: Rendered markdown content as separate file
- **YAML parsing** - Use js-yaml for front matter parsing
- **Validation** - Use @jaybeeuu/is schemas to validate front matter structure
- **Compilation logic** - Parse tech markdown files with tech-specific front matter
- **Integration tests** - Test tech radar compilation using mock filesystem

**BDD Steps:**

- **Red**: Write integration tests for `compost tech-radar` command
- **Green**: Implement tech-radar command in compost
- **Commit**: Technology compiler command

### Feature 6: Technology Data Package

**Scenario**: Markdown source files for technology items

**Components to Build:**

- **@jaybeeuu/tech-radar-data** - Markdown files and build system
  - Individual .md files for sample technologies with front matter
  - Uses `compost tech-radar .` to build final JSON
  - Package.json script to run the build process

**BDD Steps:**

- **Red**: Write test expecting built JSON output from markdown sources
- **Green**: Create data package with sample tech items and build system
- **Commit**: Technology data source

### Feature 7: Technology Items Display

**Scenario**: User sees technology items positioned on the radar

**Site Components:**

- **TechItem Component** - Individual technology blip/dot with label
- **Positioning algorithm** - Convert quadrant/ring to x,y coordinates
- **Data loading system** - Import built JSON from tech-radar-data package

**BDD Steps:**

- **Red**: Write E2E test expecting specific technologies in correct quadrants/rings
- **Green**: Implement rendering components using tech-radar-data
- **Commit**: Technology items positioning

### Feature 8: Technology Interaction

**Scenario**: User can interact with technology items

**Components to Build:**

- **TechItemDetails Component** - Tooltip/modal showing technology details
- **Hover state management** - Mouse event handlers and state tracking
- **Accessibility features** - Keyboard navigation and screen reader support
- **Detail content system** - Rich descriptions, links, status explanations

**BDD Steps:**

- **Red**: Write E2E test for hover/click interactions showing technology details
- **Green**: Implement interactive hover states and detail display
- **Commit**: Interactive technology details

### Feature 9: Responsive Design

**Scenario**: Tech radar works on mobile devices

**Components to Build:**

- **Responsive radar sizing** - CSS/JS for viewport-based scaling
- **Touch interaction handlers** - Mobile-friendly touch events
- **Mobile layout adjustments** - Stack/reflow for small screens
- **Performance optimizations** - Efficient rendering on mobile devices

**BDD Steps:**

- **Red**: Write E2E test checking mobile viewport behavior
- **Green**: Implement responsive CSS and mobile-friendly interactions
- **Commit**: Mobile responsive design

### Feature 10: Blog Style Integration

**Scenario**: Tech radar styling matches and integrates with blog design

**Components to Build:**

- **CSS theme integration** - Use existing CSS custom properties/variables
- **Typography consistency** - Match blog fonts and text styles
- **Color scheme alignment** - Use blog's color palette and theme system
- **Layout pattern matching** - Follow blog's spacing and structure patterns

**BDD Steps:**

- **Red**: Write E2E test checking visual consistency with blog theme
- **Green**: Apply blog-consistent styling, typography, and layout patterns
- **Commit**: Blog-integrated styling

### Feature 11: Navigation Integration

**Scenario**: User can access tech radar from main navigation

**Components to Build:**

- **Navigation link addition** - Add tech radar link to nav-bar.tsx
- **Active state handling** - Highlight tech radar when on that page
- **E2E navigation helpers** - Update test utilities for new link

**BDD Steps:**

- **Red**: Write E2E test checking tech radar link in navigation
- **Green**: Add tech radar link to existing navigation component
- **Commit**: Navigation integration

## Technology Considerations

- **Frontend**: Preact + TypeScript (matching existing stack)
- **Styling**: CSS Modules (following site conventions)
- **State**: Custom recoilless library for any state management needs
- **Testing**: Jest for unit tests, Cypress for E2E if needed
- **Build**: Vite (existing build tool)

## Success Criteria

- Interactive tech radar with clear quadrants and rings
- Responsive design working on all devices
- Proper integration with existing site navigation
- Style that makes sense in the blog context and matches site design
- Clean, typed TypeScript code following project conventions
- Comprehensive test coverage
