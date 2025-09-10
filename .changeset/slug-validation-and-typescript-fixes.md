---
"@jaybeeuu/compost": patch
"@jaybeeuu/site": patch
---

Add comprehensive slug validation tests and fix TypeScript build issues

- Add unit tests for validateSlug function with proper regex anchoring
- Fix slug validation regex to exclude invalid characters between Z and a
- Resolve TypeScript errors in preact-router Link components with proper type declarations
- Add Cloudflare \_headers file for correct feed content types
- Fix CircleCI config typo and update dependencies
