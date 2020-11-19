export const asError = (candidate: unknown): Error => {
  if (candidate instanceof Error) {
    return candidate;
  }
  const err = new Error(JSON.stringify(candidate, null, 2));
  const stackArr = err.stack?.split("\n") ?? [];
  const [head,, ...rest] = stackArr; // Skip this function
  err.stack = [head, ...rest].join("\n");
  return err;
};
