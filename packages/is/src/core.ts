export type ValidationFailed = { valid: false; errorMessages: string[] };
export type ValidationResult = { valid: true } | ValidationFailed;
export interface ValidationContext {
  path: string;
  currentResult: ValidationResult;
}

export const passValidation = (
  context: ValidationContext,
): ValidationResult => {
  return context.currentResult;
};

export const failValidation = (
  errorMessage: string,
  context: ValidationContext,
): ValidationFailed => {
  return {
    valid: false,
    errorMessages: [
      `${context.path}: ${errorMessage}`,
      ...(context.currentResult.valid
        ? []
        : context.currentResult.errorMessages),
    ],
  };
};

const initialContext: ValidationContext = {
  path: "root",
  currentResult: { valid: true },
};

export interface UnassertedTypePredicate<T> {
  (candidate: unknown): candidate is T;
  typeDescription: string;
  validate: (
    candidate: unknown,
    context?: ValidationContext,
  ) => ValidationResult;
}

export type TypeAssertion<Type> = (
  candidate: unknown,
) => asserts candidate is Type;

export const assert =
  <Type>(typePredicate: UnassertedTypePredicate<Type>): TypeAssertion<Type> =>
  (candidate): asserts candidate is Type => {
    const validationResult = typePredicate.validate(candidate, initialContext);
    if (!validationResult.valid) {
      throw new TypeError(
        `Expected ${typePredicate.typeDescription} but received ${typeof candidate}.\n${validationResult.errorMessages.join("\n")}`,
      );
    }
  };

export interface TypePredicate<Type> extends UnassertedTypePredicate<Type> {
  assert: TypeAssertion<Type>;
  check: (candidate: unknown) => Type;
}

export const isType = <Type>(
  validate: (
    candidate: unknown,
    context: ValidationContext,
  ) => ValidationResult,
  typeDescription: string,
): TypePredicate<Type> => {
  const predicate: UnassertedTypePredicate<Type> = Object.assign(
    (candidate: unknown): candidate is Type => {
      return validate(candidate, initialContext).valid;
    },
    {
      typeDescription,
      validate: (
        candidate: unknown,
        context: ValidationContext = initialContext,
      ) => validate(candidate, context),
    },
  );

  const doAssert: TypeAssertion<Type> = assert(predicate);

  return Object.assign(predicate, {
    assert: doAssert,
    check: (candidate: unknown): Type => {
      doAssert(candidate);
      return candidate;
    },
  });
};
