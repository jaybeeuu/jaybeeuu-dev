# Jaybeeuu

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/jaybeeuu/jaybeeuu-dev/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/jaybeeuu/jaybeeuu-dev/tree/main)

[![codecov](https://codecov.io/gh/jaybeeuu/jaybeeuu-dev/branch/main/graph/badge.svg?token=GPM3D67R55)](https://codecov.io/gh/jaybeeuu/jaybeeuu-dev)

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

| Name                                                                  | Path                        | Version                                                                                                                           | Description                                                                                                               |
| --------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [@jaybeeuu/compost](./packages/compost/readme.md)                     | /packages/compost           | [![npm](https://img.shields.io/npm/v/@jaybeeuu/compost.svg)](https://www.npmjs.com/package/@jaybeeuu/compost)                     | A CLI tool used to compile markdown posts into HTML.                                                                      |
| [@jaybeeuu/conv](./packages/conv/readme.md)                           | /packages/conv              | [![npm](https://img.shields.io/npm/v/@jaybeeuu/conv.svg)](https://www.npmjs.com/package/@jaybeeuu/conv)                           | Library for reading and validating .env files and converting values according to the code definition, all strictly typed. |
| [@jaybeeuu/e2e](./packages/e2e/readme.md)                             | /packages/e2e               |                                                                                                                                   | [Cypress](https://www.cypress.io/) end to end tests for the blog.                                                         |
| [@jaybeeuu/e2e-hooks](./packages/e2e-hooks/readme.md)                 | /packages/e2e-hooks         |                                                                                                                                   | A collection of css classes used to hook into the application for e2e tets.                                               |
| [@jaybeeuu/eslint-config](./packages/eslint-config/readme.md)         | /packages/eslint-config     | [![npm](https://img.shields.io/npm/v/@jaybeeuu/eslint-config.svg)](https://www.npmjs.com/package/@jaybeeuu/eslint-config)         | The base [eslint](https://eslint.org/) configurations I use throughout the repo.                                          |
| [@jaybeeuu/is](./packages/is/readme.md)                               | /packages/is                | [![npm](https://img.shields.io/npm/v/@jaybeeuu/is.svg)](https://www.npmjs.com/package/@jaybeeuu/is)                               | Utility package that allows code definition of strictly typed data validation.                                            |
| [@jaybeeuu/posts](./packages/posts/readme.md)                         | /packages/posts             |                                                                                                                                   | The markdown source and metadata for posts on my blog.                                                                    |
| [@jaybeeuu/preact-async](./packages/preact-async/readme.md)           | /packages/preact-async      | [![npm](https://img.shields.io/npm/v/@jaybeeuu/preact-async.svg)](https://www.npmjs.com/package/@jaybeeuu/preact-async)           | Some tools for workign with async code in [Preact](https://preactjs.org).                                                 |
| [@jaybeeuu/preact-recoilless](./packages/preact-recoilless/readme.md) | /packages/preact-recoilless | [![npm](https://img.shields.io/npm/v/@jaybeeuu/preact-recoilless.svg)](https://www.npmjs.com/package/@jaybeeuu/preact-recoilless) | [Preact](https://preactjs.org) bindings for [recoilless](./packages/recoilless/readme.md).                                |
| [@jaybeeuu/reading-time-cli](./packages/reading-time-cli/readme.md)   | /packages/reading-time-cli  | [![npm](https://img.shields.io/npm/v/@jaybeeuu/reading-time-cli.svg)](https://www.npmjs.com/package/@jaybeeuu/reading-time-cli)   | A really simple Command Line Interface for [reading-time](https://www.npmjs.com/package/reading-time).                    |
| [@jaybeeuu/recoilless](./packages/recoilless/readme.md)               | /packages/recoilless        | [![npm](https://img.shields.io/npm/v/@jaybeeuu/recoilless.svg)](https://www.npmjs.com/package/@jaybeeuu/recoilless)               | A (bit too) fully fledged state management library similar to [recoil](https://recoiljs.org/).                            |
| [@jaybeeuu/scripts](./packages/scripts/readme.md)                     | /packages/scripts           |                                                                                                                                   | CLI scripts used to setup the environment.                                                                                |
| [@jaybeeuu/site](./packages/site/readme.md)                           | /packages/site              |                                                                                                                                   | The main [site](https://jaybeeuu.dev).                                                                                    |
| [@jaybeeuu/utilities](./packages/utilities/readme.md)                 | /packages/utilities         | [![npm](https://img.shields.io/npm/v/@jaybeeuu/utilities.svg)](https://www.npmjs.com/package/@jaybeeuu/utilities)                 | A few general purpose, useful bits of code used across the other packages.                                                |

## Package.json scripts

| Command       | Description                                                                         |
| ------------- | ----------------------------------------------------------------------------------- |
| build         | Builds all the packages in the repo.                                                |
| build-changes | Builds all the packages that have changed since main.                               |
| clean         | Cleans the repo. All untracked files and directories are removed.                   |
| e2e           | Runs the e2e tests. Add `run` to ru them headless or `open` to open the cypress UI. |
| format        | Formats files in the repo.                                                          |
| format-check  | Checks the format of files in the repo.                                             |
| gen-certs     | Generates the SSL certificates in all the packages which need them.                 |
| lint          | Lints the packages with markdown-lint or eslint.                                    |
| spell-check   | Spell checks markdown in the application.                                           |
| start-all     | Starts all the packages in watch mode.                                              |
| test          | Runs the unit tests using jest projects.                                            |
| test-debug    | Runs the unit tests but uses the --inspect node option to open the debug port.      |
| type-check    | Runs typescript type checks in the packages.                                        |
