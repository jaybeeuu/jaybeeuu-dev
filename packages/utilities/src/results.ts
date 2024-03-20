import { assertIsNotNullish } from "./type-guards/index.js";

export interface Success<Value> {
  success: true;
  value: Value;
}

const getPublicStack = (error: Error, framesSincePublic: number): string => {
  const { message, name, stack } = error;
  assertIsNotNullish(stack);
  const messageAndName = `${name}: ${message}`;
  const stackIncludesMessage = stack.startsWith(messageAndName);
  const stackWithoutMessage = stackIncludesMessage
    ? stack.replace(messageAndName, "")
    : stack;
  const stackFrames = stackWithoutMessage.trim().split("\n");
  const publicFrames = stackFrames.slice(framesSincePublic);
  const publicStack = publicFrames.join("\n");
  return stackIncludesMessage
    ? `${messageAndName}\n${publicStack}`
    : publicStack;
};

export type FailureName<Reason extends string> = `Failure(${Reason})`;
export class Failure<Reason extends string> extends Error {
  public readonly name: FailureName<Reason>;
  public readonly success = false;
  public readonly reason: string;
  public readonly messageOrError: unknown;

  constructor(
    reason: Reason,
    messageOrError: unknown,
    framesSincePublic: number,
  ) {
    super(
      messageOrError instanceof Error
        ? messageOrError.message
        : String(messageOrError),
    );
    this.messageOrError = messageOrError;
    this.name = `Failure(${reason})`;
    this.reason = reason;

    if (this.stack?.startsWith("Error")) {
      this.stack = this.stack.replace("Error", this.name);
    }
    this.stack =
      messageOrError instanceof Error && messageOrError.stack
        ? messageOrError.stack
        : getPublicStack(this, framesSincePublic);
  }
}

export type Result<Value, FailureReason extends string> =
  | Success<Value>
  | Failure<FailureReason>;
export type FailureReasons<Res> =
  Res extends Result<unknown, infer FailureReason> ? FailureReason : never;

export function success(): Success<never>;
export function success<Value>(value: Value): Success<Value>;
export function success<Value>(value?: Value): Success<Value> {
  return { success: true, value: value as Value };
}

const failure = <Reason extends string>(
  reason: Reason,
  messageOrError?: unknown,
  framesSincePublic: number = 1,
): Failure<Reason> => {
  return new Failure(
    reason,
    messageOrError ?? "{No message}",
    framesSincePublic,
  );
};

const repackError = <Value, FailureReason extends string>(
  result: Result<Value, string>,
  newFailureReasons: FailureReason,
  failureMessagePrefix: string,
  framesSincePublic: number = 1,
): Result<Value, FailureReason> => {
  return result.success
    ? result
    : failure(
        newFailureReasons,
        `${failureMessagePrefix}\n${result.reason}: ${result.message}`,
        framesSincePublic + 1,
      );
};

const exportedFailure: <Reason extends string>(
  reason: Reason,
  messageOrError?: unknown,
) => Failure<Reason> = failure;
const exportedRepackError: <Value, FailureReason extends string>(
  result: Result<Value, string>,
  newFailureReasons: FailureReason,
  failureMessagePrefix: string,
) => Result<Value, FailureReason> = repackError;
export { exportedFailure as failure, exportedRepackError as repackError };
