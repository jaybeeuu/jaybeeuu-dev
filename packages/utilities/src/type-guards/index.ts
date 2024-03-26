import type { TypeAssertion } from "./assertions.js";
import type { TypePredicate } from "./type-guards.js";

export {
  type TypePredicate,
  type TypeString,
  is,
  isArrayOf,
  isIntersection,
  isLiteral,
  isNullish,
  isObject,
  isRecordOf,
  isTuple,
  isType,
  isUnion,
  isInstanceOf,
} from "./type-guards.js";
export {
  type TypeAssertion,
  assert,
  assertIsNotNullish,
} from "./assertions.js";

export type CheckedBy<
  Predicate extends TypePredicate<unknown> | TypeAssertion<unknown>,
> =
  Predicate extends TypePredicate<infer Type>
    ? Type
    : Predicate extends TypeAssertion<infer Type>
      ? Type
      : never;
