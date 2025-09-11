---
"@jaybeeuu/site": patch
---

Migrate routing from preact-router to wouter

- Replace preact-router with wouter for better TypeScript support and smaller bundle size
- Update router configuration to use Switch/Route pattern
- Implement active link detection using useLocation hook
- Remove asRoute HOC pattern in favor of direct hook usage
- Maintain external link handling for server-served routes
- All existing functionality preserved with improved type safety
