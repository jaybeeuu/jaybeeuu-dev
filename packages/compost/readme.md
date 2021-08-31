# compost

A CLI took that compiles markdown files and metadata json into HTML and a manifest of posts.

It makes use of [marked](https://marked.js.org/) and [prism](https://prismjs.com/),
and uses [yargs](https://yargs.js.org/) to provide the CLI.

## Usage

This package provides a node executable so you can run it from the command line.
To see the options available run:

```sh
compost --help
```

## options

| Options                     | Description                                                                                                                                                                                                      | Type    | Default         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------- |
| --version                   | Show version number                                                                                                                                                                                              | boolean |                 |
| -r, --hrefRoot              | The root path to apply when compiling hrefs (e.g. links).                                                                                                                                                        | string  | "/"             |
| -a, --additionalWatchPaths  | Paths other than --source-dir to watch when in watch mode.                                                                                                                                                       | array   |                 |
| -u, --includeUnpublished    | Whether or not to compile posts not marked as published in their metadata.json file.                                                                                                                             | boolean | false           |
| -m, --manifestFileName      | The nam of the output JSON manifest file.                                                                                                                                                                        | string  | "manifest.json" |
| --codeLineNumbers           | Include tags and classes in code blocks that can be styled to show line numbers with the Prism line number styles.                                                                                               | boolean | false           |
| --oldManifestLocator, --oml | The path or URL of the old manifest. If none is given then the output-dir and manifest-file-name options will be used to infer the location. If this option is given and no manifest is found compost will fail. | array   |                 |
| -o, --outputDir             | The directory into which the compiled files should be written.                                                                                                                                                   | string  |                 | "./lib" |
| --requireOldManifest, --rom | Indicates whether the process will fail if the old manifest is not found.                                                                                                                                        | boolean | false           |
| -s, --sourceDir             | The directory containing the source files.                                                                                                                                                                       | string  | "./src"         |
| -w, --watch                 | Watch the source files and recompile the posts when changes occur.                                                                                                                                               | boolean | false           |
| -h, --help                  | Show help                                                                                                                                                                                                        | boolean |                 |
