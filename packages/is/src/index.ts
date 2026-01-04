import type { TypeAssertion, TypePredicate } from "./core.js";

export {
  assert,
  failValidation,
  passValidation,
  type TypeAssertion,
  type TypePredicate,
  type ValidationContext,
  type ValidationFailed,
  type ValidationPassed,
  type ValidationResult,
} from "./core.js";

export { assertIsNotNullish, isNullish } from "./pre-built.js";

export {
  is,
  isArrayOf,
  isInstanceOf,
  isIntersectionOf,
  isKeyOf,
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
