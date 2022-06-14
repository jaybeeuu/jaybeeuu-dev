import type { TypePredicate } from "./base.js";
import { is } from "./base.js";

export const assert = <Type>(
  typePredicate: TypePredicate<Type>, typeDescription: string
): TypeAssertion<Type> => (
  candidate
): asserts candidate is Type => {
  if (!typePredicate(candidate)) {
    throw new TypeError(`Expected ${typeDescription} but got ${typeof candidate}.`);
  }
};

export type TypeAssertion<Type> = (candidate: unknown) => asserts candidate is Type;
export const assertIsString: TypeAssertion<string> = assert(is("string"), "string");

export const assertIsNotNullish: <Type>(
  candidate: Type
) => asserts candidate is Exclude<Type, null | undefined> = (
  candidate
) => {
  if (candidate === null || candidate === undefined) {
    throw new TypeError(`Encountered unexpected ${String(candidate)}.`);
  }
};
