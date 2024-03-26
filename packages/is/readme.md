# is

[![npm](https://img.shields.io/npm/v/@jaybeeuu/is.svg)](https://www.npmjs.com/package/@jaybeeuu/is)

A collection of functions which allow you to build up validators, and types for incoming data.
Use at the edges of your application, to ensure type safety when deserializing for example.

This is pretty rough and experimental, but it's quick, and small. If you want something more full featured and production read then try [`runtypes`](https://www.npmjs.com/package/runtypes).

Example:

```ts
import {
  type CheckedBy,
  assert,
  isTuple,
  is,
  isLiteral,
  isObject,
  isArrayOf,
  isUnionOf,
  TypeAssertion,
} from "@jaybeeuu/is";

const isPosition = isTuple(is("string"), is("string"));

const isRank = isUnionOf(
  isLiteral("captain"),
  isLiteral("first mate"),
  isLiteral("officer"),
  isLiteral("ensign")
);

const isCrewMember = isObject({
  name: is("string"),
  age: is("number"),
  rank: isRank,
});

const isShip = isObject({
  affiliation: isUnionOf(isLiteral("Royal Navy"), isLiteral("Pirate")),
  position: isPosition,
  guns: is("number"),
  name: is("string"),
  crew: isArrayOf(isCrewMember),
});
type Ship = CheckedBy<typeof isShip>;
const assertIsShip: TypeAssertion<Ship> = assert(isShip);

const thing: unknown = {
  affiliation: "Pirate",
  position: ["13°05′52″N", "59°37′06″W"],
  name: "Flying Dutchman",
  crew: [
    {
      age: 1392,
      name: "Willem van der Decken",
      rank: "captain",
    },
  ],
  guns: 68,
};

assertIsShip(thing);
const ship: Ship = thing;
```
