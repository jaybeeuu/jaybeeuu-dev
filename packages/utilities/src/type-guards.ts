export type TypePredicate<T> = (candidate: unknown) => candidate is T;

export const hasOwnProperty = <Obj extends {}, Property extends PropertyKey>(
  obj: Obj,
  prop: Property
): obj is Obj & Record<Property, unknown> => {
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

const hasPropertyOfType = <Obj extends {}, Property extends PropertyKey, PropertyType>(
  obj: Obj,
  property: Property,
  typeString: TypeString
): obj is Obj & { [key in Property]: PropertyType } => {
  return hasOwnProperty(obj, property) && typeof obj[property] === typeString;
};

export const hasStringProperty = <Obj extends {}, Property extends PropertyKey>(
  obj: Obj,
  property: Property
): obj is Obj & { [Key in Property]: string } => {
  return hasPropertyOfType<Obj, Property, string>(obj, property, "string");
};

export const hasBooleanProperty = <Obj extends {}, Property extends PropertyKey>(
  obj: Obj,
  property: Property
): obj is Obj & { [Key in Property]: string } => {
  return hasPropertyOfType<Obj, Property, string>(obj, property, "boolean");
};

export const isObject = <Obj extends {}>(
  properties: { [key in keyof Obj]: TypePredicate<Obj[key]> }
): TypePredicate<Obj> => (
  candidate: unknown
): candidate is Obj => {
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
};

export type RecordValue<Rec> = Rec extends Record<string, infer Value>
  ? Value
  : never;

export const isRecord = <Rec extends Record<string, unknown>>(
  isValue: TypePredicate<RecordValue<Rec>>
): TypePredicate<Rec> => (
  candidate: unknown
): candidate is Rec => {
  if (typeof candidate !== "object") {
    return false;
  }

  if (candidate === null) {
    return false;
  }

  return Object.values(candidate).every((value) => isValue(value));
};

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
): TypePredicate<TypeStringPrimitiveTypeMap[Type]> => (
  candidate
): candidate is TypeStringPrimitiveTypeMap[Type] => {
  if (typeString === "null") {
    return candidate === null;
  }
  return typeof candidate === typeString;
};

export const or = <T, U>(
  isT: TypePredicate<T>,
  isU: TypePredicate<U>
): TypePredicate<T | U> => (
  candidate: unknown
): candidate is T | U => {
  return isT(candidate) || isU(candidate);
};
