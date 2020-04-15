export enum ResultState {
  success= "success",
  failure= "failure"
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

function success(): Success<void>;
function success<TValue>(value: TValue): Success<TValue>;
function success<TValue>(value?: TValue): Success<TValue> {
  return {
    state: ResultState.success,
    value: value as TValue
  };
}

export { success };

export const failure = (message: string): Failure => ({
  state: ResultState.failure,
  message
});