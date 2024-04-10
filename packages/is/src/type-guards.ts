import type {
  TypePredicate,
  ValidationContext,
  ValidationFailed,
  ValidationResult,
} from "./core.js";
import { failValidation, isType, passValidation } from "./core.js";

export const isLiteral = <Type extends string | number | boolean>(
  type: Type
): TypePredicate<Type> =>
  isType((candidate: unknown, context): ValidationResult => {
    if (candidate === type) {
      return passValidation(context);
    }

    return failValidation(
      `Expected literal value "${String(type)}", but received "${typeof candidate}": ${typeof candidate !== "object" ? String(candidate) : ""}`,
      context
    );
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function: (...args: any[]) => any;
}

export const is = <Type extends TypeString | "null">(
  typeString: Type
): TypePredicate<
  Type extends TypeString ? TypeStringPrimitiveTypeMap[Type] : null
> =>
  isType((candidate: unknown, context: ValidationContext): ValidationResult => {
    if (
      typeString === "null"
        ? candidate === null
        : typeof candidate === typeString
    ) {
      return passValidation(context);
    }

    return failValidation(
      `Expected "${typeString}", but received "${typeof candidate}"${typeof candidate !== "object" ? `: ${String(candidate)}` : ""}`,
      context
    );
  }, typeString);

export type ExtractTypesFromPredicates<
  T extends ReadonlyArray<TypePredicate<unknown>>,
> = { [K in keyof T]: T[K] extends TypePredicate<infer V> ? V : never };

export const isTuple = <
  Predicates extends ReadonlyArray<TypePredicate<unknown>>,
>(
  ...predicates: Predicates
): TypePredicate<ExtractTypesFromPredicates<Predicates>> =>
  isType(
    (candidate: unknown, context: ValidationContext): ValidationResult => {
      if (!Array.isArray(candidate)) {
        return failValidation(
          `Expected an array, but received ${typeof candidate}.`,
          context
        );
      }

      if (candidate.length !== predicates.length) {
        return failValidation(
          `Expected an array with length ${predicates.length}, but received array with ${candidate.length} element(s).`,
          context
        );
      }

      return predicates.reduce((currentResult, predicate, index) => {
        return predicate.validate(candidate[index], {
          path: `${context.path}[${index}]`,
          currentResult,
        });
      }, context.currentResult);
    },
    `[${predicates.map((predicate) => predicate.typeDescription).join(", ")}]`
  );

export const isUnionOf = <Predicates extends TypePredicate<unknown>[]>(
  ...predicates: Predicates
): TypePredicate<
  Predicates[number] extends TypePredicate<infer Type> ? Type : never
> =>
  isType(
    (candidate: unknown, context: ValidationContext): ValidationResult => {
      const failures: ValidationFailed[] = [];
      for (
        let predicateIndex = 0;
        predicateIndex < predicates.length;
        predicateIndex++
      ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const result = predicates[predicateIndex]!.validate(candidate, {
          currentResult: { valid: true },
          path: `${context.path} |(${predicateIndex})`,
        });
        if (result.valid) {
          return result;
        }
        failures.push(result);
      }

      return failValidation(
        `Expected union of types. The following errors were received:\n${failures
          .map((failure) =>
            failure.errorMessages.map((message) => `\t${message}`).join("\n")
          )
          .join("\n")}\n`,
        context
      );
    },
    predicates.map((predicate) => predicate.typeDescription).join(" | ")
  );

type UnionToIntersection<Union> = (
  Union extends unknown ? (argument: Union) => void : never
) extends (argument: infer Intersection) => void
  ? Intersection
  : never;

export const isIntersectionOf = <Predicates extends TypePredicate<unknown>[]>(
  ...predicates: Predicates
): TypePredicate<
  UnionToIntersection<
    Predicates[number] extends TypePredicate<infer Type> ? Type : never
  >
> =>
  isType(
    (candidate: unknown, context: ValidationContext): ValidationResult => {
      const result = predicates.reduce<ValidationResult>(
        (currentResult, predicate, predicateIndex) => {
          return predicate.validate(candidate, {
            path: `${context.path} &(${predicateIndex})`,
            currentResult,
          });
        },
        { valid: true }
      );

      if (result.valid) {
        return passValidation(context);
      }

      return failValidation(
        `Expected intersection of types. The following errors were received:\n${result.errorMessages.map((message) => `\t${message}`).join("\n")}\n`,
        context
      );
    },
    predicates.map((predicate) => predicate.typeDescription).join(" & ")
  );

const hasOwnProperty = <Obj extends object, Property extends PropertyKey>(
  obj: Obj,
  prop: Property
): obj is Obj & { [key in Property]: unknown } => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

export type ElementOfArray<Arr> = Arr extends (infer Element)[]
  ? Element
  : never;

export const isArrayOf = <Element>(
  isElement: TypePredicate<Element>
): TypePredicate<Element[]> =>
  isType((candidate: unknown, context: ValidationContext): ValidationResult => {
    if (!Array.isArray(candidate)) {
      return failValidation(
        `Expected an array, but received ${typeof candidate}.`,
        context
      );
    }

    return candidate.reduce<ValidationResult>(
      (currentResult, element, elementIndex) => {
        return isElement.validate(element, {
          path: `${context.path}[${elementIndex}]`,
          currentResult,
        });
      },
      context.currentResult
    );
  }, `${isElement.typeDescription}[]`);

export const isRecordOf = <RecordValue>(
  isValue: TypePredicate<RecordValue>
): TypePredicate<{ [key: string]: RecordValue }> =>
  isType((candidate: unknown, context: ValidationContext): ValidationResult => {
    if (typeof candidate !== "object") {
      return failValidation(
        `Expected an object, but received type "${typeof candidate}".`,
        context
      );
    }

    if (candidate === null) {
      return failValidation(`Candidate cannot be null, but was.`, context);
    }

    return Object.entries(candidate).reduce((currentResult, [key, value]) => {
      return isValue.validate(value, {
        path: `${context.path}.${key}`,
        currentResult,
      });
    }, context.currentResult);
  }, `{ [key: string]: ${isValue.typeDescription}; }`);

export const isObject = <Obj extends object>(properties: {
  [key in keyof Obj]: TypePredicate<Obj[key]>;
}): TypePredicate<Obj> =>
  isType(
    (candidate: unknown, context: ValidationContext): ValidationResult => {
      if (typeof candidate !== "object") {
        return failValidation(
          `Expected an object, but received type "${typeof candidate}".`,
          context
        );
      }

      if (candidate === null) {
        return failValidation(`Candidate cannot be null, but was.`, context);
      }

      return Object.entries(properties).reduce(
        (currentResult, [key, isCorrectType]) => {
          return (isCorrectType as TypePredicate<unknown>).validate(
            hasOwnProperty(candidate, key) ? candidate[key] : undefined,
            { path: `${context.path}.${key}`, currentResult }
          );
        },
        context.currentResult
      );
    },
    `{ ${Object.entries<TypePredicate<unknown>>(properties)
      .map(([key, predicate]) => `${key}: ${predicate.typeDescription};`)
      .join(" ")} }`
  );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyConstructor = abstract new (...args: any) => any;

export const isInstanceOf = <Type extends AnyConstructor>(
  constructor: Type
): TypePredicate<InstanceType<Type>> => {
  return isType(
    (candidate: unknown, context: ValidationContext): ValidationResult => {
      if (typeof candidate !== "object") {
        return failValidation(
          `Expected an object, but received type "${typeof candidate}".`,
          context
        );
      }

      if (candidate === null) {
        return failValidation(`Candidate cannot be null, but was.`, context);
      }

      if (candidate instanceof constructor) {
        return passValidation(context);
      }

      return failValidation(
        `Expected instance of ${constructor.name} but received: ${candidate.constructor.name}`,
        context
      );
    },
    `instanceof(${constructor.name})`
  );
};
