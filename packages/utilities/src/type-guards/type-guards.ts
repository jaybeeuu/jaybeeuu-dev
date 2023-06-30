export const typeDescription = Symbol.for("type-description");

export interface TypePredicate<T> {
  (candidate: unknown): candidate is T;
  [typeDescription]: string;
}

const hasOwnProperty = <Obj extends object, Property extends PropertyKey>(
  obj: Obj,
  prop: Property
): obj is Obj & { [key in Property]: unknown } => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

export type TypeString
  = "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export const isObject = <Obj extends {}>(
  properties: { [key in keyof Obj]: TypePredicate<Obj[key]> }
): TypePredicate<Obj> => Object.assign(
  (candidate: unknown): candidate is Obj => {
    if (typeof candidate !== "object") {
      return false;
    }

    if (candidate === null) {
      return false;
    }

    return Object.entries(properties).every(([key, isCorrectType]) => {
      return hasOwnProperty(candidate, key)
        && (isCorrectType as (candidate: unknown) => boolean)(candidate[key]);
    });
  },
  { [typeDescription]: `{ ${
    Object.entries<TypePredicate<unknown>>(properties)
      .map(([key, predicate]) => `${key}: ${predicate[typeDescription]};`)
      .join(" ")
  } }`
  }
);

export type ElementOfArray<Arr> = Arr extends (infer Element)[]
  ? Element
  : never;

export const isArrayOf = <Element>(
  isElement: TypePredicate<Element>
): TypePredicate<Element[]> => Object.assign(
  (candidate: unknown): candidate is Element[] => {
    return Array.isArray(candidate)
      && candidate.every((element) => isElement(element));
  },
  { [typeDescription]: `${isElement[typeDescription]}[]` }
);

export type RecordValue<Rec> = Rec extends { [key: string]: infer Value }
  ? Value
  : never;

export const isRecordOf = <Rec extends { [key: string]: unknown }>(
  isValue: TypePredicate<RecordValue<Rec>>
): TypePredicate<Rec> => Object.assign(
  (candidate: unknown): candidate is Rec => {
    if (typeof candidate !== "object") {
      return false;
    }

    if (candidate === null) {
      return false;
    }

    return Object.values(candidate).every((value) => isValue(value));
  },
  { [typeDescription]: `{ [key: string]: ${isValue[typeDescription]}; }` }
);

export interface TypeStringPrimitiveTypeMap {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  undefined: undefined;
  object: object;
  function: Function;
  null: null
}

export const is = <Type extends TypeString | "null">(
  typeString: Type
): TypePredicate<TypeStringPrimitiveTypeMap[Type]> => Object.assign(
  (candidate: unknown): candidate is TypeStringPrimitiveTypeMap[Type] => {
    if (typeString === "null") {
      return candidate === null;
    }
    return typeof candidate === typeString;
  },
  { [typeDescription]: typeString }
);

export const or = <T, U>(
  isT: TypePredicate<T>,
  isU: TypePredicate<U>
): TypePredicate<T | U> => Object.assign(
  (candidate: unknown): candidate is T | U => {
    return isT(candidate) || isU(candidate);
  },
  { [typeDescription]: `${isT[typeDescription]} | ${isU[typeDescription]}` }
);

export const isNullish = or(is("null"), is("undefined"));

export const isInPrimitiveUnion = <UnionMembers extends readonly (string | number | boolean)[]>(
  unionMembers: UnionMembers
): TypePredicate<UnionMembers[number]> => {
  const isPrimitive = or(
    or(
      is("boolean"),
      is("string")
    ),
    is("number")
  );

  return Object.assign(
    (candidate: unknown): candidate is UnionMembers[number] => {
      return isPrimitive(candidate) && unionMembers.includes(candidate);
    },
    { [typeDescription]: unionMembers.map((elem) => JSON.stringify(elem)).join(" | ") }
  );
};

