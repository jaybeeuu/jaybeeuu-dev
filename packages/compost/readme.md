# compost

[![npm](https://img.shields.io/npm/v/@jaybeeuu/compost.svg)](https://www.npmjs.com/package/@jaybeeuu/compost)

A CLI tool that compiles markdown files with metadata into HTML and a manifest of posts.

It makes use of [marked](https://marked.js.org/) and [prism](https://prismjs.com/),
and uses [yargs](https://yargs.js.org/) to provide the CLI.

**Content Authoring:** Supports both traditional JSON metadata files and YAML front matter for flexible content authoring workflows.

## Usage

This package provides a node executable so you can run it from the command line.
To see the options available run:

```sh
compost --help
```

## options

| Options                    | Description                                                                                                                                                                                                      | Type    | Default         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------- | ------- |
| --version                  | Show version number                                                                                                                                                                                              | boolean |                 |
| -r, --hrefRoot             | The root path to apply when compiling hrefs (e.g. links).                                                                                                                                                        | string  | "/"             |
| -a, --additionalWatchPaths | Paths other than --source-dir to watch when in watch mode.                                                                                                                                                       | array   |                 |
| -u, --includeUnpublished   | Whether or not to compile posts not marked as published in their metadata.json file.                                                                                                                             | boolean | false           |
| -m, --manifestFileName     | The nam of the output JSON manifest file.                                                                                                                                                                        | string  | "manifest.json" |
| --codeLineNumbers          | Include tags and classes in code blocks that can be styled to show line numbers with the Prism line number styles.                                                                                               | boolean | false           |
| --oldManifestLocator       | The path or URL of the old manifest. If none is given then the output-dir and manifest-file-name options will be used to infer the location. If this option is given and no manifest is found compost will fail. | array   |                 |
| -o, --outputDir            | The directory into which the compiled files should be written.                                                                                                                                                   | string  |                 | "./lib" |
| --removeH1                 | Indicates whether the process will remove H1 (#) headings. Useful if you will render that with a custom heading in your page.                                                                                    | boolean | false           |
| --requireOldManifest       | Indicates whether the process will fail if the old manifest is not found.                                                                                                                                        | boolean | false           |
| -s, --sourceDir            | The directory containing the source files.                                                                                                                                                                       | string  | "./src"         |
| -w, --watch                | Watch the source files and recompile the posts when changes occur.                                                                                                                                               | boolean | false           |
| -h, --help                 | Show help                                                                                                                                                                                                        | boolean |                 |

## Content Authoring

Compost supports two approaches for authoring content, both producing identical compilation output:

### Traditional JSON Metadata Files

Create separate files for content and metadata:

```
src/
  my-post.md         # Markdown content
  my-post.post.json  # Metadata file
```

**my-post.post.json:**

```json
{
  "title": "My Post Title",
  "abstract": "A brief description of the post",
  "publish": true
}
```

**my-post.md:**

```markdown
# My Post Title

Content goes here...
```

### YAML Front Matter

Include metadata directly in the markdown file using YAML front matter:

```
src/
  my-post.md  # Markdown with front matter
```

**my-post.md:**

```markdown
---
title: "My Post Title"
abstract: "A brief description of the post"
publish: true
---

# My Post Title

Content goes here...
```

### Metadata Schema

Both approaches support the same metadata fields:

- **title** (string, required): The post title
- **abstract** (string, required): Brief description for listings and SEO
- **publish** (boolean, required): Whether to include in published output

### Migration

Existing projects using JSON metadata files continue working unchanged. You can gradually migrate to front matter or use both approaches within the same project.
