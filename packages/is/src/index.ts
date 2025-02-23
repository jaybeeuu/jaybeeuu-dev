import type { TypeAssertion, TypePredicate } from "./core.js";

export {
  ValidationContext,
  ValidationFailed,
  ValidationPassed,
  ValidationResult,
  assert,
  failValidation,
  isType,
  passValidation,
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
  isKeyOf,
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
