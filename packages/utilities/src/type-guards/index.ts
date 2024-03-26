import type { TypeAssertion, TypePredicate } from "./core.js";

export {
  assert,
  isType,
  type TypeAssertion,
  type TypePredicate,
} from "./core.js";

export {
  assertIsNotNullish,
  is,
  isArrayOf,
  isInstanceOf,
  isIntersection,
  isLiteral,
  isNullish,
  isObject,
  isRecordOf,
  isTuple,
  isUnion,
  type TypeString,
} from "./type-guards.js";

export type CheckedBy<
  Predicate extends TypePredicate<unknown> | TypeAssertion<unknown>,
> =
  Predicate extends TypePredicate<infer Type>
    ? Type
    : Predicate extends TypeAssertion<infer Type>
      ? Type
      : never;
