# Jaybeeuu

Welcome to my monorepo! The code in here is used to build and run my blog.
There are various tools in here, this readme will get you started and describe the structure of the packages.

## Getting Started

You will need node.js. I use [nvm for windows](https://github.com/coreybutler/nvm-windows) (since I dev on a windows machine atm). [.nvmrc](./.nvmrc) has the version of node.js you need.

```sh
nvm install
```

Once you have node.js then you will able to run the following:

```sh
npm i -g pnpm
pnpm install
pnpm build
pnpm test
pnpm gen-certs
pnpm start --filter @jaybeeuu/site
```

That will install pnpm, install the dependencies for the packages, build and test the packages,
generate development SSL certificates and finally start the site.
After that you are away.
Head to [https://localhost:3443](https://localhost:3443) to see the site.

I use VSCode to develop and the repo contains launch configs,
settings and extension recommendations to help setup and get going.

## Packages

| Name                                                                   | Path                          | Version                                                                                                                               | Description                                                                                    |
| ---------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [@jaybeeuu/compost](./packages/compost#readme)                         | /packages/compost             | [![npm](https://img.shields.io/npm/v/@jaybeeuu/compost.svg)](https://www.npmjs.com/package/@jaybeeuu/compost)                         | A CLI tool used to compile markdown posts into HTML.                                           |
| [@jaybeeuu/e2e-hooks](./packages/e2e-hooks#readme)                     | /packages/e2e-hooks           |                                                                                                                                       | A collection of css classes used to hook into the application for e2e tets.                    |
| [@jaybeeuu/e2e](./packages/e2e#readme)                                 | /packages/e2e                 |                                                                                                                                       | [Cypress](https://www.cypress.io/) end to end tests for the blog.                              |
| [@jaybeeuu/eslint-config](./packages/eslint-config#readme)             | /packages/eslint-config       | [![npm](https://img.shields.io/npm/v/@jaybeeuu/eslint-config.svg)](https://www.npmjs.com/package/@jaybeeuu/eslint-config)             | The base [eslint](https://eslint.org/) configurations I use throughout the repo.               |
| [@jaybeeuu/feed-webpack-plugin](./packages/feed-webpack-plugin#readme) | /packages/feed-webpack-plugin | [![npm](https://img.shields.io/npm/v/@jaybeeuu/feed-webpack-plugin.svg)](https://www.npmjs.com/package/@jaybeeuu/feed-webpack-plugin) | A webpack plugin wrapper for [feed](https://github.com/jpmonette/feed).                        |
| [@jaybeeuu/posts](./packages/posts#readme)                             | /packages/posts               |                                                                                                                                       | The markdown source and metadata for posts on my blog.                                         |
| [@jaybeeuu/preact-async](./packages/preact-async#readme)               | /packages/preact-async        | [![npm](https://img.shields.io/npm/v/@jaybeeuu/preact-async.svg)](https://www.npmjs.com/package/@jaybeeuu/preact-async)               | Some tools for workign with async code in [Preact](https://preactjs.org).                      |
| [@jaybeeuu/preact-recoilless](./packages/preact-recoilless#readme)     | /packages/preact-recoilless   | [![npm](https://img.shields.io/npm/v/@jaybeeuu/preact-recoilless.svg)](https://www.npmjs.com/package/@jaybeeuu/preact-recoilless)     | [Preact](https://preactjs.org) bindings for [recoilless](./packages/recoilless#readme).        |
| [@jaybeeuu/recoilless](./packages/recoilless#readme)                   | /packages/recoilless          | [![npm](https://img.shields.io/npm/v/@jaybeeuu/recoilless.svg)](https://www.npmjs.com/package/@jaybeeuu/recoilless)                   | A (bit too) fully fledged state management library similar to [recoil](https://recoiljs.org/). |
| [@jaybeeuu/scripts](./packages/scripts#readme)                         | /packages/scripts             |                                                                                                                                       | CLI scripts used to setup the environment.                                                     |
| [@jaybeeuu/site](./packages/site#readme)                               | /packages/site                |                                                                                                                                       | The main [site](https://jaybeeuu.dev).                                                         |
| [@jaybeeuu/utilities](./packages/utilities#readme)                     | /packages/utilities           | [![npm](https://img.shields.io/npm/v/@jaybeeuu/utilities.svg)](https://www.npmjs.com/package/@jaybeeuu/utilities)                     | A few general purpose, useful bits of code used across the other packages.                     |

## Package.json scripts

| Command       | Description                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| build         | Builds all the packages in the repo.                                                                                                                |
| build-changes | Builds all the packages that have changed since main.                                                                                               |
| clean         | Cleans the repo. All untracked files and directories are removed.                                                                                   |
| e2e           | Runs the e2e tests. Add `run` to ru them headless or `open` to open the cypress UI.                                                                 |
| e2e-ci        | The command used to run the e2e tests in CI. Uses an `&` command to run the dev server and wait-on for it to be available before running the tests. |
| gen-certs     | Generates the SSL certificates in all the packages which need them.                                                                                 |
| lint          | Lints the packages with markdown-lint or eslint.                                                                                                    |
| spellcheck    | Spell checks markdown in the application.                                                                                                           |
| start-all     | Starts all the packages in watch mode.                                                                                                              |
| test          | Runs the unit tests using jest projects.                                                                                                            |
| test-debug    | Runs the unit tests but uses the --inspect node option to open the debug port.                                                                      |
| type-check    | Runs typescript type checks in the packages.                                                                                                        |
