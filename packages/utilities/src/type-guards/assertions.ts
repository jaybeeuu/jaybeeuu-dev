import {
  is,
  TypeString,
  TypeStringPrimitiveTypeMap
} from "./base";

const assertIs = <Type extends TypeString | "null">(
  typeString: Type
): TypeAssertion<TypeStringPrimitiveTypeMap[Type]> => {
  const checkIsType = is(typeString);
  return (
    candidate
  ): asserts candidate is TypeStringPrimitiveTypeMap[Type] => {
    if(!checkIsType(candidate)) {
      throw new TypeError(`Expected ${typeString} but got ${typeof candidate}.`);
    }
  };
};

export type TypeAssertion<Type> = (candidate: unknown) => asserts candidate is Type;
export const assertIsString: TypeAssertion<string> = assertIs("string");

export const assertIsNotNullish: <Type>(
  candidate: Type
) => asserts candidate is Exclude<Type, null | undefined> = (
  candidate
) => {
  if (candidate === null || candidate === undefined) {
    throw new TypeError(`Encountered unexpected ${String(candidate)}.`);
  }
};
