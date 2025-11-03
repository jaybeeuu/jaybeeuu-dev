import type { TypePredicate } from "@jaybeeuu/is";
import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import yaml from "js-yaml";

export type LoadYamlFailureReason = "front matter yaml parse failure";

const loadYaml = (yamlText: string): Result<unknown, LoadYamlFailureReason> => {
  try {
    const parsedYaml = yaml.load(yamlText);
    return success(parsedYaml);
  } catch (error) {
    return failure("front matter yaml parse failure", error);
  }
};

export type ParseYamlMetaFailureReason =
  | LoadYamlFailureReason
  | "yaml metadata invalid";

export const parseYamlMeta = <T>(
  yamlMeta: string,
  validator: TypePredicate<T>,
): Result<T, ParseYamlMetaFailureReason> => {
  const yamlResult = loadYaml(yamlMeta);
  if (!yamlResult.success) {
    return yamlResult;
  }

  const parsedYaml = yamlResult.value;
  const validationResult = validator.validate(parsedYaml);

  if (validationResult.valid) {
    return success(parsedYaml as T);
  }

  return failure(
    "yaml metadata invalid",
    validationResult.errorMessages.join("; "),
  );
};
