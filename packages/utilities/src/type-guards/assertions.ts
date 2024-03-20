import type { TypePredicate } from "./type-guards.js";
import { isNullish, typeDescription } from "./type-guards.js";

export type TypeAssertion<Type> = (
  candidate: unknown,
) => asserts candidate is Type;

export const assert =
  <Type>(typePredicate: TypePredicate<Type>): TypeAssertion<Type> =>
  (candidate): asserts candidate is Type => {
    if (!typePredicate(candidate)) {
      throw new TypeError(
        `Expected a ${typePredicate[typeDescription]} but got a ${typeof candidate}.`,
      );
    }
  };

export const assertIsNotNullish: <Type>(
  candidate: Type,
  message?: string,
) => asserts candidate is Exclude<Type, null | undefined> = (
  candidate,
  message,
) => {
  if (isNullish(candidate)) {
    throw new TypeError(
      message ?? `Encountered unexpected ${String(candidate)}.`,
    );
  }
};
