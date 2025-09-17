---
"@jaybeeuu/compost": minor
---

Add YAML front matter support for flexible content authoring

- Add js-yaml dependency for parsing YAML front matter from markdown files
- Support both traditional JSON metadata files (.post.json) and front matter markdown files
- Maintain 100% backward compatibility with existing blog compilation workflow
- Add comprehensive test coverage with parameterized tests comparing both approaches
- Enable future content type extensibility (tech radar, projects, etc.)

Content can now be authored using either approach:

**Traditional JSON metadata:**

```
my-post.md         # Markdown content
my-post.post.json  # Metadata
```

**Front matter approach:**

```markdown
---
title: "My Post Title"
abstract: "Post description"
publish: true
---

# My Post Title

Content goes here...
```

Both approaches produce identical compilation output.
