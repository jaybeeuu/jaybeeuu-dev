# e2e

End to end tests which exercise [the client](../client/readme.md).
These are written using [cypress](https://www.cypress.io/),
an e2e framework with a pretty fantastic devx.

## Running the tests

You can run these tests with a simple command.

First makesure you have the [client](../client/readme.md) running, then run the following:

```sh
pnpm e2e run
```

Or to open the cypress UI (better for developing and troubleshooting the tests) use this:

```sh
pnpm e2e open
```
