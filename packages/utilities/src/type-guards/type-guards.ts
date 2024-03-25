export const typeDescription = Symbol.for("type-description");

export interface TypePredicate<T> {
  (candidate: unknown): candidate is T;
  [typeDescription]: string;
}

export const isType = <Type>(
  predicate: (candidate: unknown) => candidate is Type,
  typeDesc: string,
): TypePredicate<Type> =>
  Object.assign(predicate, { [typeDescription]: typeDesc });

const hasOwnProperty = <Obj extends object, Property extends PropertyKey>(
  obj: Obj,
  prop: Property,
): obj is Obj & { [key in Property]: unknown } => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

export const isObject = <Obj extends object>(properties: {
  [key in keyof Obj]: TypePredicate<Obj[key]>;
}): TypePredicate<Obj> =>
  isType(
    (candidate: unknown): candidate is Obj => {
      if (typeof candidate !== "object") {
        return false;
      }

      if (candidate === null) {
        return false;
      }

      return Object.entries(properties).every(([key, isCorrectType]) => {
        return (
          hasOwnProperty(candidate, key) &&
          (isCorrectType as (candidate: unknown) => boolean)(candidate[key])
        );
      });
    },
    `{ ${Object.entries<TypePredicate<unknown>>(properties)
      .map(([key, predicate]) => `${key}: ${predicate[typeDescription]};`)
      .join(" ")} }`,
  );

export type ElementOfArray<Arr> = Arr extends (infer Element)[]
  ? Element
  : never;

export const isArrayOf = <Element>(
  isElement: TypePredicate<Element>,
): TypePredicate<Element[]> =>
  isType((candidate: unknown): candidate is Element[] => {
    return (
      Array.isArray(candidate) &&
      candidate.every((element) => isElement(element))
    );
  }, `${isElement[typeDescription]}[]`);

export type RecordValue<Rec> = Rec extends { [key: string]: infer Value }
  ? Value
  : never;

export const isRecordOf = <Rec extends { [key: string]: unknown }>(
  isValue: TypePredicate<RecordValue<Rec>>,
): TypePredicate<Rec> =>
  isType((candidate: unknown): candidate is Rec => {
    if (typeof candidate !== "object") {
      return false;
    }

    if (candidate === null) {
      return false;
    }

    return Object.values(candidate).every((value) => isValue(value));
  }, `{ [key: string]: ${isValue[typeDescription]}; }`);

export const typeStrings = [
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "undefined",
  "object",
  "function",
] as const;
export type TypeString = (typeof typeStrings)[number];
const isTypeString = (candidate: string): candidate is TypeString => {
  return (typeStrings as readonly string[]).includes(candidate);
};

export interface TypeStringPrimitiveTypeMap {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  undefined: undefined;
  object: object;
  function: AnyFunction;
  null: null;
}

export const is = <Type extends string | number | boolean>(
  typeString: Type,
): TypePredicate<
  Type extends keyof TypeStringPrimitiveTypeMap
    ? TypeStringPrimitiveTypeMap[Type]
    : Type
> =>
  isType(
    (
      candidate: unknown,
    ): candidate is Type extends keyof TypeStringPrimitiveTypeMap
      ? TypeStringPrimitiveTypeMap[Type]
      : Type => {
      if (typeString === "null") {
        return candidate === null;
      }
      if (typeof typeString === "string" && isTypeString(typeString)) {
        return typeof candidate === typeString;
      }
      return candidate === typeString;
    },
    `${typeString}`,
  );

export const or = <T, U>(
  isT: TypePredicate<T>,
  isU: TypePredicate<U>,
): TypePredicate<T | U> =>
  isType((candidate: unknown): candidate is T | U => {
    return isT(candidate) || isU(candidate);
  }, `${isT[typeDescription]} | ${isU[typeDescription]}`);

export const exclude = <T, U>(
  isT: TypePredicate<T>,
  isU: TypePredicate<U>,
): TypePredicate<Exclude<T, U>> => {
  const excludedTypeDescRegexp = new RegExp(`(^| \\| )${isU[typeDescription]}`);
  return isType(
    (candidate: unknown): candidate is Exclude<T, U> => {
      return isT(candidate) && !isU(candidate);
    },
    excludedTypeDescRegexp.test(isT[typeDescription])
      ? isT[typeDescription].replace(excludedTypeDescRegexp, "")
      : `${isT[typeDescription]} | !${isU[typeDescription]}`,
  );
};

export const isNullish = or(is("null"), is("undefined"));

export const isInPrimitiveUnion = <
  UnionMembers extends readonly (string | number | boolean)[],
>(
  unionMembers: UnionMembers,
): TypePredicate<UnionMembers[number]> => {
  const isPrimitive = or(or(is("boolean"), is("string")), is("number"));

  return isType(
    (candidate: unknown): candidate is UnionMembers[number] => {
      return isPrimitive(candidate) && unionMembers.includes(candidate);
    },
    unionMembers.map((elem) => JSON.stringify(elem)).join(" | "),
  );
};
