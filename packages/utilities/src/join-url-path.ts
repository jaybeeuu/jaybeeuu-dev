
export const joinUrlPath = (...pathFragments: string[]): string => {
  const builtPath = pathFragments
    .map((fragment) => fragment.replace(/(^\/|\/$)/g, ""))
    .filter(Boolean)
    .join("/");
  return `/${builtPath}`;
};
