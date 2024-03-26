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

export const isRecordOf = <RecordValue>(
  isValue: TypePredicate<RecordValue>,
): TypePredicate<{ [key: string]: RecordValue }> =>
  isType((candidate: unknown): candidate is { [key: string]: RecordValue } => {
    if (typeof candidate !== "object") {
      return false;
    }

    if (candidate === null) {
      return false;
    }

    return Object.values(candidate).every((value) => isValue(value));
  }, `{ [key: string]: ${isValue[typeDescription]}; }`);

export const isLiteral = <Type extends string | number | boolean>(
  type: Type,
): TypePredicate<Type> =>
  isType((candidate: unknown): candidate is Type => {
    return candidate === type;
  }, String(type));

export type TypeString =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export interface TypeStringPrimitiveTypeMap {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  undefined: undefined;
  object: object;
  function: AnyFunction;
}

export const is = <Type extends TypeString | "null">(
  typeString: Type,
): TypePredicate<
  Type extends TypeString ? TypeStringPrimitiveTypeMap[Type] : null
> =>
  isType(
    (
      candidate: unknown,
    ): candidate is Type extends TypeString
      ? TypeStringPrimitiveTypeMap[Type]
      : null => {
      return typeString === "null"
        ? candidate === null
        : typeof candidate === typeString;
    },
    typeString,
  );

export type ExtractTypesFromPredicates<
  T extends ReadonlyArray<TypePredicate<unknown>>,
> = { [K in keyof T]: T[K] extends TypePredicate<infer V> ? V : never };

export const isTuple = <
  Predicates extends ReadonlyArray<TypePredicate<unknown>>,
>(
  ...predicates: Predicates
): TypePredicate<ExtractTypesFromPredicates<Predicates>> =>
  isType(
    (
      candidate: unknown,
    ): candidate is ExtractTypesFromPredicates<Predicates> => {
      return (
        Array.isArray(candidate) &&
        predicates.every((predicate, i) => predicate(candidate[i]))
      );
    },
    `[${predicates.map((predicate) => predicate[typeDescription]).join(", ")}]`,
  );

export const isUnion = <Predicates extends TypePredicate<unknown>[]>(
  ...predicates: Predicates
): TypePredicate<
  Predicates[number] extends TypePredicate<infer Type> ? Type : never
> =>
  isType(
    (
      candidate: unknown,
    ): candidate is Predicates[number] extends TypePredicate<infer Type>
      ? Type
      : never => {
      return predicates.some((predicate) => predicate(candidate));
    },
    predicates.map((predicate) => predicate[typeDescription]).join(" | "),
  );

type UnionToIntersection<Union> = (
  Union extends unknown ? (argument: Union) => void : never
) extends (argument: infer Intersection) => void
  ? Intersection
  : never;

export const isIntersection = <Predicates extends TypePredicate<unknown>[]>(
  ...predicates: Predicates
): TypePredicate<
  UnionToIntersection<
    Predicates[number] extends TypePredicate<infer Type> ? Type : never
  >
> =>
  isType(
    (
      candidate: unknown,
    ): candidate is UnionToIntersection<
      Predicates[number] extends TypePredicate<infer Type> ? Type : never
    > => {
      return predicates.every((predicate) => predicate(candidate));
    },
    predicates.map((predicate) => predicate[typeDescription]).join(" & "),
  );

export const isNullish = isUnion(is("null"), is("undefined"));
