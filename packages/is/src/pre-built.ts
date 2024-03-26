import { isUnionOf, is } from "./type-guards.js";

export const isNullish = isUnionOf(is("null"), is("undefined"));

export const assertIsNotNullish: <Type>(
  candidate: Type,
  message?: string
) => asserts candidate is Exclude<Type, null | undefined> = (
  candidate,
  message
) => {
  if (isNullish(candidate)) {
    throw new TypeError(
      message ?? `Encountered unexpected ${String(candidate)}.`
    );
  }
};
