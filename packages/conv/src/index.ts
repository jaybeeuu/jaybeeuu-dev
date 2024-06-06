import { assertIsNotNullish, isLiteral, isObject } from "@jaybeeuu/is";
import { config } from "dotenv";
import { env } from "node:process";

const getVar = (variable: string): string => {
  const value = env[variable] || null;
  assertIsNotNullish(
    value,
    `Expected environment variable ${variable} to be defined, but it was "${env[variable]}".`,
  );
  return value;
};

type EnvVarOption<Name extends string = string> =
  | Name
  | { name: Name; optional: true }
  | { name: Name; default: string };
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
  [Key in EnvVarNames<Vars>]: NameEnvVarMap<Vars>[Key] extends { name: Key }
    ? NameEnvVarMap<Vars>[Key] extends { optional: true }
      ? string | null
      : string
    : string;
};

const isOptionalVar = isObject({ optional: isLiteral(true) });

export const conv = <Vars extends EnvVarOption[]>(
  ...vars: [...Vars]
): EnvValues<Vars> => {
  config();
  return vars.reduce<{ [key: string]: string | null }>((acc, varOption) => {
    if (typeof varOption === "string") {
      acc[varOption] = getVar(varOption);
    } else {
      acc[varOption.name] =
        env[varOption.name] || isOptionalVar(varOption)
          ? env[varOption.name] ?? null
          : varOption.default;
    }

    return acc;
  }, {}) as EnvValues<Vars>;
};
