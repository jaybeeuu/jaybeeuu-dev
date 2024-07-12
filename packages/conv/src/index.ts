import type { TypeAssertion } from "@jaybeeuu/is";
import { assertIsNotNullish, isLiteral, isUnionOf } from "@jaybeeuu/is";
import { config } from "dotenv";
import { env } from "node:process";

type EnvVarType = "string" | "number" | "boolean" | "date";

type EnvVarTypeJsTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  date: Date;
};

type EnvVarOption<Type extends EnvVarType = EnvVarType> =
  | { type?: Type; optional: boolean }
  | { type: Type }
  | { type?: Type; default: EnvVarTypeJsTypeMap[Type] };

type EnvVarOptions = { [name: string]: EnvVarOption };

type InferTypeFromTypeString<Option extends EnvVarOption> = Option extends {
  type?: infer Type;
}
  ? Type extends EnvVarType
    ? EnvVarTypeJsTypeMap[Type]
    : unknown
  : Option extends {
        default: infer DefaultType;
      }
    ? DefaultType
    : string;

type InferredOptionDataType<Option extends EnvVarOption> = Option extends {
  default: infer DefaultType;
}
  ? InferTypeFromTypeString<Option> | DefaultType
  : InferTypeFromTypeString<Option>;

type InferredOptionType<Option extends EnvVarOption> = Option extends {
  optional: true;
}
  ? InferredOptionDataType<Option> | null
  : InferredOptionDataType<Option>;

type InferredEnvVars<Options extends EnvVarOptions> = {
  [key in keyof Options]: InferredOptionType<Options[key]>;
};

const valueParsers: {
  [type in EnvVarType]: (
    valueString: string,
    name: string
  ) => EnvVarTypeJsTypeMap[type];
} = {
  boolean: (valueString, name) => {
    const lowerValue = valueString.toLowerCase();

    if (lowerValue !== "true" && lowerValue !== "false") {
      throw new Error(
        `Expected ${name} to be either "true" or "false", but received "${valueString}".`
      );
    }

    return lowerValue === "true";
  },
  date: (valueString, name) => {
    const asDate = new Date(valueString);

    if (isNaN(asDate.getTime())) {
      throw new Error(
        `Expected ${name} to be a valid date or date/time, but received "${valueString}".`
      );
    }

    return asDate;
  },
  string: (valueStr) => {
    return valueStr;
  },
  number: (valueString, name) => {
    const asNumber = parseFloat(valueString);

    if (isNaN(asNumber)) {
      throw new Error(
        `Expected ${name} to be a valid number, but received "${valueString}".`
      );
    }

    return asNumber;
  },
};

const assertIsEnvVarType: TypeAssertion<EnvVarType> = isUnionOf(
  isLiteral("string"),
  isLiteral("boolean"),
  isLiteral("number"),
  isLiteral("date")
).assert;

type ResolvedEnvVar = {
  type: EnvVarType;
  name: string;
} & (
  | {
      default: EnvVarTypeJsTypeMap[EnvVarType];
    }
  | {
      optional: boolean;
    }
);

const resolveVariableOptions = (
  name: string,
  option: EnvVarOption
): ResolvedEnvVar => {
  const type =
    option.type ?? ("default" in option ? typeof option.default : "string");
  assertIsEnvVarType(type);

  const optionalOrDefault =
    "default" in option
      ? { default: option.default }
      : "optional" in option
        ? { optional: option.optional }
        : { optional: false };

  return {
    name,
    type,
    ...optionalOrDefault,
  };
};

export const conv = <Vars extends EnvVarOptions>(
  vars: Vars
): InferredEnvVars<Vars> => {
  config();

  return Object.entries(vars).reduce<{
    [key: string]: string | number | boolean | Date | null;
  }>((acc, [name, varOption]) => {
    const variable = resolveVariableOptions(name, varOption);
    const value = env[variable.name] || null;

    if (value === null && "optional" in variable && variable.optional) {
      acc[variable.name] = null;
      return acc;
    }

    if (value === null && "default" in variable) {
      acc[variable.name] = variable.default;
      return acc;
    }

    assertIsNotNullish(
      value,
      `Expected environment variable ${variable.name} to be defined, but it was "${env[variable.name]}".`
    );

    acc[variable.name] = valueParsers[variable.type](value, variable.name);

    return acc;
  }, {}) as InferredEnvVars<Vars>;
};
