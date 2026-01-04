# compost

[![npm](https://img.shields.io/npm/v/@jaybeeuu/compost.svg)](https://www.npmjs.com/package/@jaybeeuu/compost)

A CLI tool that compiles markdown files into HTML with a manifest. Uses [marked](https://marked.js.org/) for markdown, [prism](https://prismjs.com/) for syntax highlighting.

## Quick Start

1. Install:

```sh
npm install @jaybeeuu/compost
```

2. Create a config file `compost.config.ts`:

```typescript
import { createCompostConfig } from "@jaybeeuu/compost/config";
import { is, isObject } from "@jaybeeuu/is";

const isMyMeta = isObject({
  description: is("string"),
});

export default createCompostConfig("article", {
  sourceDir: "./content",
  outputDir: "./dist",
  hrefRoot: "/articles",
  validateInputMeta: (data): data is { description: string } => isMyMeta(data),
  mapToManifestEntry: (input) => ({ description: input.description }),
});
```

3. Write some content in `content/hello-world.article.md`:

```markdown
---
title: Hello World
publish: true
description: My first article
---

# Hello World

Your content here.
```

4. Run it:

```sh
compost --config ./compost.config.js
```

This outputs `hello-world-abc123.html` and a manifest to `./dist`.

## CLI Options

```sh
compost --help
```

| Option               | Description                             | Default |
| -------------------- | --------------------------------------- | ------- |
| --config             | Path to config file (required)          |         |
| -w, --watch          | Watch for changes and recompile         | false   |
| -c, --clean          | Clean output directory before compiling | false   |
| --includeUnpublished | Include content with `publish: false`   | false   |

## Config Options

The config object passed to `createCompostConfig(contentType, options)`:

```typescript
{
  // Required
  sourceDir: string;              // Where to find markdown files
  outputDir: string;              // Where to write compiled HTML

  // Validation (recommended)
  validateInputMeta: (data) => data is YourType;  // Type guard for frontmatter
  mapToManifestEntry: (input, content) => {...};  // Transform metadata for manifest

  // Optional
  hrefRoot: string;               // URL prefix for links (default: contentType)
  manifestFileName: string;       // Output manifest name (default: "{contentType}-manifest.json")
  filePatterns: {
    frontmatter: string[];        // File suffixes for frontmatter files (default: [".{contentType}.md"])
    jsonMetadata: string[];       // File suffixes for JSON metadata (default: [".md"])
    jsonFileExt: string;          // JSON metadata file extension (default: ".{contentType}.json")
  };
  codeLineNumbers: boolean;       // Add line numbers to code blocks (default: true)
  removeH1: boolean;              // Strip H1 headings from output (default: true)
  oldManifestLocators: string[];  // URLs/paths to fetch previous manifest for date tracking
  additionalWatchPaths: string[]; // Extra paths to watch in watch mode
}
```

## Content Files

### Frontmatter (recommended)

Files ending in `.{contentType}.md` use YAML frontmatter:

```markdown
---
title: My Article
publish: true
description: About this article
---

Content here...
```

### JSON Metadata

Plain `.md` files with a companion `.{contentType}.json`:

```
my-post.md
my-post.article.json
```

Both `title` and `publish` are required fields. Additional fields depend on your `validateInputMeta` config.

## Programmatic API

```typescript
import { compost } from "@jaybeeuu/compost";
import config from "./compost.config.js";

const result = await compost(config, { clean: true });

if (result.success) {
  console.log(result.value.entries); // manifest entries
}
```
