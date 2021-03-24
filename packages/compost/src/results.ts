import { hasStringProperty } from "@bickley-wallace/utilities";
export interface Success<Value> {
  success: true;
  value: Value;
}

export interface Failure<Reason extends string> {
  success: false;
  reason: Reason;
  message: string;
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

export const failure = <Reason extends string>(reason: Reason, message?: string): Failure<Reason> => ({
  success: false,
  reason,
  message: message ?? reason
});

export const repackError = <Value, FailureReason extends string>(
  result: Result<Value, string>,
  newFailureReasons: FailureReason,
  failureMessagePrefix: string
): Result<Value, FailureReason> => {
  return result.success
    ? result
    : failure(newFailureReasons, `${failureMessagePrefix}\n${result.reason}: ${result.message}`);
};

export const errorMessage = (err: unknown): string => {
  return typeof err === "object" && err !== null && hasStringProperty(err, "message")
    ? err.message
    : JSON.stringify(err);
};

