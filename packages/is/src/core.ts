export interface UnassertedTypePredicate<T> {
  (candidate: unknown): candidate is T;
  [typeDescription]: string;
}

export type TypeAssertion<Type> = (
  candidate: unknown,
) => asserts candidate is Type;

export const assert =
  <Type>(typePredicate: UnassertedTypePredicate<Type>): TypeAssertion<Type> =>
  (candidate): asserts candidate is Type => {
    if (!typePredicate(candidate)) {
      throw new TypeError(
        `Expected a ${typePredicate[typeDescription]} but got a ${typeof candidate}.`,
      );
    }
  };

export const typeDescription = Symbol.for("type-description");

export interface TypePredicate<Type> extends UnassertedTypePredicate<Type> {
  assert: TypeAssertion<Type>;
  check: (candidate: unknown) => Type;
}

export const isType = <Type>(
  predicate: (candidate: unknown) => candidate is Type,
  typeDesc: string,
): TypePredicate<Type> => {
  const pred = Object.assign(predicate, {
    [typeDescription]: typeDesc,
  });
  const doAssert: TypeAssertion<Type> = assert(pred);
  return Object.assign(pred, {
    assert: doAssert,
    check: (candidate: unknown): Type => {
      doAssert(candidate);
      return candidate;
    },
  });
};
