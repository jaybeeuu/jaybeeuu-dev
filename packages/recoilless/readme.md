# recoilless

[![npm](https://img.shields.io/npm/v/@jaybeeuu/recoilless.svg)](https://www.npmjs.com/package/@jaybeeuu/recoilless)

A slightly too fully fledged state management library based loosely on concepts found in [recoil](https://recoiljs.org/).

The basic idea is to have small blocks of state,
atoms in Recoil or values in Recoilless (I prefer clear names),
to which listeners can subscribe.
When the value updates the subscribers are notified.

Values can either be primitive or derived.
Primitive values are simple static values, numbers, strings etc. they are the building blocks of the state.

Derived values take primitive values,
and calculate (or retrieve, since they can be asynchronous) some value.
The calculation (or fetch) is only performed when the dependent values update.

Finally actions allow a function to be called which might update values. It may make use of values, but will only have a snapshot of them, i.e. will not setup a subscription.

For more details on how to use recoilless have a look at the unit tests for
[primitive values](./src/store-primitive-value.spec.ts)
,
[derived values](./src/store-derived-value.spec.ts)
and
[actions](./src/store-actions.spec.ts)
.
