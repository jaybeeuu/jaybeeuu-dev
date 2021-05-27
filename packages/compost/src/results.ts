import { assertIsNotNullish } from "@bickley-wallace/utilities";

export interface Success<Value> {
  success: true;
  value: Value;
}

export type FailureName<Reason extends string> = `Failure(${Reason})`;
export interface FailureError<Reason extends string> extends Error {
  name: FailureName<Reason>;
}

export interface Failure<Reason extends string> extends FailureError<Reason> {
  success: false;
  reason: Reason;
  name: FailureName<Reason>;
}

export type Result<Value, FailureReason extends string> = Success<Value> | Failure<FailureReason>;
export type FailureReasons<Res> = Res extends Result<any, infer FailureReason>
  ? FailureReason
  : never;

export function success(): Success<never>;
export function success<Value>(value: Value): Success<Value>;
export function success<Value>(value?: Value): Success<Value> {
  return { success: true, value: value as Value };
}

const getError = <Reason extends string>(
  reason: Reason,
  messageOrError: string | Error | undefined,
  framesSincePublic: number
): FailureError<Reason> => {
  if (messageOrError instanceof Error) {

    return {
      ...messageOrError,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      name: `Failure(${reason})` as FailureName<Reason>
    };
  }

  const error = new Error("");
  const stack = error.stack;
  assertIsNotNullish(stack);
  const publicStack = stack.slice(1 + framesSincePublic);

  return {
    ...error,
    stack: publicStack,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    name: `Failure(${reason})` as FailureName<Reason>,
    message: messageOrError ?? ""
  };
};

const failure = <Reason extends string>(reason: Reason, messageOrError?: string | Error, framesSincePublic: number = 1): Failure<Reason> => {
  const error = getError(reason, messageOrError, framesSincePublic);

  return {
    success: false,
    reason,
    ...error
  };
};

const repackError = <Value, FailureReason extends string>(
  result: Result<Value, string>,
  newFailureReasons: FailureReason,
  failureMessagePrefix: string,
  framesSincePublic: number = 1
): Result<Value, FailureReason> => {
  return result.success
    ? result
    : failure(
      newFailureReasons,
      `${failureMessagePrefix}\n${result.reason}: ${result.message}`,
      framesSincePublic + 1
    );
};

const exportedFailure: <Reason extends string>(reason: Reason, messageOrError?: string | Error) => Failure<Reason> = failure;
const exportedRepackError: <Value, FailureReason extends string>(
  result: Result<Value, string>,
  newFailureReasons: FailureReason,
  failureMessagePrefix: string
) => Result<Value, FailureReason> = repackError;
export {
  exportedFailure as failure,
  exportedRepackError as repackError
};
