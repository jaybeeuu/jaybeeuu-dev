export type TitleCase<Value extends string> = Value extends `${infer Prefix}-${infer Suffix}`
  ? `${Capitalize<Prefix>} ${TitleCase<Suffix>}`
  : Capitalize<Value>;

export const titleCase = <Value extends string>(kebabCase: Value): TitleCase<Value> => {
  return kebabCase
    .split("-")
    .map(([first, ...rest]) => [first?.toUpperCase(), ... rest].join(""))
    .join(" ") as TitleCase<Value>;
};
