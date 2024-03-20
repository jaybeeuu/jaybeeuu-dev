# reading-time-cli

[![npm](https://img.shields.io/npm/v/@jaybeeuu/reading-time-cli.svg)](https://www.npmjs.com/package/@jaybeeuu/reading-time-cli)

A really simple Command Line Interface for [reading-time](https://www.npmjs.com/package/reading-time).

## Options

| Option                 | Description                                                          | Type      |
| ---------------------- | -------------------------------------------------------------------- | --------- |
| (positional) file-path | The path to the file to read.                                        | [string]  |
| --version              | Show version number                                                  | [boolean] |
| --help                 | Show help                                                            | [boolean] |
| -b, --word-bound       | A regular expression to match word boundaries.                       | [string]  |
| -p, --words-per-minute | The number of words per minute to use when calculating reading time. | [number]  |
| -m, --minutes-only     | Only display the reading time (in minutes).                          | [boolean] |
| -t, --time-only        | Only display the reading time (in milliseconds).                     | [boolean] |
