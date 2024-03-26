import type { TypeAssertion, TypePredicate } from "./core.js";

export {
  assert,
  isType,
  type TypeAssertion,
  type TypePredicate,
} from "./core.js";

export { assertIsNotNullish, isNullish } from "./pre-built.js";

export {
  is,
  isArrayOf,
  isInstanceOf,
  isIntersectionOf,
  isLiteral,
  isObject,
  isRecordOf,
  isTuple,
  isUnionOf,
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
