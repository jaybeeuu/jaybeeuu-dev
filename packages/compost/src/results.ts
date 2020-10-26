export enum ResultState {
  // eslint-disable-next-line no-shadow
  success = "success",
  failure = "failure"
}

export interface Success<TValue> {
  state: ResultState.success;
  value: TValue;
}

export interface Failure {
  state: ResultState.failure;
  message: string;
}

export type Result<TValue> = Success<TValue> | Failure;

export function success(): Success<never>;
export function success<TValue>(value: TValue): Success<TValue>;
export function success<Value>(value?: Value): Success<Value> {
  return { state: ResultState.success, value: value as Value };
}

export const failure = (message: string): Failure => ({
  state: ResultState.failure,
  message
});
