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

type EnvVarOptionWithType<Type extends EnvVarType> = Type extends EnvVarType
  ?
      | { type: Type; optional?: true }
      | { type?: Type; default: EnvVarTypeJsTypeMap[Type] }
  : never;

type EnvVarOption<
  Name extends string = string,
  Type extends EnvVarType = EnvVarType,
> = Name | ({ name: Name } & EnvVarOptionWithType<Type>);

type EnvVarOptions = readonly EnvVarOption[];

type EnvVars<Vars extends EnvVarOptions> = Vars[number];

type NameOf<Var extends EnvVarOption> = Var extends { name: infer Name }
  ? Name
  : Var;

type EnvVarNames<Vars extends EnvVarOptions> = NameOf<Vars[number]>;

type NameEnvVarMap<Vars extends EnvVarOptions> = {
  [Key in EnvVarNames<Vars>]: Extract<EnvVars<Vars>, Key | { name: Key }>;
};

type EnvValues<Vars extends EnvVarOptions> = {
  [Key in EnvVarNames<Vars>]: NameEnvVarMap<Vars>[Key] extends EnvVarOptionWithType<
    infer Type
  >
    ? NameEnvVarMap<Vars>[Key] extends { optional: true }
      ? EnvVarTypeJsTypeMap[Type] | null
      : EnvVarTypeJsTypeMap[Type]
    : string;
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

const resolveVariableOptions = (option: EnvVarOption): ResolvedEnvVar => {
  if (typeof option === "string") {
    return { type: "string", name: option, optional: false };
  }

  const type = option.type ?? typeof option.default;
  assertIsEnvVarType(type);

  const optionalOrDefault =
    "default" in option
      ? { default: option.default }
      : { optional: option.optional ?? false };

  return {
    name: option.name,
    type,
    ...optionalOrDefault,
  };
};

export const conv = <Vars extends EnvVarOption[]>(
  ...vars: Vars
): EnvValues<Vars> => {
  config();
  return vars.reduce<{
    [key: string]: string | number | boolean | Date | null;
  }>((acc, varOption) => {
    const variable = resolveVariableOptions(varOption);
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
  }, {}) as EnvValues<Vars>;
};
